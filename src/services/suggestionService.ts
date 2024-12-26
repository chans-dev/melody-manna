import { Song } from "@/types/music";

export const getSongSuggestions = async (songId: string, limit: number = 10): Promise<Song[]> => {
  const response = await fetch(
    `https://jiosaavan-api2.onrender.com/api/songs/${songId}/suggestions?limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch song suggestions");
  }

  const data = await response.json();
  return data.data;
};