import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import type { YouTubeVideo } from '@/services/youtube';

interface PodcastPlayerProps {
  episode: YouTubeVideo | null;
  onClose: () => void;
}

export function PodcastPlayer({ episode, onClose }: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (episode) {
      // Reset player when episode changes
      setCurrentTime(0);
      setIsPlaying(false);
      
      // TODO: When backend is ready, fetch audio stream URL here
      // Example:
      // fetch(`/api/podcasts/audio/${episode.id.videoId}`)
      //   .then(res => res.json())
      //   .then(data => {
      //     if (audioRef.current) {
      //       audioRef.current.src = data.audioUrl;
      //     }
      //   });
    }
  }, [episode]);

  // For MVP: This is a placeholder for audio playback
  // Full implementation requires backend:
  // 1. Send YouTube video URL to backend
  // 2. Backend uses FFmpeg/yt-dlp to extract audio stream
  // 3. Frontend receives audio stream URL (e.g., /api/audio/:videoId)
  // 4. Play audio using HTML5 audio element with the stream URL
  const handlePlayPause = () => {
    if (!episode) return;
    
    // TODO: Implement actual audio playback when backend is ready
    // Example implementation:
    // const audioUrl = `/api/podcasts/audio/${episode.id.videoId}`;
    // if (audioRef.current) {
    //   if (isPlaying) {
    //     audioRef.current.pause();
    //   } else {
    //     audioRef.current.play();
    //   }
    // }
    
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    // TODO: When backend is ready, implement actual seek
    // if (audioRef.current) {
    //   audioRef.current.currentTime = newTime;
    // }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!episode) return null;

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border-t-2 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm line-clamp-1">{episode.snippet.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{episode.snippet.channelTitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio element (to be used when backend provides audio stream) */}
        <audio
          ref={audioRef}
          src={undefined} // TODO: Set to backend audio stream URL
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration);
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
          }}
          onEnded={() => setIsPlaying(false)}
          playbackRate={playbackRate}
          volume={isMuted ? 0 : volume}
          className="hidden"
        />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-10 w-10"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTime = Math.max(0, currentTime - 10);
                  setCurrentTime(newTime);
                  // TODO: When backend is ready, implement actual seek
                  // if (audioRef.current) {
                  //   audioRef.current.currentTime = newTime;
                  // }
                }}
                className="h-8 w-8"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newTime = Math.min(duration, currentTime + 10);
                  setCurrentTime(newTime);
                  // TODO: When backend is ready, implement actual seek
                  // if (audioRef.current) {
                  //   audioRef.current.currentTime = newTime;
                  // }
                }}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <select
              value={playbackRate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value);
                setPlaybackRate(rate);
                // TODO: When backend is ready, implement actual playback rate change
                // if (audioRef.current) {
                //   audioRef.current.playbackRate = rate;
                // }
              }}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 w-32">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Note for backend implementation */}
        <div className="text-xs text-muted-foreground italic pt-2 border-t">
          Note: Audio extraction requires backend processing. Current implementation shows UI structure.
          Backend should use FFmpeg to convert YouTube video to audio stream.
        </div>
      </CardContent>
    </Card>
  );
}

