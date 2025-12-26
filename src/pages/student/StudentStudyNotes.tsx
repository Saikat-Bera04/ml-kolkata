import { useState, useEffect } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getStudyNotes, 
  searchStudyNotes,
  saveStudyNote,
  deleteStudyNote,
  bookmarkNote,
  rateNote,
  generateStudyNote,
  createScrapeJob,
  processScrapeJob,
  updateScrapeJobStatus,
  getBookmarkedNotes,
  type StudyNote,
  type NoteCategory,
} from '@/services/studyNotes';
import { recordActivity } from '@/services/activityTracker';
import { collegeSubjects, competitiveExamTopics } from '@/data/studyNotes';
import { 
  Search, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  RefreshCw,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function StudentStudyNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<StudyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<NoteCategory>('college');
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);
  const [requestNoteOpen, setRequestNoteOpen] = useState(false);
  const [requestQuery, setRequestQuery] = useState('');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestTopic, setRequestTopic] = useState('');
  const [processingJob, setProcessingJob] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, category, selectedStream, selectedSemester, selectedSubject, selectedExam, selectedTopic]);

  const loadNotes = () => {
    const allNotes = getStudyNotes();
    setNotes(allNotes);
  };

  const filterNotes = () => {
    const filters: any = {
      category,
    };

    if (selectedStream) filters.stream = selectedStream;
    if (selectedSemester) filters.semester = parseInt(selectedSemester);
    if (selectedSubject) filters.subject = selectedSubject;
    if (selectedTopic && category === 'competitive') filters.subject = selectedTopic;

    let filtered = searchStudyNotes(searchQuery, filters);
    
    // Additional filtering for competitive exams
    if (category === 'competitive' && selectedExam) {
      filtered = filtered.filter(note => {
        // Filter by exam if note has exam info in subject or topics
        const examLower = selectedExam.toLowerCase();
        return note.subject.toLowerCase().includes(examLower) ||
               note.topics.some(topic => topic.toLowerCase().includes(examLower)) ||
               note.title.toLowerCase().includes(examLower);
      });
    }

    setFilteredNotes(filtered);
  };

  const handleRequestNote = async () => {
    if (!requestQuery.trim()) {
      toast.error('Please enter a topic or query');
      return;
    }

    setProcessingJob(true);
    setRequestNoteOpen(false);

    try {
      // Use request subject or selected subject or request query
      const subject = requestSubject || selectedSubject || selectedTopic || requestQuery;
      
      // Create scrape job
      const job = createScrapeJob(
        requestQuery,
        category,
        selectedStream || undefined,
        selectedSemester ? parseInt(selectedSemester) : undefined,
        subject,
        user?.id
      );

      toast.info('Generating study note...', {
        description: 'This may take a few moments. Please wait...',
      });

      // Process job - generate note using OpenRouter API
      const note = await generateStudyNote(
        requestQuery,
        category,
        selectedStream || undefined,
        selectedSemester ? parseInt(selectedSemester) : undefined,
        subject
      );

      if (note) {
        // Update job status
        if (job.id) {
          updateScrapeJobStatus(job.id, 'completed', note.id);
        }
        
        saveStudyNote(note);
        loadNotes();
        
        toast.success('Study note generated!', {
          description: `Note: ${note.title}`,
        });
        
        setViewingNote(note);
      } else {
        if (job.id) {
          updateScrapeJobStatus(job.id, 'failed');
        }
        toast.error('Failed to generate note', {
          description: 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error requesting note:', error);
      toast.error('Failed to generate note', {
        description: 'An error occurred. Please try again.',
      });
    } finally {
      setProcessingJob(false);
      setRequestQuery('');
      setRequestSubject('');
      setRequestTopic('');
    }
  };

  const handleBookmark = (noteId: string, bookmarked: boolean) => {
    bookmarkNote(noteId, bookmarked);
    loadNotes();
    toast.success(bookmarked ? 'Note bookmarked' : 'Note unbookmarked');
  };

  const handleRate = (noteId: string, rating: 'up' | 'down' | null) => {
    rateNote(noteId, rating);
    loadNotes();
    if (viewingNote?.id === noteId) {
      const updated = getStudyNotes().find(n => n.id === noteId);
      if (updated) setViewingNote(updated);
    }
  };

  const handleRefreshNote = async (note: StudyNote) => {
    if (!note.id) return;

    setProcessingJob(true);
    toast.info('Refreshing note...', {
      description: 'Generating updated content',
    });

    try {
      const refreshed = await generateStudyNote(
        note.title,
        note.category,
        note.stream,
        note.semester,
        note.subject
      );

      if (refreshed && note.id) {
        refreshed.id = note.id;
        refreshed.createdAt = note.createdAt;
        refreshed.bookmarked = note.bookmarked;
        refreshed.userRating = note.userRating;
        refreshed.rating = note.rating;
        saveStudyNote(refreshed);
        loadNotes();
        
        if (viewingNote?.id === note.id) {
          setViewingNote(refreshed);
        }
        
        toast.success('Note refreshed!', {
          description: 'Content has been updated',
        });
      } else {
        toast.error('Failed to refresh note');
      }
    } catch (error) {
      console.error('Error refreshing note:', error);
      toast.error('Failed to refresh note');
    } finally {
      setProcessingJob(false);
    }
  };

  const toggleSection = (sectionHeading: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionHeading)) {
      newExpanded.delete(sectionHeading);
    } else {
      newExpanded.add(sectionHeading);
    }
    setExpandedSections(newExpanded);
  };

  const NoteCard = ({ note }: { note: StudyNote }) => {
    const isBookmarked = note.bookmarked || false;
    const userRating = note.userRating || null;
    const rating = note.rating || { up: 0, down: 0 };

    return (
      <Card className="hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-2">{note.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <Badge variant={note.category === 'college' ? 'default' : 'secondary'}>
                  {note.category === 'college' ? 'College' : 'Competitive'}
                </Badge>
                {note.stream && (
                  <Badge variant="outline">{note.stream}</Badge>
                )}
                {note.semester && (
                  <Badge variant="outline">Semester {note.semester}</Badge>
                )}
                {note.subject && (
                  <Badge variant="outline">{note.subject}</Badge>
                )}
                {note.meta && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {note.meta.readingTime} min
                  </Badge>
                )}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleBookmark(note.id!, !isBookmarked)}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {note.summary}
          </p>
          
          {note.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {note.topics.slice(0, 3).map((topic, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRate(note.id!, userRating === 'up' ? null : 'up')}
                className={userRating === 'up' ? 'text-primary' : ''}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {rating.up}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRate(note.id!, userRating === 'down' ? null : 'down')}
                className={userRating === 'down' ? 'text-destructive' : ''}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {rating.down}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRefreshNote(note)}
                disabled={processingJob}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${processingJob ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  recordActivity('study_note_viewed', { subject: note.subject, noteId: note.id });
                  window.dispatchEvent(new CustomEvent('activity-updated'));
                  setViewingNote(note);
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              Study Notes
            </h1>
            <p className="text-muted-foreground">
              Curated study notes for college subjects and competitive exams
            </p>
          </div>
          <Button 
            onClick={() => setRequestNoteOpen(true)}
            disabled={processingJob}
          >
            {processingJob ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Request Note
              </>
            )}
          </Button>
        </div>

        <Tabs value={category} onValueChange={(v) => setCategory(v as NoteCategory)} className="space-y-6">
          <TabsList>
            <TabsTrigger value="college">College Subjects</TabsTrigger>
            <TabsTrigger value="competitive">Competitive Exams</TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Notes</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by title, subject, or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {category === 'college' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stream">Stream</Label>
                      <Select value={selectedStream} onValueChange={setSelectedStream}>
                        <SelectTrigger id="stream">
                          <SelectValue placeholder="All Streams" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Streams</SelectItem>
                          {Object.keys(collegeSubjects).map(stream => (
                            <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger id="semester">
                          <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Semesters</SelectItem>
                          {selectedStream && collegeSubjects[selectedStream as keyof typeof collegeSubjects] && (
                            Object.keys(collegeSubjects[selectedStream as keyof typeof collegeSubjects]).map(sem => (
                              <SelectItem key={sem} value={sem.replace('Semester ', '')}>{sem}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Subjects</SelectItem>
                          {selectedStream && selectedSemester && collegeSubjects[selectedStream as keyof typeof collegeSubjects]?.[selectedSemester as keyof typeof collegeSubjects[typeof selectedStream]] && (
                            (collegeSubjects[selectedStream as keyof typeof collegeSubjects][selectedSemester as keyof typeof collegeSubjects[typeof selectedStream]] as string[]).map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {category === 'competitive' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exam">Exam</Label>
                      <Select value={selectedExam} onValueChange={(value) => {
                        setSelectedExam(value);
                        setSelectedTopic('');
                      }}>
                        <SelectTrigger id="exam">
                          <SelectValue placeholder="All Exams" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Exams</SelectItem>
                          {Object.keys(competitiveExamTopics).map(exam => (
                            <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                        <SelectTrigger id="topic">
                          <SelectValue placeholder="All Topics" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Topics</SelectItem>
                          {selectedExam && competitiveExamTopics[selectedExam as keyof typeof competitiveExamTopics] && (
                            (() => {
                              const examData = competitiveExamTopics[selectedExam as keyof typeof competitiveExamTopics];
                              if (Array.isArray(examData)) {
                                return examData.map((topic: string) => (
                                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ));
                              } else {
                                const topics: string[] = [];
                                Object.values(examData).forEach((streamTopics: string[]) => {
                                  topics.push(...streamTopics);
                                });
                                return [...new Set(topics)].map((topic: string) => (
                                  <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                ));
                              }
                            })()
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedSubject || selectedTopic
                      ? 'No notes found matching your criteria'
                      : 'No study notes available yet'}
                  </p>
                  <Button onClick={() => setRequestNoteOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Request Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </div>
        </Tabs>

        {/* Request Note Dialog */}
        <Dialog open={requestNoteOpen} onOpenChange={setRequestNoteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Study Note</DialogTitle>
              <DialogDescription>
                {category === 'college' 
                  ? 'Generate study notes for college subjects'
                  : 'Generate study notes for competitive exams'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="request-query">Topic / Query *</Label>
                <Input
                  id="request-query"
                  placeholder={category === 'college' 
                    ? "e.g., DBMS Normalization, Data Structures Trees"
                    : "e.g., GATE CSE Algorithms, UPSC GS Paper 1 History"}
                  value={requestQuery}
                  onChange={(e) => setRequestQuery(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {category === 'college' && selectedStream && selectedSemester && selectedSubject && (
                    <>Currently filtered: {selectedStream} - Semester {selectedSemester} - {selectedSubject}</>
                  )}
                  {category === 'competitive' && selectedExam && selectedTopic && (
                    <>Currently filtered: {selectedExam} - {selectedTopic}</>
                  )}
                </p>
              </div>
              <div>
                <Label htmlFor="request-subject">Subject (Optional)</Label>
                <Input
                  id="request-subject"
                  placeholder={selectedSubject || selectedTopic || "e.g., Database Management Systems"}
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  onFocus={(e) => {
                    if (!requestSubject && (selectedSubject || selectedTopic)) {
                      setRequestSubject(selectedSubject || selectedTopic || '');
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSubject || selectedTopic 
                    ? `Will use: ${selectedSubject || selectedTopic} (you can override)`
                    : 'Enter subject name or leave blank to use query'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRequestNoteOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestNote}
                  disabled={processingJob || !requestQuery.trim()}
                  className="flex-1"
                >
                  {processingJob ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Note Detail Dialog */}
        <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingNote && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{viewingNote.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 flex-wrap">
                    <Badge variant={viewingNote.category === 'college' ? 'default' : 'secondary'}>
                      {viewingNote.category === 'college' ? 'College' : 'Competitive'}
                    </Badge>
                    {viewingNote.stream && (
                      <Badge variant="outline">{viewingNote.stream}</Badge>
                    )}
                    {viewingNote.semester && (
                      <Badge variant="outline">Semester {viewingNote.semester}</Badge>
                    )}
                    {viewingNote.subject && (
                      <Badge variant="outline">{viewingNote.subject}</Badge>
                    )}
                    {viewingNote.meta && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {viewingNote.meta.readingTime} min read
                      </Badge>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm text-muted-foreground">{viewingNote.summary}</p>
                    </div>

                    {/* Content Sections */}
                    {viewingNote.content.map((section, idx) => (
                      <Collapsible
                        key={idx}
                        open={expandedSections.has(section.heading)}
                        onOpenChange={() => toggleSection(section.heading)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                          <h3 className="font-semibold">{section.heading}</h3>
                          {expandedSections.has(section.heading) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{section.content}</p>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}

                    {/* Examples */}
                    {viewingNote.examples.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Examples</h3>
                        <div className="space-y-3">
                          {viewingNote.examples.map((example, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4">
                                <p className="text-sm mb-2">{example.description}</p>
                                {example.code && (
                                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                    <code>{example.code}</code>
                                  </pre>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MCQs */}
                    {viewingNote.mcqs.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Quick MCQs</h3>
                        <div className="space-y-3">
                          {viewingNote.mcqs.map((mcq, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4">
                                <p className="font-medium mb-2">{mcq.question}</p>
                                <div className="space-y-1 mb-2">
                                  {mcq.options.map((option, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`p-2 rounded text-sm ${
                                        optIdx === mcq.answerIndex
                                          ? 'bg-green-100 text-green-900'
                                          : 'bg-muted'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}. {option}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">{mcq.explanation}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Flashcards */}
                    {viewingNote.flashcards.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Flashcards</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {viewingNote.flashcards.map((flashcard, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4">
                                <p className="font-medium text-sm mb-1">{flashcard.question}</p>
                                <p className="text-sm text-muted-foreground">{flashcard.answer}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {viewingNote.sources.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Sources</h3>
                        <div className="space-y-2">
                          {viewingNote.sources.map((source, idx) => (
                            <Card key={idx}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">{source.title}</p>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                      {source.snippet}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {source.domain}
                                      </Badge>
                                      {source.confidence && (
                                        <Badge variant="secondary" className="text-xs">
                                          Confidence: {(source.confidence * 100).toFixed(0)}%
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(viewingNote.id!, !viewingNote.bookmarked)}
                    >
                      {viewingNote.bookmarked ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-1" />
                          Bookmarked
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-1" />
                          Bookmark
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRate(viewingNote.id!, viewingNote.userRating === 'up' ? null : 'up')}
                      className={viewingNote.userRating === 'up' ? 'text-primary' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {viewingNote.rating?.up || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRate(viewingNote.id!, viewingNote.userRating === 'down' ? null : 'down')}
                      className={viewingNote.userRating === 'down' ? 'text-destructive' : ''}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {viewingNote.rating?.down || 0}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefreshNote(viewingNote)}
                      disabled={processingJob}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${processingJob ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: viewingNote.title,
                            text: viewingNote.summary,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied to clipboard');
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

