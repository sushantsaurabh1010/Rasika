
import type { LucideIcon } from 'lucide-react';
import { Smile, Wind, Sparkles, Zap, Brain, CloudRain, Film, Tv2, BookOpenText, Music2, Mic2, History, Palette, Aperture, Drama, Ghost, Rocket, Heart, Search, ComedyClub, Users, Atom, Feather, Wand2, Bot, Video, Library, Headphones, Podcast, School, LandPlot, HandCoins, Castle, Music3, Guitar, Disc3, Mic, Newspaper, Lightbulb, DramaIcon, Languages } from 'lucide-react';

export interface MoodThemePalette {
  background: string; // HSL values like "45 100% 95%"
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface SelectableItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export interface SelectableMoodItem extends SelectableItem {
  palette?: MoodThemePalette;
}

export interface SelectableGenre extends SelectableItem {
  applicableToContentTypes: string[];
}


export const MOODS: SelectableMoodItem[] = [
  { 
    id: 'happy', 
    label: 'Happy', 
    icon: Smile,
    palette: {
      background: "45 100% 96%", // Light warm yellow
      foreground: "30 70% 25%",   // Dark warm brown
      card: "40 100% 99%",
      cardForeground: "30 70% 25%",
      popover: "40 100% 99%",
      popoverForeground: "30 70% 25%",
      primary: "35 100% 60%",   // Bright orange
      primaryForeground: "30 100% 10%", // White for contrast
      secondary: "50 80% 85%",   // Lighter yellow
      secondaryForeground: "40 70% 30%",
      muted: "45 60% 94%",
      mutedForeground: "40 30% 50%",
      accent: "180 70% 55%",   // Contrasting cyan
      accentForeground: "180 100% 10%",
      border: "35 80% 88%",
      input: "40 80% 97%",
      ring: "35 100% 50%",
    }
  },
  { 
    id: 'calm', 
    label: 'Calm', 
    icon: Wind,
    palette: {
      background: "190 60% 97%", // Very light, soft cyan
      foreground: "200 30% 30%",   // Soft, dark grayish blue
      card: "195 50% 100%",
      cardForeground: "200 30% 30%",
      popover: "195 50% 100%",
      popoverForeground: "200 30% 30%",
      primary: "180 55% 60%",   // Soft teal
      primaryForeground: "180 100% 10%", // Dark teal for text
      secondary: "200 40% 92%",   // Light blue-gray
      secondaryForeground: "200 30% 40%",
      muted: "210 30% 96%",
      mutedForeground: "210 20% 55%",
      accent: "220 50% 70%",   // Soft lavender
      accentForeground: "220 100% 15%",
      border: "200 35% 88%",
      input: "200 40% 97%",
      ring: "180 55% 50%",
    }
  },
  { 
    id: 'excited', 
    label: 'Excited', 
    icon: Sparkles,
    palette: {
      background: "330 100% 97%", // Very light pink
      foreground: "340 60% 25%",   // Dark magenta/purple
      card: "335 100% 99%",
      cardForeground: "340 60% 25%",
      popover: "335 100% 99%",
      popoverForeground: "340 60% 25%",
      primary: "325 100% 60%",   // Vibrant pink
      primaryForeground: "330 100% 10%",
      secondary: "340 90% 88%",   // Lighter pink
      secondaryForeground: "330 70% 40%",
      muted: "330 70% 95%",
      mutedForeground: "330 40% 55%",
      accent: "45 100% 55%",    // Bright gold/yellow
      accentForeground: "45 100% 10%",
      border: "330 80% 90%",
      input: "330 80% 98%",
      ring: "325 100% 50%",
    }
  },
  { 
    id: 'energetic', 
    label: 'Energetic', 
    icon: Zap,
    palette: {
      background: "15 100% 96%", // Light, bright orange
      foreground: "0 70% 30%",     // Dark, rich red-brown
      card: "10 100% 99%",
      cardForeground: "0 70% 30%",
      popover: "10 100% 99%",
      popoverForeground: "0 70% 30%",
      primary: "0 85% 70%",     // Lighter red (was 0 90% 60%)
      primaryForeground: "0 100% 10%", // Dark text for contrast
      secondary: "20 90% 85%",    // Lighter orange
      secondaryForeground: "10 70% 40%",
      muted: "15 60% 94%",
      mutedForeground: "10 30% 50%",
      accent: "205 100% 55%",  // Electric blue
      accentForeground: "205 100% 10%",
      border: "10 80% 88%",
      input: "15 80% 97%",
      ring: "0 85% 60%", // Adjusted ring to match new primary
    }
  },
  { 
    id: 'thoughtful', 
    label: 'Thoughtful', 
    icon: Brain,
    palette: {
      background: "220 40% 96%", // Light, muted periwinkle
      foreground: "230 25% 25%",   // Dark slate blue
      card: "225 30% 99%",
      cardForeground: "230 25% 25%",
      popover: "225 30% 99%",
      popoverForeground: "230 25% 25%",
      primary: "230 50% 60%",   // Muted indigo
      primaryForeground: "230 100% 10%",
      secondary: "210 35% 90%",   // Softer blue-gray
      secondaryForeground: "220 25% 40%",
      muted: "220 25% 94%",
      mutedForeground: "220 15% 55%",
      accent: "160 35% 60%",   // Muted seafoam green
      accentForeground: "160 100% 10%",
      border: "220 30% 88%",
      input: "220 30% 97%",
      ring: "230 50% 50%",
    }
  },
  { 
    id: 'melancholy', 
    label: 'Melancholy', 
    icon: CloudRain,
    palette: {
      background: "230 20% 95%", // Cool, light desaturated blue-gray
      foreground: "220 25% 30%",   // Dark, desaturated blue
      card: "235 15% 98%",
      cardForeground: "220 25% 30%",
      popover: "235 15% 98%",
      popoverForeground: "220 25% 30%",
      primary: "240 30% 58%",   // Muted deep blue
      primaryForeground: "240 100% 95%", // Light text for contrast
      secondary: "225 20% 88%",   // Softer gray-blue
      secondaryForeground: "230 20% 40%",
      muted: "230 15% 93%",
      mutedForeground: "230 10% 50%",
      accent: "270 25% 65%",   // Muted lavender/purple
      accentForeground: "270 100% 15%",
      border: "230 20% 85%",
      input: "230 20% 96%",
      ring: "240 30% 48%",
    }
  },
];

export const CONTENT_TYPES: SelectableItem[] = [
  { id: 'movie', label: 'Movies', icon: Film },
  { id: 'tvShow', label: 'TV Shows', icon: Tv2 },
  { id: 'anime', label: 'Anime', icon: Aperture },
  { id: 'book', label: 'Books', icon: BookOpenText },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'podcast', label: 'Podcasts', icon: Mic2 },
];

export const GENRES: SelectableGenre[] = [
  // General (Movie, TV, Anime, Book)
  { id: 'action', label: 'Action', applicableToContentTypes: ['movie', 'tvShow', 'anime'] },
  { id: 'adventure', label: 'Adventure', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'comedy', label: 'Comedy', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book', 'podcast'] },
  { id: 'drama', label: 'Drama', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'fantasy', label: 'Fantasy', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'historical', label: 'Historical', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'horror', label: 'Horror', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'mystery', label: 'Mystery', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book', 'podcast'] },
  { id: 'romance', label: 'Romance', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'sci-fi', label: 'Sci-Fi', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'thriller', label: 'Thriller', applicableToContentTypes: ['movie', 'tvShow', 'anime', 'book'] },
  { id: 'crime', label: 'Crime', applicableToContentTypes: ['movie', 'tvShow', 'book', 'podcast'] },
  { id: 'war', label: 'War', applicableToContentTypes: ['movie', 'tvShow', 'book'] },
  { id: 'western', label: 'Western', applicableToContentTypes: ['movie', 'tvShow', 'book'] },

  // Animation (distinct from Anime as a content type, for Western animation)
  { id: 'animation', label: 'Animation (General)', applicableToContentTypes: ['movie', 'tvShow'] },
  { id: 'family', label: 'Family', applicableToContentTypes: ['movie', 'tvShow'] }, // Often animated or live-action

  // Anime Specific
  { id: 'shonen', label: 'Shonen', applicableToContentTypes: ['anime'] },
  { id: 'shojo', label: 'Shojo', applicableToContentTypes: ['anime'] },
  { id: 'seinen', label: 'Seinen', applicableToContentTypes: ['anime'] },
  { id: 'josei', label: 'Josei', applicableToContentTypes: ['anime'] },
  { id: 'isekai', label: 'Isekai', applicableToContentTypes: ['anime'] },
  { id: 'slice-of-life', label: 'Slice of Life', applicableToContentTypes: ['anime', 'book'] }, // Can apply to manga too
  { id: 'mecha', label: 'Mecha', applicableToContentTypes: ['anime'] },
  { id: 'magical-girl', label: 'Magical Girl', applicableToContentTypes: ['anime'] },
  { id: 'sports-anime', label: 'Sports (Anime)', applicableToContentTypes: ['anime'] }, // Specific for anime sports

  // Book Specific
  { id: 'biography', label: 'Biography', applicableToContentTypes: ['book', 'movie'] }, // Movies can be biopics
  { id: 'contemporary-lit', label: 'Contemporary Lit', applicableToContentTypes: ['book'] },
  { id: 'dystopian', label: 'Dystopian', applicableToContentTypes: ['book', 'movie', 'tvShow'] },
  { id: 'graphic-novel', label: 'Graphic Novel', applicableToContentTypes: ['book'] }, // Often a format rather than genre but useful
  { id: 'historical-fiction', label: 'Historical Fiction', applicableToContentTypes: ['book'] },
  { id: 'literary-fiction', label: 'Literary Fiction', applicableToContentTypes: ['book'] },
  { id: 'memoir', label: 'Memoir', applicableToContentTypes: ['book'] },
  { id: 'non-fiction', label: 'Non-Fiction', applicableToContentTypes: ['book', 'podcast'] },
  { id: 'poetry', label: 'Poetry', applicableToContentTypes: ['book'] },
  { id: 'self-help', label: 'Self-Help', applicableToContentTypes: ['book', 'podcast'] },
  { id: 'short-stories', label: 'Short Stories', applicableToContentTypes: ['book'] },
  { id: 'young-adult', label: 'Young Adult (YA)', applicableToContentTypes: ['book', 'movie', 'tvShow'] },
  { id: 'childrens-lit', label: 'Children\'s Lit', applicableToContentTypes: ['book', 'movie', 'tvShow'] },

  // Music Specific
  { id: 'pop', label: 'Pop', applicableToContentTypes: ['music'] },
  { id: 'rock', label: 'Rock', applicableToContentTypes: ['music'] },
  { id: 'hip-hop', label: 'Hip Hop / Rap', applicableToContentTypes: ['music'] },
  { id: 'electronic', label: 'Electronic / Dance', applicableToContentTypes: ['music'] },
  { id: 'r-n-b', label: 'R&B / Soul', applicableToContentTypes: ['music'] },
  { id: 'jazz', label: 'Jazz', applicableToContentTypes: ['music'] },
  { id: 'classical', label: 'Classical', applicableToContentTypes: ['music'] },
  { id: 'country', label: 'Country', applicableToContentTypes: ['music'] },
  { id: 'folk', label: 'Folk / Acoustic', applicableToContentTypes: ['music'] },
  { id: 'metal', label: 'Metal', applicableToContentTypes: ['music'] },
  { id: 'punk', label: 'Punk', applicableToContentTypes: ['music'] },
  { id: 'blues', label: 'Blues', applicableToContentTypes: ['music'] },
  { id: 'reggae', label: 'Reggae', applicableToContentTypes: ['music'] },
  { id: 'latin', label: 'Latin', applicableToContentTypes: ['music'] },
  { id: 'k-pop', label: 'K-Pop', applicableToContentTypes: ['music'] },
  { id: 'ambient', label: 'Ambient', applicableToContentTypes: ['music'] },
  { id: 'instrumental', label: 'Instrumental', applicableToContentTypes: ['music'] },
  { id: 'soundtrack', label: 'Soundtrack / Score', applicableToContentTypes: ['music'] }, // Movie/TV/Game scores

  // Podcast Specific
  { id: 'news-podcast', label: 'News & Politics', applicableToContentTypes: ['podcast'] },
  { id: 'true-crime-podcast', label: 'True Crime', applicableToContentTypes: ['podcast'] },
  { id: 'interview-podcast', label: 'Interview', applicableToContentTypes: ['podcast'] },
  { id: 'educational-podcast', label: 'Educational', applicableToContentTypes: ['podcast', 'book'] }, // Books can also be educational
  { id: 'storytelling-podcast', label: 'Storytelling / Narrative', applicableToContentTypes: ['podcast', 'book'] }, // Books can be narrative
  { id: 'technology-podcast', label: 'Technology', applicableToContentTypes: ['podcast'] },
  { id: 'business-podcast', label: 'Business', applicableToContentTypes: ['podcast'] },
  { id: 'health-podcast', label: 'Health & Fitness', applicableToContentTypes: ['podcast'] },
  { id: 'spirituality-podcast', label: 'Spirituality & Religion', applicableToContentTypes: ['podcast'] },
  { id: 'arts-podcast', label: 'Arts & Culture', applicableToContentTypes: ['podcast'] },
  { id: 'sports-podcast', label: 'Sports (Podcast)', applicableToContentTypes: ['podcast'] },
  { id: 'parenting-podcast', label: 'Parenting', applicableToContentTypes: ['podcast'] },
  { id: 'history-podcast', label: 'History (Podcast)', applicableToContentTypes: ['podcast'] },

  // Documentary (can be a genre for movie/TV, and a style for podcast)
  { id: 'documentary', label: 'Documentary', applicableToContentTypes: ['movie', 'tvShow', 'podcast'] },
];


export const IMDB_RATING_OPTIONS: { value: string; label: string }[] = [
  { value: 'any_rating', label: 'Any Rating' },
  { value: '7.0', label: '7.0+' },
  { value: '7.5', label: '7.5+' },
  { value: '8.0', label: '8.0+' },
  { value: '8.5', label: '8.5+' },
  { value: '9.0', label: '9.0+' },
];

export const SUPPORTED_LANGUAGES: { value: string; label: string }[] = [
  { value: 'any_language', label: 'Any Language' },
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'French', label: 'French' },
];

export const MENU_ICONS = {
    history: History,
    language: Languages, // Added for potential future use or consistency
};

// CSS variable names used for theming
export const THEME_CSS_VARIABLES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--border',
  '--input',
  '--ring',
] as const;
export type ThemeCSSVariable = typeof THEME_CSS_VARIABLES[number];

export const DEFAULT_LIGHT_THEME_PALETTE: MoodThemePalette = {
  background: "45 50% 98%",
  foreground: "215 25% 30%",
  card: "45 30% 100%",
  cardForeground: "215 25% 30%",
  popover: "45 30% 100%",
  popoverForeground: "215 25% 30%",
  primary: "205 70% 55%",
  primaryForeground: "205 70% 95%",
  secondary: "200 40% 90%",
  secondaryForeground: "200 40% 35%",
  muted: "45 40% 95%",
  mutedForeground: "40 15% 55%",
  accent: "15 80% 65%",
  accentForeground: "15 80% 15%",
  border: "200 30% 85%",
  input: "200 25% 94%",
  ring: "205 70% 45%",
};

