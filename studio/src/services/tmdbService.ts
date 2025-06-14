'use server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Or 'original' for full size

interface TMDBMovieSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null; // Could also use this
}

interface TMDBMovieSearchResponse {
  page: number;
  results: TMDBMovieSearchResult[];
  total_pages: number;
  total_results: number;
}

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY is not set in environment variables. Cannot fetch from TMDb.');
    return null;
  }

  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const url = `${TMDB_BASE_URL}/${endpoint}?${urlParams.toString()}`;

  try {
    // Using Next.js extended fetch for caching/revalidation if needed, though for server actions, direct fetch is fine.
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour

    if (!response.ok) {
      console.error(`TMDb API request failed for ${url}: ${response.status} ${response.statusText}`);
      try {
        const errorBody = await response.json();
        console.error('TMDb error body:', errorBody);
      } catch (e) {
        const errorText = await response.text();
        console.error('TMDb error body (text):', errorText);
      }
      return null;
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching data from TMDb endpoint ${endpoint}:`, error);
    return null;
  }
}

export async function getTMDBMovieImage(movieTitle: string): Promise<string | null> {
  if (!movieTitle || movieTitle.trim() === '') {
    console.warn('[tmdbService] getTMDBMovieImage called with empty movieTitle.');
    return null;
  }
  if (!TMDB_API_KEY) {
    // Warning already given by fetchFromTMDB, but good for direct callers
    return null;
  }

  console.log(`[tmdbService] Searching TMDb for movie: "${movieTitle}"`);
  const searchResponse = await fetchFromTMDB<TMDBMovieSearchResponse>('search/movie', { query: movieTitle, include_adult: 'false', language: 'en-US', page: '1' });

  if (searchResponse && searchResponse.results && searchResponse.results.length > 0) {
    // Prioritize results with a poster_path
    const movieWithPoster = searchResponse.results.find(movie => movie.poster_path);
    const movieToUse = movieWithPoster || searchResponse.results[0]; // Fallback to first result if none have poster

    if (movieToUse.poster_path) {
      const imageUrl = `${TMDB_IMAGE_BASE_URL}${movieToUse.poster_path}`;
      console.log(`[tmdbService] Found TMDb image for "${movieTitle}" (using title: "${movieToUse.title}"): ${imageUrl}`);
      return imageUrl;
    } else {
      console.log(`[tmdbService] Movie "${movieTitle}" (found as "${movieToUse.title}") has no poster_path on TMDb.`);
      return null;
    }
  } else {
    console.log(`[tmdbService] No TMDb results found for movie: "${movieTitle}".`);
  }
  return null;
}