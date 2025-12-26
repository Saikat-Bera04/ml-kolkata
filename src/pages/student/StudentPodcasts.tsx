import { useState } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { podcastSections, type PodcastSection } from '@/data/podcasts';
import { searchYouTubeVideos, type YouTubeVideo } from '@/services/youtube';
import { Loader2, Play, Headphones } from 'lucide-react';
import { PodcastPlayer } from '@/components/PodcastPlayer';

export default function StudentPodcasts() {
  const [selectedSection, setSelectedSection] = useState<PodcastSection | null>(null);
  const [episodes, setEpisodes] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<YouTubeVideo | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleSectionSelect = async (section: PodcastSection) => {
    setSelectedSection(section);
    setLoading(true);
    setEpisodes([]);

    try {
      // Fetch videos for each keyword and combine results
      const allEpisodes: YouTubeVideo[] = [];
      
      // Limit to first 3 keywords to avoid API quota issues
      const keywordsToSearch = section.keywords.slice(0, 3);
      
      for (const keyword of keywordsToSearch) {
        const videos = await searchYouTubeVideos(keyword, 5);
        allEpisodes.push(...videos);
      }

      // Remove duplicates based on video ID
      const uniqueEpisodes = allEpisodes.filter(
        (episode, index, self) =>
          index === self.findIndex((e) => e.id.videoId === episode.id.videoId)
      );

      setEpisodes(uniqueEpisodes.slice(0, 15)); // Limit to 15 episodes per section
    } catch (error) {
      console.error('Error fetching podcast episodes:', error);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodePlay = (episode: YouTubeVideo) => {
    setCurrentEpisode(episode);
    setIsPlayerOpen(true);
  };

  const handlePlayerClose = () => {
    setIsPlayerOpen(false);
    setCurrentEpisode(null);
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      brown: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
      red: 'bg-red-50 border-red-200 hover:bg-red-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      black: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Headphones className="h-8 w-8" />
            Podcasts
          </h1>
          <p className="text-muted-foreground">
            Listen to educational content converted to audio-only format
          </p>
        </div>

        {/* Podcast Sections Grid */}
        {!selectedSection && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {podcastSections.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all ${getColorClasses(section.color)}`}
                onClick={() => handleSectionSelect(section)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Badge variant="outline">{section.id.split('-')[0]}</Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {section.keywords.slice(0, 3).map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {section.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{section.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                  {section.channels && section.channels.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Sources: {section.channels.join(', ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Episodes List */}
        {selectedSection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedSection.title}</h2>
                <p className="text-muted-foreground">{selectedSection.description}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSection(null);
                  setEpisodes([]);
                }}
              >
                Back to Sections
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading episodes...</span>
              </div>
            ) : episodes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No episodes found. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {episodes.map((episode) => (
                  <Card key={episode.id.videoId} className="overflow-hidden">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={episode.snippet.thumbnails.medium.url}
                        alt={episode.snippet.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>
                      <Badge
                        className="absolute top-2 right-2 bg-black/70 text-white"
                        variant="secondary"
                      >
                        Audio Only
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">
                        {episode.snippet.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {episode.snippet.channelTitle}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {episode.snippet.description}
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => handleEpisodePlay(episode)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Episode
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Card */}
        {!selectedSection && (
          <Card className="mt-8 bg-accent/50">
            <CardHeader>
              <CardTitle>About Podcasts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Our podcast section converts educational YouTube videos into audio-only format,
                allowing you to learn on the go. Each episode is automatically processed to extract
                the audio stream for distraction-free learning.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Audio-only playback</li>
                    <li>• Speed control (0.5x - 2x)</li>
                    <li>• Background playback</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Coming Soon:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Offline downloads</li>
                    <li>• Favorite episodes</li>
                    <li>• Continue listening</li>
                    <li>• Playlist creation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Podcast Player */}
      {isPlayerOpen && currentEpisode && (
        <PodcastPlayer episode={currentEpisode} onClose={handlePlayerClose} />
      )}
    </div>
  );
}

