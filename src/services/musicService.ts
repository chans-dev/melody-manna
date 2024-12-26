import { SearchResponse } from "@/types/music";

const API_BASE_URL = "https://jiosaavan-api2.onrender.com/api";

export const searchSongs = async (query: string): Promise<SearchResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch songs");
  }

  return response.json();
};