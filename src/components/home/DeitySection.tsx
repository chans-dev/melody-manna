import React from "react";
import { Song } from "@/types/music";

interface DeitySectionProps {
  title: string;
  songs: Song[];
  onSongSelect: (song: Song, songList: Song[]) => void;
}

const DeitySection: React.FC<DeitySectionProps> = ({ title, songs, onSongSelect }) => {
  const getHighestQualityImage = (images: { quality: string; url: string }[]) => {
    const qualityOrder = ["500x500", "150x150", "50x50"];
    for (const quality of qualityOrder) {
      const image = images.find(img => img.quality === quality);
      if (image) return image.url;
    }
    return images[0]?.url;
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
            onClick={() => onSongSelect(song, songs)}
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
  );
};

export default DeitySection;