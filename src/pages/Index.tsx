import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { searchSongs } from "@/services/musicService";
import { getSongSuggestions } from "@/services/suggestionService";
import { Song } from "@/types/music";
import SearchBar from "@/components/SearchBar";
import MusicPlayer from "@/components/MusicPlayer";
import DeitySection from "@/components/home/DeitySection";
import { useToast } from "@/components/ui/use-toast";

interface DeityCategory {
  name: string;
  searchTerm: string;
}

interface DeityPageData {
  items: Array<{
    deity: string;
    songs: Song[];
  }>;
  nextPage: number;
}

const getDaySpecificDeity = () => {
  const day = new Date().getDay();
  switch (day) {
    case 0: return "Krishna"; // Sunday
    case 1: return "Shiva"; // Monday
    case 2: return "Hanuman"; // Tuesday
    case 3: return "Krishna"; // Wednesday
    case 4: return "Vishnu"; // Thursday
    case 5: return "Durga"; // Friday
    case 6: return "Hanuman"; // Saturday
    default: return "Krishna";
  }
};

const deityCategories: DeityCategory[] = [
  { name: "Ganesh", searchTerm: "Ganesh Aarti" },
  { name: "Krishna", searchTerm: "Krishna Bhajan" },
  { name: "Shiva", searchTerm: "Shiv Bhajan" },
  { name: "Durga", searchTerm: "Durga Aarti" },
  { name: "Hanuman", searchTerm: "Hanuman Chalisa" },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentSongList, setCurrentSongList] = useState<Song[]>([]);
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver>();

  const todaysDeity = getDaySpecificDeity();

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["songs", searchQuery],
    queryFn: () => searchSongs(searchQuery),
    enabled: !!searchQuery,
  });

  const { data: todaysSongs, isLoading: todayLoading } = useQuery({
    queryKey: ["todaysSongs", todaysDeity],
    queryFn: () => searchSongs(`${todaysDeity} Bhajan`),
  });

  const {
    data: infiniteDeityData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<DeityPageData>({
    queryKey: ["infiniteDeities"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const results = await Promise.all(
        deityCategories.slice(pageParam * 2, (pageParam + 1) * 2).map(deity =>
          searchSongs(deity.searchTerm).then(res => ({
            deity: deity.name,
            songs: res.data.results
          }))
        )
      );
      return { items: results, nextPage: pageParam + 1 };
    },
    getNextPageParam: (lastPage: DeityPageData) => {
      const hasMore = lastPage.nextPage * 2 < deityCategories.length;
      return hasMore ? lastPage.nextPage : undefined;
    },
  });

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      if (searchResults?.data.results) {
        setCurrentSongList(searchResults.data.results);
      }
    } else {
      if (todaysSongs?.data.results) {
        setCurrentSongList(todaysSongs.data.results);
      }
    }
  };

  const handleSongSelect = async (song: Song, songList: Song[]) => {
    setSelectedSong(song);
    setCurrentSongList(songList);
    
    try {
      const suggestions = await getSongSuggestions(song.id);
      setCurrentSongList(prevList => [...prevList, ...suggestions]);
    } catch (error) {
      console.error("Failed to fetch song suggestions:", error);
    }
  };

  const handleNextSong = () => {
    if (currentSongList.length > 0 && selectedSong) {
      const currentIndex = currentSongList.findIndex(song => song.id === selectedSong.id);
      const nextIndex = (currentIndex + 1) % currentSongList.length;
      setSelectedSong(currentSongList[nextIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-player-background text-foreground p-6">
      <div className="container mx-auto pb-32">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Divine Music Stream
        </h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {searchQuery ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults?.data.results.map((song) => (
              <div
                key={song.id}
                className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => handleSongSelect(song, searchResults.data.results)}
              >
                <img
                  src={song.image.find(img => img.quality === "500x500")?.url || 
                       song.image.find(img => img.quality === "150x150")?.url || 
                       song.image[0].url}
                  alt={song.name}
                  className="w-full aspect-square object-cover rounded-md mb-4"
                />
                <h3 className="font-semibold truncate">{song.name}</h3>
                <p className="text-sm opacity-80 truncate">
                  {song.artists.primary.map(artist => artist.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {!todayLoading && todaysSongs && (
              <DeitySection
                title={`Today's Special: ${todaysDeity} Bhajans`}
                songs={todaysSongs.data.results.slice(0, 3)}
                onSongSelect={handleSongSelect}
              />
            )}

            {infiniteDeityData?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page.items.map((category, index) => (
                  <div
                    ref={
                      pageIndex === infiniteDeityData.pages.length - 1 &&
                      index === page.items.length - 1
                        ? lastElementRef
                        : undefined
                    }
                    key={category.deity}
                  >
                    <DeitySection
                      title={`${category.deity} Bhajans`}
                      songs={category.songs.slice(0, 3)}
                      onSongSelect={handleSongSelect}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}

            {isFetchingNextPage && (
              <div className="text-center py-4">Loading more...</div>
            )}
          </>
        )}
      </div>

      <MusicPlayer song={selectedSong} onNextSong={handleNextSong} />
    </div>
  );
};

export default Index;