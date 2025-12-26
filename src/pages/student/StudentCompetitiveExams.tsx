import { useState } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { competitiveExams, type ExamCategory, type ExamSubcategory } from '@/data/competitiveExams';
import { searchCompetitiveExamVideos, getEmbedUrl, type YouTubeVideo } from '@/services/youtube';
import { Loader2, Play, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewState = 'exams' | 'subcategories' | 'videos';

export default function StudentCompetitiveExams() {
  const [selectedExam, setSelectedExam] = useState<ExamCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ExamSubcategory | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('exams');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const handleExamSelect = (exam: ExamCategory) => {
    setSelectedExam(exam);
    setSelectedSubcategory(null);
    setVideos([]);
    setCurrentView('subcategories');
  };

  const handleSubcategorySelect = async (subcategory: ExamSubcategory) => {
    setSelectedSubcategory(subcategory);
    setLoading(true);
    setCurrentView('videos');

    try {
      const fetchedVideos = await searchCompetitiveExamVideos(subcategory.searchKeywords, 15);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const handleBack = () => {
    if (currentView === 'videos') {
      setCurrentView('subcategories');
      setVideos([]);
      setSelectedSubcategory(null);
    } else if (currentView === 'subcategories') {
      setCurrentView('exams');
      setSelectedExam(null);
    }
  };

  const renderExamSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Competitive Exams
        </h2>
        <p className="text-muted-foreground text-lg">
          Prepare for national and international competitive exams with curated video content
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitiveExams.map((exam) => (
          <Card
            key={exam.id}
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => handleExamSelect(exam)}
          >
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {exam.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {exam.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="mt-2">
                {exam.subcategories.length} Topics
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubcategorySelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{selectedExam?.name}</h2>
        <p className="text-muted-foreground">Select a topic to view preparation videos</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedExam?.subcategories.map((subcategory) => (
          <Card
            key={subcategory.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSubcategorySelect(subcategory)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{subcategory.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                View Videos
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {selectedExam?.name} - {selectedSubcategory?.name}
        </h2>
        <p className="text-muted-foreground">
          Preparation videos for {selectedSubcategory?.name}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Fetching videos...</span>
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No videos found for this topic. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id.videoId} className="overflow-hidden">
              <div className="relative aspect-video bg-muted cursor-pointer group">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {video.snippet.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.snippet.channelTitle}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleVideoClick(video)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        {currentView !== 'exams' && (
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Competitive Exams</span>
              {selectedExam && (
                <>
                  <span>/</span>
                  <span>{selectedExam.name}</span>
                </>
              )}
              {selectedSubcategory && (
                <>
                  <span>/</span>
                  <span>{selectedSubcategory.name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === 'exams' && renderExamSelection()}
        {currentView === 'subcategories' && renderSubcategorySelection()}
        {currentView === 'videos' && renderVideos()}

        {/* Video Player Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="line-clamp-2">
                {selectedVideo?.snippet.title}
              </DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="aspect-video w-full">
                <iframe
                  src={getEmbedUrl(selectedVideo.id.videoId)}
                  title={selectedVideo.snippet.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {selectedVideo && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Channel:</strong> {selectedVideo.snippet.channelTitle}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedVideo.snippet.description}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

