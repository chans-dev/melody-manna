import React from "react";
import { AudioQuality } from "@/types/music";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QualitySelectorProps {
  qualities: AudioQuality[];
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({
  qualities,
  selectedQuality,
  onQualityChange,
}) => (
  <Select value={selectedQuality} onValueChange={onQualityChange}>
    <SelectTrigger className="w-[100px] bg-white/10 text-player-foreground">
      <SelectValue placeholder="Quality" />
    </SelectTrigger>
    <SelectContent>
      {qualities.map((quality) => (
        <SelectItem key={quality.quality} value={quality.quality}>
          {quality.quality}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default QualitySelector;