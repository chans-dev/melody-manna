import React, { useState, useRef } from "react";
import { Song, AudioQuality } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Play, Pause, Volume2 } from "lucide-react";

interface MusicPlayerProps {
  song: Song | null;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("128");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleQualityChange = (quality: string) => {
    const currentTime = audioRef.current?.currentTime || 0;
    setSelectedQuality(quality);
    if (audioRef.current && song) {
      audioRef.current.src = getAudioUrl(song.downloadUrl);
      audioRef.current.currentTime = currentTime;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-player-background text-player-foreground p-4 shadow-lg">
      <audio
        ref={audioRef}
        src={song ? getAudioUrl(song.downloadUrl) : ""}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="container mx-auto flex flex-col space-y-4">
        {song && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={song.image.find(img => img.quality === "150x150")?.url || song.image[0].url}
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

              <div className="flex items-center space-x-4">
                <Select value={selectedQuality} onValueChange={handleQualityChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {song.downloadUrl.map((quality) => (
                      <SelectItem key={quality.quality} value={quality.quality}>
                        {quality.quality}kbps
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">{formatTime(currentTime)}</span>
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSliderChange}
                  className="flex-1"
                />
                <span className="text-sm">{formatTime(duration)}</span>
              </div>

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