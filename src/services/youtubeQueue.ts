// YouTube API Call Queue - Ensures only one API call at a time to save quota

import { searchYouTubeVideos, searchVideosForTopic, type YouTubeVideo } from './youtube';

interface QueuedRequest {
  id: string;
  type: 'subject' | 'topic';
  query: string;
  subject?: string;
  topic?: string;
  maxResults: number;
  resolve: (videos: YouTubeVideo[]) => void;
  reject: (error: Error) => void;
}

class YouTubeQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private currentRequest: QueuedRequest | null = null;

  /**
   * Add a request to the queue
   */
  async enqueue(
    type: 'subject' | 'topic',
    query: string,
    maxResults: number = 5,
    subject?: string,
    topic?: string
  ): Promise<YouTubeVideo[]> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        query,
        subject,
        topic,
        maxResults,
        resolve,
        reject,
      };

      this.queue.push(request);
      console.log(`[YouTube Queue] Added request to queue. Queue length: ${this.queue.length}`);
      
      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue one request at a time
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const request = this.queue.shift();

    if (!request) {
      this.processing = false;
      return;
    }

    this.currentRequest = request;
    console.log(`[YouTube Queue] Processing request: ${request.query} (${request.type})`);

    try {
      let videos: YouTubeVideo[] = [];

      if (request.type === 'topic') {
        // Use topic-specific search
        videos = await searchVideosForTopic(
          request.topic || request.query,
          request.subject,
          request.maxResults
        );
      } else {
        // Use subject search
        videos = await searchYouTubeVideos(request.query, request.maxResults);
      }

      console.log(`[YouTube Queue] Successfully fetched ${videos.length} videos for: ${request.query}`);
      request.resolve(videos);

      // Wait a bit before processing next request (rate limiting)
      await this.delay(1000); // 1 second delay between requests
    } catch (error) {
      console.error(`[YouTube Queue] Error processing request:`, error);
      request.reject(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      this.currentRequest = null;
      this.processing = false;

      // Process next item in queue
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 500); // Small delay before next request
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  getStatus(): { queueLength: number; processing: boolean; currentRequest: string | null } {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      currentRequest: this.currentRequest?.query || null,
    };
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue.forEach(req => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.processing = false;
    this.currentRequest = null;
  }
}

// Singleton instance
export const youtubeQueue = new YouTubeQueue();

/**
 * Queue a YouTube video search for a subject
 */
export async function queueSubjectVideos(
  subject: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  return youtubeQueue.enqueue('subject', subject, maxResults, subject);
}

/**
 * Queue a YouTube video search for a topic
 */
export async function queueTopicVideos(
  topic: string,
  subject?: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> {
  return youtubeQueue.enqueue('topic', topic, maxResults, subject, topic);
}

