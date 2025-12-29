// Podcast storage service for favorites, progress tracking, and continue listening

import type { YouTubeVideo } from './youtube';

const STORAGE_KEYS = {
    FAVORITES: 'podcast_favorites',
    PROGRESS: 'podcast_progress',
    LAST_PLAYED: 'podcast_last_played',
};

// Favorite episode structure (minimal data to save space)
interface SavedEpisode {
    videoId: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    savedAt: number;
}

// Progress data for a single episode
interface EpisodeProgress {
    videoId: string;
    currentTime: number;
    duration: number;
    lastPlayedAt: number;
}

// ============ FAVORITES ============

export function getFavorites(): SavedEpisode[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addFavorite(episode: YouTubeVideo): void {
    const favorites = getFavorites();

    // Check if already exists
    if (favorites.some(f => f.videoId === episode.id.videoId)) {
        return;
    }

    const savedEpisode: SavedEpisode = {
        videoId: episode.id.videoId,
        title: episode.snippet.title,
        channelTitle: episode.snippet.channelTitle,
        thumbnail: episode.snippet.thumbnails.medium?.url || episode.snippet.thumbnails.high?.url || '',
        savedAt: Date.now(),
    };

    favorites.unshift(savedEpisode); // Add to beginning
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
}

export function removeFavorite(videoId: string): void {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.videoId !== videoId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}

export function isFavorite(videoId: string): boolean {
    return getFavorites().some(f => f.videoId === videoId);
}

export function toggleFavorite(episode: YouTubeVideo): boolean {
    if (isFavorite(episode.id.videoId)) {
        removeFavorite(episode.id.videoId);
        return false;
    } else {
        addFavorite(episode);
        return true;
    }
}

// ============ PROGRESS TRACKING ============

export function getAllProgress(): Record<string, EpisodeProgress> {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

export function getProgress(videoId: string): EpisodeProgress | null {
    const allProgress = getAllProgress();
    return allProgress[videoId] || null;
}

export function saveProgress(videoId: string, currentTime: number, duration: number): void {
    const allProgress = getAllProgress();

    allProgress[videoId] = {
        videoId,
        currentTime,
        duration,
        lastPlayedAt: Date.now(),
    };

    // Keep only last 50 episodes to avoid localStorage bloat
    const entries = Object.entries(allProgress);
    if (entries.length > 50) {
        entries.sort((a, b) => b[1].lastPlayedAt - a[1].lastPlayedAt);
        const trimmed = Object.fromEntries(entries.slice(0, 50));
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(trimmed));
    } else {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
    }
}

export function clearProgress(videoId: string): void {
    const allProgress = getAllProgress();
    delete allProgress[videoId];
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

// ============ CONTINUE LISTENING (Last played episode) ============

interface LastPlayed {
    episode: SavedEpisode;
    progress: EpisodeProgress;
}

export function getLastPlayed(): LastPlayed | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
}

export function saveLastPlayed(episode: YouTubeVideo, currentTime: number, duration: number): void {
    const lastPlayed: LastPlayed = {
        episode: {
            videoId: episode.id.videoId,
            title: episode.snippet.title,
            channelTitle: episode.snippet.channelTitle,
            thumbnail: episode.snippet.thumbnails.medium?.url || episode.snippet.thumbnails.high?.url || '',
            savedAt: Date.now(),
        },
        progress: {
            videoId: episode.id.videoId,
            currentTime,
            duration,
            lastPlayedAt: Date.now(),
        },
    };

    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, JSON.stringify(lastPlayed));

    // Also save to progress
    saveProgress(episode.id.videoId, currentTime, duration);
}

// ============ RECENTLY PLAYED ============

export function getRecentlyPlayed(): EpisodeProgress[] {
    const allProgress = getAllProgress();
    return Object.values(allProgress)
        .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
        .slice(0, 10);
}

// Calculate progress percentage
export function getProgressPercentage(videoId: string): number {
    const progress = getProgress(videoId);
    if (!progress || !progress.duration) return 0;
    return Math.round((progress.currentTime / progress.duration) * 100);
}
