import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSongs } from "@/services/musicService";
import { Song } from "@/types/music";
import SearchBar from "@/components/SearchBar";
import MusicPlayer from "@/components/MusicPlayer";
import { useToast } from "@/components/ui/use-toast";

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

const deityCategories = [
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

  const todaysDeity = getDaySpecificDeity();
  
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ["songs", searchQuery],
    queryFn: () => searchSongs(searchQuery),
    enabled: !!searchQuery,
  });

  // Query for today's special deity songs
  const { data: todaysSongs, isLoading: todayLoading } = useQuery({
    queryKey: ["todaysSongs", todaysDeity],
    queryFn: () => searchSongs(`${todaysDeity} Bhajan`),
  });

  // Queries for different deity categories
  const deitySongs = useQuery({
    queryKey: ["deitySongs"],
    queryFn: async () => {
      const results = await Promise.all(
        deityCategories.map(deity => 
          searchSongs(deity.searchTerm).then(res => ({
            deity: deity.name,
            songs: res.data.results
          }))
        )
      );
      return results;
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      // Update current song list with search results when searching
      if (searchResults?.data.results) {
        setCurrentSongList(searchResults.data.results);
      }
    } else {
      // Reset to today's songs when search is cleared
      if (todaysSongs?.data.results) {
        setCurrentSongList(todaysSongs.data.results);
      }
    }
  };

  const handleSongSelect = (song: Song, songList: Song[]) => {
    setSelectedSong(song);
    setCurrentSongList(songList);
  };

  const handleNextSong = () => {
    if (currentSongList.length > 0 && selectedSong) {
      const currentIndex = currentSongList.findIndex(song => song.id === selectedSong.id);
      const nextIndex = (currentIndex + 1) % currentSongList.length;
      setSelectedSong(currentSongList[nextIndex]);
    }
  };

  const getHighestQualityImage = (images: { quality: string; url: string }[]) => {
    const qualityOrder = ["500x500", "150x150", "50x50"];
    for (const quality of qualityOrder) {
      const image = images.find(img => img.quality === quality);
      if (image) return image.url;
    }
    return images[0]?.url;
  };

  if (searchError) {
    toast({
      title: "Error",
      description: "Failed to fetch songs. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-player-background text-foreground p-6">
      <div className="container mx-auto pb-32">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Divine Music Stream
        </h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Today's Special Section */}
        {!searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              Today's Special: {todaysDeity} Bhajans
            </h2>
            {todayLoading ? (
              <div className="text-center">
                <div className="animate-pulse-light">Loading today's songs...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaysSongs?.data.results.slice(0, 3).map((song) => (
                  <div
                    key={song.id}
                    className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => handleSongSelect(song, todaysSongs.data.results)}
                  >
                    <img
                      src={getHighestQualityImage(song.image)}
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
            )}
          </div>
        )}

        {/* Deity Categories */}
        {!searchQuery && !deitySongs.isLoading && deitySongs.data?.map((category, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">
              {category.deity} Bhajans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.songs.slice(0, 3).map((song) => (
                <div
                  key={song.id}
                  className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => handleSongSelect(song, category.songs)}
                >
                  <img
                    src={getHighestQualityImage(song.image)}
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
          </div>
        ))}

        {/* Search Results */}
        {searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults?.data.results.map((song) => (
              <div
                key={song.id}
                className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => handleSongSelect(song, searchResults.data.results)}
              >
                <img
                  src={getHighestQualityImage(song.image)}
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
        )}
      </div>

      <MusicPlayer song={selectedSong} onNextSong={handleNextSong} />
    </div>
  );
};

export default Index;