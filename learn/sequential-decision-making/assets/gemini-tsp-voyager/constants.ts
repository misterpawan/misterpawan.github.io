import { City } from './types';

export const ALL_CITIES: City[] = [
  {
    id: 'newyork',
    name: 'New York',
    x: 29,
    y: 35,
    emoji: '🗽',
    description: 'The concrete jungle where dreams are made of.',
  },
  {
    id: 'paris',
    name: 'Paris',
    x: 48,
    y: 32,
    emoji: '🗼',
    description: 'The City of Light, known for the Eiffel Tower and art.',
  },
  {
    id: 'sanfrancisco',
    name: 'San Francisco',
    x: 15,
    y: 38,
    emoji: '🌉',
    description: 'Home to the Golden Gate Bridge and steep rolling hills.',
  },
  {
    id: 'saopaulo',
    name: 'São Paulo',
    x: 35,
    y: 75,
    emoji: '🇧🇷',
    description: 'The vibrant financial center and largest city in Brazil.',
  },
  {
    id: 'berlin',
    name: 'Berlin',
    x: 52,
    y: 28,
    emoji: '🐻',
    description: 'A global hub of culture, history, and nightlife.',
  },
  {
    id: 'beijing',
    name: 'Beijing',
    x: 78,
    y: 35,
    emoji: '🐉',
    description: 'The capital of China, known for the Forbidden City.',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    x: 68,
    y: 52,
    emoji: '🇮🇳',
    description: 'The bustling entertainment and financial capital of India.',
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    x: 88,
    y: 38,
    emoji: '🏯',
    description: 'A neon-lit mix of the ultramodern and the traditional.',
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    x: 53,
    y: 85,
    emoji: '⛰️',
    description: 'Port city on South Africa’s southwest coast beneath Table Mountain.',
  },
  {
    id: 'sydney',
    name: 'Sydney',
    x: 92,
    y: 82,
    emoji: '🐨',
    description: 'Famous for its Opera House and harbor-side life.',
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    x: 88,
    y: 88,
    emoji: '☕',
    description: 'Known for coffee culture, arts, and laneways.',
  },
];

export const INITIAL_CITIES: City[] = ALL_CITIES.filter(c => 
  ['newyork', 'berlin', 'mumbai', 'melbourne'].includes(c.id)
);