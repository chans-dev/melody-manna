import React, { useState, useRef, useEffect } from "react";
import { Song, AudioQuality } from "@/types/music";
import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import PlayerControls from "./player/PlayerControls";
import QualitySelector from "./player/QualitySelector";
import ProgressBar from "./player/ProgressBar";

interface MusicPlayerProps {
  song: Song | null;
  onNextSong?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song, onNextSong }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("128");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (song && audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play().catch((error) => {
        toast({
          title: "Playback Error",
          description: "Unable to play the audio. Please try again.",
          variant: "destructive",
        });
      });
    }
  }, [song]);

  const getAudioUrl = (qualities: AudioQuality[]): string => {
    const quality = qualities.find((q) => q.quality === selectedQuality);
    return quality?.url || qualities[0].url;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          toast({
            title: "Playback Error",
            description: "Unable to play the audio. Please try again.",
            variant: "destructive",
          });
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleQualityChange = (quality: string) => {
    const wasPlaying = isPlaying;
    const currentTime = audioRef.current?.currentTime || 0;
    setSelectedQuality(quality);
    if (audioRef.current && song) {
      audioRef.current.src = getAudioUrl(song.downloadUrl);
      audioRef.current.currentTime = currentTime;
      if (wasPlaying) {
        audioRef.current.play();
      }
    }
  };

  const handleSongEnd = () => {
    setIsPlaying(false);
    if (onNextSong) {
      onNextSong();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-player-background text-player-foreground p-4 shadow-lg">
      <audio
        ref={audioRef}
        src={song ? getAudioUrl(song.downloadUrl) : ""}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
      />

      <div className="container mx-auto flex flex-col space-y-4">
        {song && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={song.image.find(img => img.quality === "500x500")?.url || 
                       song.image.find(img => img.quality === "150x150")?.url || 
                       song.image[0].url}
                  alt={song.name}
                  className="w-12 h-12 rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{song.name}</h3>
                  <p className="text-sm opacity-80">
                    {song.artists.primary.map(artist => artist.name).join(", ")}
                  </p>
                </div>
              </div>

              <QualitySelector
                qualities={song.downloadUrl}
                selectedQuality={selectedQuality}
                onQualityChange={handleQualityChange}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <PlayerControls isPlaying={isPlaying} onPlayPause={handlePlayPause} />

              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onTimeChange={handleSliderChange}
              />

              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;