// YouTube Data API service

const YOUTUBE_API_KEY = 'AIzaSyCPpDSHNmwJbsbI1pdcJ9yTDbEtHZmq8ho';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

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
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  try {
    // Clean subject name and add educational keywords
    const searchQuery = `${subjectName} lecture tutorial engineering competitive exam`;
    
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('videoDuration', 'medium'); // 4-20 minutes
    url.searchParams.append('safeSearch', 'strict');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

/**
 * Search YouTube videos for specific topics (for weak areas)
 */
export async function searchVideosForTopic(
  topic: string,
  subject?: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  try {
    // Build search query with topic and subject
    let searchQuery = topic;
    if (subject) {
      searchQuery = `${subject} ${topic}`;
    }
    searchQuery += ' tutorial explanation competitive exam preparation';
    
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
      console.error('YouTube API error:', response.status);
      return [];
    }

    const data: YouTubeSearchResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching YouTube videos for topic:', error);
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
  try {
    // Combine keywords and add exam preparation context
    const searchQuery = searchKeywords.join(' ') + ' preparation exam';
    
    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('key', YOUTUBE_API_KEY);
    url.searchParams.append('order', 'relevance');
    url.searchParams.append('videoDuration', 'medium'); // 4-20 minutes
    url.searchParams.append('safeSearch', 'strict');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching competitive exam videos:', error);
    return [];
  }
}

