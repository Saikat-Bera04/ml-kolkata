import { useState } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subjectData, type StreamData, type Subject } from '@/data/subjects';
import { searchYouTubeVideos, getEmbedUrl, type YouTubeVideo } from '@/services/youtube';
import { recordActivity } from '@/services/activityTracker';
import { Loader2, Play, ArrowLeft, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewState = 'stream' | 'year' | 'semester' | 'subject' | 'videos';

export default function StudentLearning() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('stream');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const streamData = selectedStream ? subjectData[selectedStream] : null;
  const yearData = streamData && selectedYear 
    ? streamData.years.find(y => y.year === selectedYear) 
    : null;
  const semesterData = yearData && selectedSemester
    ? yearData.semesters.find(s => s.number === selectedSemester)
    : null;

  const handleStreamSelect = (stream: string) => {
    setSelectedStream(stream);
    setSelectedYear(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setVideos([]);
    setCurrentView('year');
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setVideos([]);
    setCurrentView('semester');
  };

  const handleSemesterSelect = (semester: number) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setVideos([]);
    setCurrentView('subject');
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setLoading(true);
    setCurrentView('videos');

    try {
      const fetchedVideos = await searchYouTubeVideos(subject.name, 12);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    recordActivity('video_watched', { 
      videoId: video.id.videoId, 
      title: video.snippet.title,
      subject: selectedSubject?.name 
    });
    window.dispatchEvent(new CustomEvent('activity-updated'));
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const handleBack = () => {
    if (currentView === 'videos') {
      setCurrentView('subject');
      setVideos([]);
      setSelectedSubject(null);
    } else if (currentView === 'subject') {
      setCurrentView('semester');
      setSelectedSemester(null);
    } else if (currentView === 'semester') {
      setCurrentView('year');
      setSelectedYear(null);
    } else if (currentView === 'year') {
      setCurrentView('stream');
      setSelectedStream(null);
    }
  };

  const renderStreamSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Stream</h2>
        <p className="text-muted-foreground">Choose your engineering branch to continue</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(subjectData).map((stream) => (
          <Card 
            key={stream}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleStreamSelect(stream)}
          >
            <CardHeader>
              <CardTitle className="text-xl">{stream}</CardTitle>
              <CardDescription>
                {stream === 'CSE' && 'Computer Science & Engineering'}
                {stream === 'ECE' && 'Electronics & Communication Engineering'}
                {stream === 'Civil' && 'Civil Engineering'}
                {stream === 'Mechanical' && 'Mechanical Engineering'}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderYearSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{streamData?.stream}</h2>
        <p className="text-muted-foreground">Select Year</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {streamData?.years.map((year) => (
          <Card
            key={year.year}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleYearSelect(year.year)}
          >
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{year.year}</CardTitle>
              <CardDescription>Year {year.year}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSemesterSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {streamData?.stream} - Year {selectedYear}
        </h2>
        <p className="text-muted-foreground">Select Semester</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {yearData?.semesters.map((semester) => (
          <Card
            key={semester.number}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSemesterSelect(semester.number)}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Semester {semester.number}</CardTitle>
              <CardDescription>
                {semester.subjects.length} subjects available
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSubjectSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {streamData?.stream} - Year {selectedYear} - Semester {selectedSemester}
        </h2>
        <p className="text-muted-foreground">Select a subject to view videos</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semesterData?.subjects.map((subject, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleSubjectSelect(subject)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {subject.name}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{selectedSubject?.name}</h2>
        <p className="text-muted-foreground">
          YouTube videos for {selectedSubject?.name}
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
              No videos found for this subject. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id.videoId} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                <img
                  src={video.snippet.thumbnails.medium.url}
                  alt={video.snippet.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base line-clamp-2">
                  {video.snippet.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{video.snippet.channelTitle}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleVideoClick(video)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch
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
        {currentView !== 'stream' && (
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
              <span>Learning</span>
              {selectedStream && (
                <>
                  <span>/</span>
                  <span>{selectedStream}</span>
                </>
              )}
              {selectedYear && (
                <>
                  <span>/</span>
                  <span>Year {selectedYear}</span>
                </>
              )}
              {selectedSemester && (
                <>
                  <span>/</span>
                  <span>Semester {selectedSemester}</span>
                </>
              )}
              {selectedSubject && (
                <>
                  <span>/</span>
                  <span>{selectedSubject.name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === 'stream' && renderStreamSelection()}
        {currentView === 'year' && renderYearSelection()}
        {currentView === 'semester' && renderSemesterSelection()}
        {currentView === 'subject' && renderSubjectSelection()}
        {currentView === 'videos' && renderVideos()}

        {/* Video Player Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.snippet.title}</DialogTitle>
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

