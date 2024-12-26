export interface Song {
  id: string;
  name: string;
  type: string;
  duration: string | null;
  language: string;
  url: string;
  album: {
    id: string | null;
    name: string | null;
    url: string | null;
  };
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  image: ImageQuality[];
  downloadUrl: AudioQuality[];
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: ImageQuality[];
  url: string;
}

export interface ImageQuality {
  quality: string;
  url: string;
}

export interface AudioQuality {
  quality: string;
  url: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: Song[];
  };
}

export interface DeityPageData {
  items: Array<{
    deity: string;
    songs: Song[];
  }>;
  nextPage: number;
}