// Weights & Biases tracking service for chatbot analytics

const WANDB_API_KEY = import.meta.env.VITE_WANDB_API_KEY as string | undefined;
const WANDB_PROJECT = 'adapti-learn-chatbot';
const WANDB_ENTITY = 'adapti-learn';

interface ChatbotMetrics {
  userQuestion: string;
  response: string;
  responseTime: number;
  isEducational: boolean;
  topic?: string;
  userProfile?: {
    quizAccuracy: number;
    recentSubjects: string[];
    weakConcepts: string[];
  };
  error?: string;
}

class WandbTracker {
  private initialized = false;
  private sessionId: string;
  private messageCount = 0;

  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async init(): Promise<boolean> {
    if (!WANDB_API_KEY) {
      console.warn('WANDB_API_KEY not configured. Chatbot tracking disabled.');
      return false;
    }

    if (this.initialized) {
      return true;
    }

    try {
      // Initialize wandb tracking
      // Note: wandb SDK is primarily for Python, but we can use their REST API
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize wandb:', error);
      return false;
    }
  }

  async logChatbotInteraction(metrics: ChatbotMetrics): Promise<void> {
    if (!this.initialized || !WANDB_API_KEY) {
      return;
    }

    try {
      this.messageCount++;

      // Extract topic from question
      const topic = this.extractTopic(metrics.userQuestion);

      // Log to wandb via REST API
      await this.logToWandb({
        message_id: `${this.sessionId}-${this.messageCount}`,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        user_question: metrics.userQuestion,
        assistant_response: metrics.response,
        response_time_ms: metrics.responseTime,
        is_educational: metrics.isEducational,
        topic: topic,
        quiz_accuracy: metrics.userProfile?.quizAccuracy || 0,
        recent_subjects: metrics.userProfile?.recentSubjects || [],
        weak_concepts: metrics.userProfile?.weakConcepts || [],
        error: metrics.error || null,
      });
    } catch (error) {
      console.error('Failed to log to wandb:', error);
      // Don't throw - tracking failures shouldn't break the chatbot
    }
  }

  private extractTopic(question: string): string {
    const lower = question.toLowerCase();
    
    // Subject detection
    const subjects = [
      'python', 'javascript', 'java', 'c++', 'c#', 'react', 'node',
      'data structure', 'algorithm', 'database', 'sql', 'dbms',
      'machine learning', 'ai', 'deep learning', 'neural network',
      'math', 'mathematics', 'calculus', 'algebra', 'geometry',
      'physics', 'chemistry', 'biology',
      'operating system', 'os', 'networking', 'computer network',
      'software engineering', 'web development', 'frontend', 'backend',
    ];

    for (const subject of subjects) {
      if (lower.includes(subject)) {
        return subject;
      }
    }

    // Question type detection
    if (lower.startsWith('what')) return 'definition';
    if (lower.startsWith('how')) return 'explanation';
    if (lower.startsWith('why')) return 'reasoning';
    if (lower.startsWith('when') || lower.startsWith('where')) return 'context';
    
    return 'general';
  }

  private async logToWandb(data: Record<string, any>): Promise<void> {
    if (!WANDB_API_KEY) return;

    try {
      // Store metrics locally first (for offline support)
      const metricsKey = `wandb_metrics_${this.sessionId}`;
      const existingMetrics = localStorage.getItem(metricsKey);
      const metrics = existingMetrics ? JSON.parse(existingMetrics) : [];
      metrics.push({
        ...data,
        logged_at: new Date().toISOString(),
      });
      localStorage.setItem(metricsKey, JSON.stringify(metrics.slice(-100))); // Keep last 100

      // Try to send to wandb API
      // Note: Wandb's REST API requires creating a run first, then logging to it
      // For simplicity, we'll batch send metrics periodically
      await this.sendBatchToWandb(metrics);
    } catch (error) {
      // Silently fail - don't break chatbot if tracking fails
      console.debug('Wandb tracking error (non-critical):', error);
    }
  }

  private async sendBatchToWandb(metrics: any[]): Promise<void> {
    if (!WANDB_API_KEY || metrics.length === 0) return;

    try {
      // Create or get a wandb run
      const runId = `chatbot-${this.sessionId}`;
      
      // Use wandb's REST API to log metrics
      // This is a simplified approach - in production, you'd want a backend service
      const response = await fetch(`https://api.wandb.ai/api/v1/runs/${WANDB_ENTITY}/${WANDB_PROJECT}/${runId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WANDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            session_id: this.sessionId,
            total_messages: this.messageCount,
          },
          summary: {
            total_interactions: metrics.length,
            avg_response_time: metrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / metrics.length,
            educational_count: metrics.filter(m => m.is_educational).length,
          },
        }),
      });

      if (response.ok) {
        // Clear sent metrics
        localStorage.removeItem(`wandb_metrics_${this.sessionId}`);
      }
    } catch (error) {
      console.debug('Wandb batch send error (non-critical):', error);
    }
  }

  async logMetrics(metrics: Record<string, number>): Promise<void> {
    if (!this.initialized || !WANDB_API_KEY) {
      return;
    }

    try {
      // Log custom metrics
      await this.logToWandb({
        ...metrics,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.debug('Wandb metrics logging error (non-critical):', error);
    }
  }
}

// Singleton instance
export const wandbTracker = new WandbTracker();

// Initialize on module load
wandbTracker.init().catch(console.error);

// Export convenience functions
export async function trackChatbotInteraction(metrics: ChatbotMetrics): Promise<void> {
  await wandbTracker.logChatbotInteraction(metrics);
}

export async function trackChatbotMetrics(metrics: Record<string, number>): Promise<void> {
  await wandbTracker.logMetrics(metrics);
}

