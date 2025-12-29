import { useState, useEffect } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Plus, Edit2, Trash2, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NoteSection {
  heading: string;
  content: string;
}

interface StudyNote {
  id: string;
  title: string;
  subject: string;
  summary: string;
  sections: NoteSection[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'personal_study_notes';

export default function StudentStudyNotes() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    subject: '',
    summary: '',
    sections: [{ heading: '', content: '' }]
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = (updatedNotes: StudyNote[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const handleCreateNote = () => {
    if (!noteForm.title.trim() || !noteForm.subject.trim()) {
      toast.error('Title and Subject are required');
      return;
    }

    const newNote: StudyNote = {
      id: editingNote?.id || crypto.randomUUID(),
      title: noteForm.title,
      subject: noteForm.subject,
      summary: noteForm.summary,
      sections: noteForm.sections,
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = editingNote
      ? notes.map(n => n.id === editingNote.id ? newNote : n)
      : [...notes, newNote];

    saveNotes(updatedNotes);
    setCreateNoteOpen(false);
    setEditingNote(null);
    setNoteForm({
      title: '',
      subject: '',
      summary: '',
      sections: [{ heading: '', content: '' }]
    });
    toast.success(editingNote ? 'Note updated successfully' : 'Note created successfully');
  };

  const handleEditNote = (note: StudyNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      subject: note.subject,
      summary: note.summary,
      sections: note.sections.length > 0 ? note.sections : [{ heading: '', content: '' }]
    });
    setCreateNoteOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      saveNotes(updatedNotes);
      toast.success('Note deleted');
    }
  };

  const addSection = () => {
    setNoteForm({
      ...noteForm,
      sections: [...noteForm.sections, { heading: '', content: '' }]
    });
  };

  const updateSection = (index: number, field: 'heading' | 'content', value: string) => {
    const newSections = [...noteForm.sections];
    newSections[index][field] = value;
    setNoteForm({ ...noteForm, sections: newSections });
  };

  const removeSection = (index: number) => {
    if (noteForm.sections.length <= 1) return;
    const newSections = noteForm.sections.filter((_, i) => i !== index);
    setNoteForm({ ...noteForm, sections: newSections });
  };

  const getReadingTime = (sections: NoteSection[]) => {
    const wordCount = sections.reduce((acc, s) => acc + s.content.split(/\s+/).length, 0);
    return Math.ceil(wordCount / 200) || 1;
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
              My Study Notes
            </h1>
            <p className="text-muted-foreground">
              Create and organize your personal study notes
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingNote(null);
              setNoteForm({
                title: '',
                subject: '',
                summary: '',
                sections: [{ heading: '', content: '' }]
              });
              setCreateNoteOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>

          {notes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No notes yet. Click the "Create Note" button above to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Card key={note.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">{note.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{note.subject}</Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getReadingTime(note.sections)} min
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {note.summary && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {note.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {note.sections.length} section{note.sections.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setViewingNote(note)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Note Dialog */}
        <Dialog open={createNoteOpen} onOpenChange={setCreateNoteOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
              <DialogDescription>
                Build your own knowledge base by adding notes manually.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="note-title">Title *</Label>
                      <Input
                        id="note-title"
                        placeholder="e.g., Intro to Neural Networks"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note-subject">Subject *</Label>
                      <Input
                        id="note-subject"
                        placeholder="e.g., Computer Science"
                        value={noteForm.subject}
                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note-summary">Summary (Optional)</Label>
                    <Textarea
                      id="note-summary"
                      placeholder="Enter a brief summary of this note..."
                      className="resize-none"
                      rows={2}
                      value={noteForm.summary}
                      onChange={(e) => setNoteForm({ ...noteForm, summary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Content Sections</h3>
                    <Button variant="outline" size="sm" onClick={addSection}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Section
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {noteForm.sections.map((section, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-muted/30 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => removeSection(idx)}
                          disabled={noteForm.sections.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="space-y-3">
                          <Input
                            placeholder="Section Heading (e.g., Implementation)"
                            className="bg-background font-semibold"
                            value={section.heading}
                            onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                          />
                          <Textarea
                            placeholder="Enter section content..."
                            className="bg-background min-h-[100px]"
                            value={section.content}
                            onChange={(e) => updateSection(idx, 'content', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setCreateNoteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote}>
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Note Dialog */}
        <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewingNote && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{viewingNote.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{viewingNote.subject}</Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getReadingTime(viewingNote.sections)} min read
                    </Badge>
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6">
                    {viewingNote.summary && (
                      <div>
                        <h3 className="font-semibold mb-2">Summary</h3>
                        <p className="text-sm text-muted-foreground">{viewingNote.summary}</p>
                      </div>
                    )}

                    {viewingNote.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold mb-2">{section.heading}</h3>
                        <p className="text-sm whitespace-pre-wrap">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {new Date(viewingNote.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setViewingNote(null);
                      handleEditNote(viewingNote);
                    }}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button onClick={() => setViewingNote(null)}>
                      Close
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
