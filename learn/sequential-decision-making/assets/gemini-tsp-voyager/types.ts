export interface City {
  id: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  emoji: string;
  description: string;
}

export interface GameState {
  cities: City[];
  userPath: string[]; // Array of City IDs
  isPlaying: boolean;
  score: number | null;
  bestPossibleScore: number | null;
  optimalPath: string[] | null; // Array of City IDs
  message: string;
}

export interface CityGenerationResponse {
  name: string;
  emoji: string;
  description: string;
  x: number;
  y: number;
}
