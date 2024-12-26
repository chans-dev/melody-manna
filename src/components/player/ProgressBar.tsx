import React from "react";
import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onTimeChange: (value: number[]) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onTimeChange,
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">{formatTime(currentTime)}</span>
      <Slider
        value={[currentTime]}
        max={duration || 100}
        step={1}
        onValueChange={onTimeChange}
        className="flex-1"
      />
      <span className="text-sm">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;