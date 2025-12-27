// YouTube Data API service

// Read API key from Vite env. You must set VITE_YOUTUBE_API_KEY in your .env file.
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Quota tracking
let quotaExceeded = false;
const QUOTA_RESET_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY_PREFIX = 'youtube_videos_cache_';

interface CachedVideoData {
  videos: YouTubeVideo[];
  timestamp: number;
  query: string;
}

// Cache helper functions
function getCacheKey(query: string, maxResults: number): string {
  return `${CACHE_KEY_PREFIX}${btoa(query)}_${maxResults}`;
}

function getCachedVideos(query: string, maxResults: number, allowExpired: boolean = false): YouTubeVideo[] | null {
  try {
    const cacheKey = getCacheKey(query, maxResults);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const data: CachedVideoData = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION) {
      console.log(`Using cached YouTube videos for: ${query}`);
      return data.videos;
    }
    
    // Cache expired
    if (allowExpired) {
      console.log(`Using expired cached YouTube videos for: ${query}`);
      return data.videos;
    }
    
    // Cache expired and not allowed, remove it
    localStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedVideos(query: string, maxResults: number, videos: YouTubeVideo[]): void {
  try {
    const cacheKey = getCacheKey(query, maxResults);
    const data: CachedVideoData = {
      videos,
      timestamp: Date.now(),
      query,
    };
    localStorage.setItem(cacheKey, JSON.stringify(data));
    console.log(`Cached YouTube videos for: ${query}`);
  } catch (error) {
    console.error('Error caching videos:', error);
    // If storage is full, try to clear old cache entries
    clearOldCacheEntries();
  }
}

function clearOldCacheEntries(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedVideoData = JSON.parse(cached);
            if (now - data.timestamp >= CACHE_DURATION) {
              localStorage.removeItem(key);
              cleared++;
            }
          }
        } catch (e) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });
    
    if (cleared > 0) {
      console.log(`Cleared ${cleared} old cache entries`);
    }
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}

/**
 * Fallback: Search YouTube using RSS feed (no quota required)
 * This is a workaround when API quota is exceeded
 * Note: YouTube RSS feeds are limited, so this may not always work
 */
async function searchYouTubeViaRSS(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    // Method 1: Try RSS2JSON service (free tier available)
    const searchUrl = `https://www.youtube.com/feeds/videos.xml?search_query=${encodeURIComponent(query)}`;
    
    // Try without API key first (RSS2JSON has free tier)
    let response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(searchUrl)}&count=${maxResults}`);
    
    // If that fails and we have an API key, try with it
    if (!response.ok && YOUTUBE_API_KEY) {
      response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(searchUrl)}&api_key=${YOUTUBE_API_KEY}&count=${maxResults}`);
    }
    
    if (!response.ok) {
      console.warn('RSS fallback failed. YouTube API quota exceeded and RSS unavailable.');
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Convert RSS format to YouTubeVideo format
    const videos: YouTubeVideo[] = data.items.map((item: any) => {
      // Extract video ID from link
      const videoIdMatch = item.link?.match(/[?&]v=([^&]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      
      if (!videoId) return null;

      // Get thumbnail from YouTube (no API needed)
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

      return {
        id: { videoId },
        snippet: {
          title: item.title || '',
          description: item.description || item.content || '',
          channelTitle: item.author || 'Unknown Channel',
          thumbnails: {
            medium: { url: item.thumbnail || thumbnailUrl },
            high: { url: item.thumbnail || thumbnailUrl },
          },
        },
      };
    }).filter((v: any) => v !== null);

    console.log(`RSS fallback found ${videos.length} videos for: ${query}`);
    return videos;
  } catch (error) {
    console.error('RSS fallback error:', error);
    return [];
  }
}

/**
 * Check if YouTube API quota is exceeded
 */
export function isQuotaExceeded(): boolean {
  return quotaExceeded;
}

/**
 * Reset quota exceeded flag (call when quota resets)
 */
export function resetQuotaStatus(): void {
  quotaExceeded = false;
}

export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
  };
  contentDetails?: {
    duration: string;
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeVideo[];
}

export async function searchYouTubeVideos(
  subjectName: string,
  maxResults: number = 10,
  channelId?: string
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key is not configured. Please set VITE_YOUTUBE_API_KEY in your .env file.');
    return [];
  }

  // Clean subject name and add educational keywords
  const searchQuery = `${subjectName} lecture tutorial engineering competitive exam`;
  
  // Check cache first
  const cachedVideos = getCachedVideos(searchQuery, maxResults);
  if (cachedVideos) {
    return cachedVideos;
  }

  try {
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('videoDuration', 'medium'); // 4-20 minutes
    url.searchParams.append('safeSearch', 'strict');
    // If you want videos from a single channel (e.g. your own channel), pass channelId
    if (channelId) {
      url.searchParams.append('channelId', channelId);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      // Try to parse JSON error from YouTube to get more details
      let errBody: any;
      try {
        errBody = await response.json();
      } catch (e) {
        // fallback to text
        const text = await response.text();
        console.error('YouTube API error (non-json):', response.status, text);
        
        // Try to return cached data if available (even if expired)
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache) {
          console.warn('Using expired cache due to API error');
          return expiredCache;
        }
        
        throw new Error(`YouTube API error: ${response.status} - ${text}`);
      }

      // If quota exceeded, try to return cached data
      const reason = errBody?.error?.errors?.[0]?.reason;
      const message = errBody?.error?.message || JSON.stringify(errBody);
      console.error('YouTube API error:', response.status, reason || message);

      if (reason === 'quotaExceeded') {
        quotaExceeded = true;
        console.warn('YouTube API quota exceeded. Attempting fallback methods...');
        
        // Try cached data first (even expired)
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache && expiredCache.length > 0) {
          console.log('Returning cached videos due to quota exceeded');
          return expiredCache;
        }
        
        // Try RSS fallback (no quota required)
        console.log('Attempting RSS feed fallback...');
        const rssVideos = await searchYouTubeViaRSS(searchQuery, maxResults);
        if (rssVideos.length > 0) {
          setCachedVideos(searchQuery, maxResults, rssVideos);
          return rssVideos;
        }
        
        // No fallback available
        console.error('No videos available. YouTube API quota exceeded and no fallback data found.');
        return [];
      }

      // For other errors, try expired cache
      const expiredCache = getCachedVideos(searchQuery, maxResults, true);
      if (expiredCache) {
        console.warn('Using expired cache due to API error');
        return expiredCache;
      }

      throw new Error(`YouTube API error: ${response.status} - ${message}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    const videos = data.items || [];
    
    // Cache the results
    if (videos.length > 0) {
      setCachedVideos(searchQuery, maxResults, videos);
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    
    // Last resort: try to get any cached data (even expired)
    const cached = getCachedVideos(searchQuery, maxResults, true);
    if (cached) {
      console.warn('Using cached data as fallback');
      return cached;
    }
    
    return [];
  }
}

// --- Channel-based helpers (cheaper than repeated search requests) ---
// Using the channel's uploads playlist is an efficient way to list all videos
// from a specific channel and typically uses fewer quota units than search.

async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.append('part', 'contentDetails');
  url.searchParams.append('id', channelId);
  url.searchParams.append('key', YOUTUBE_API_KEY as string);

  const response = await fetch(url.toString());
  if (!response.ok) {
    console.error('Error getting channel details:', response.status, await response.text());
    return null;
  }

  const data = await response.json();
  const uploads = data?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  return uploads ?? null;
}

export async function getVideosFromChannel(
  channelId: string,
  maxResults: number = 12
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key is not configured. Please set VITE_YOUTUBE_API_KEY in your .env file.');
    return [];
  }

  try {
    const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
    if (!uploadsPlaylistId) {
      console.warn('Could not get uploads playlist for channel:', channelId);
      return [];
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('playlistId', uploadsPlaylistId);
    url.searchParams.append('maxResults', Math.min(maxResults, 50).toString());
    url.searchParams.append('key', YOUTUBE_API_KEY as string);

    const response = await fetch(url.toString());
    if (!response.ok) {
      const txt = await response.text();
      console.error('YouTube playlistItems error:', response.status, txt);
      return [];
    }

    const data = await response.json();
    // playlistItems items have a similar snippet structure
    return data.items || [];
  } catch (e) {
    console.error('Error fetching videos from channel:', e);
    return [];
  }
}

/**
 * Search YouTube videos for specific topics (for weak areas)
 * This function is optimized to find the best educational videos for improving weak points
 */
export async function searchVideosForTopic(
  topic: string,
  subject?: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key is not configured. Please set VITE_YOUTUBE_API_KEY in your .env file.');
    return [];
  }

  // Build optimized search query for weak areas
  let searchQuery = '';
  
  if (subject) {
    searchQuery = `${subject} ${topic} tutorial explanation examples practice problems`;
  } else {
    searchQuery = `${topic} tutorial explanation examples practice problems`;
  }
  
  searchQuery += ' engineering competitive exam preparation';
  
  // Check cache first
  const cachedVideos = getCachedVideos(searchQuery, maxResults);
  if (cachedVideos) {
    return cachedVideos;
  }

  try {
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('videoDuration', 'medium');
    url.searchParams.append('safeSearch', 'strict');
    url.searchParams.append('videoEmbeddable', 'true');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      let errBody: any;
      try {
        errBody = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error('YouTube API error:', response.status, errorText);
        
        // Try expired cache
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache) {
          return expiredCache;
        }
        return [];
      }

      const reason = errBody?.error?.errors?.[0]?.reason;
      
      if (reason === 'quotaExceeded') {
        quotaExceeded = true;
        console.warn('YouTube API quota exceeded. Attempting fallback methods...');
        
        // Try cached data first
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache && expiredCache.length > 0) {
          return expiredCache;
        }
        
        // Try RSS fallback
        const rssVideos = await searchYouTubeViaRSS(searchQuery, maxResults);
        if (rssVideos.length > 0) {
          setCachedVideos(searchQuery, maxResults, rssVideos);
          return rssVideos;
        }
        
        return [];
      }
      
      // Try expired cache for other errors
      const expiredCache = getCachedVideos(searchQuery, maxResults);
      if (expiredCache) {
        return expiredCache;
      }
      
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();
    const videos = data.items || [];
    
    if (videos.length === 0) {
      console.warn(`No YouTube videos found for topic: ${topic}${subject ? ` (${subject})` : ''}`);
      return [];
    }

    // Cache the results
    setCachedVideos(searchQuery, maxResults, videos);
    console.log(`Found ${videos.length} YouTube videos for ${topic}`);
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos for topic:', error);
    
    // Try to get cached data
    const cached = getCachedVideos(searchQuery, maxResults);
    if (cached) {
      return cached;
    }
    
    return [];
  }
}

// Helper function to format duration (if available from video details API)
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get embed URL for YouTube video
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Search YouTube videos for competitive exam preparation
export async function searchCompetitiveExamVideos(
  searchKeywords: string[],
  maxResults: number = 12
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key is not configured. Please set VITE_YOUTUBE_API_KEY in your .env file.');
    return [];
  }

  // Combine keywords and add exam preparation context
  const searchQuery = searchKeywords.join(' ') + ' preparation exam';
  
  // Check cache first
  const cachedVideos = getCachedVideos(searchQuery, maxResults);
  if (cachedVideos) {
    return cachedVideos;
  }

  try {
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('videoDuration', 'medium');
    url.searchParams.append('safeSearch', 'strict');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      let errBody: any;
      try {
        errBody = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error('YouTube API error:', response.status, errorText);
        
        // Try expired cache
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache) {
          return expiredCache;
        }
        return [];
      }

      const reason = errBody?.error?.errors?.[0]?.reason;
      
      if (reason === 'quotaExceeded') {
        quotaExceeded = true;
        console.warn('YouTube API quota exceeded. Attempting fallback methods...');
        
        // Try cached data first
        const expiredCache = getCachedVideos(searchQuery, maxResults, true);
        if (expiredCache && expiredCache.length > 0) {
          return expiredCache;
        }
        
        // Try RSS fallback
        const rssVideos = await searchYouTubeViaRSS(searchQuery, maxResults);
        if (rssVideos.length > 0) {
          setCachedVideos(searchQuery, maxResults, rssVideos);
          return rssVideos;
        }
        
        return [];
      }
      
      // Try expired cache for other errors
      const expiredCache = getCachedVideos(searchQuery, maxResults);
      if (expiredCache) {
        return expiredCache;
      }
      
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();
    const videos = data.items || [];
    
    // Cache the results
    if (videos.length > 0) {
      setCachedVideos(searchQuery, maxResults, videos);
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching competitive exam videos:', error);
    
    // Try to get cached data
    const cached = getCachedVideos(searchQuery, maxResults);
    if (cached) {
      return cached;
    }
    
    return [];
  }
}

