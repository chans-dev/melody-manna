import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchSongs } from "@/services/musicService";
import { Song } from "@/types/music";
import SearchBar from "@/components/SearchBar";
import MusicPlayer from "@/components/MusicPlayer";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["songs", searchQuery],
    queryFn: () => searchSongs(searchQuery),
    enabled: !!searchQuery,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch songs. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-player-background text-white p-6">
      <div className="container mx-auto pb-32">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Devotional Music Stream
        </h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="animate-pulse-light">Loading...</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.results.map((song) => (
            <div
              key={song.id}
              className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
              onClick={() => handleSongSelect(song)}
            >
              <img
                src={song.image.find(img => img.quality === "150x150")?.url || song.image[0].url}
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

      <MusicPlayer song={selectedSong} />
    </div>
  );
};

export default Index;