import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({ isPlaying, onPlayPause }) => (
  <div className="flex items-center justify-center space-x-4">
    <Button
      variant="ghost"
      size="icon"
      className="h-12 w-12 rounded-full"
      onClick={onPlayPause}
    >
      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
    </Button>
  </div>
);

export default PlayerControls;