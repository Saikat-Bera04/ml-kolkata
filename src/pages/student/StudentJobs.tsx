import { useState, useEffect } from 'react';
import { StudentNavbar } from '@/components/StudentNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchJobs, type JobResult, extractCompanyName, extractJobType, extractWorkType, type JobSearchParams } from '@/services/jobSearch';
import { recordActivity } from '@/services/activityTracker';
import { Loader2, Search, MapPin, Briefcase, Clock, ExternalLink, Bookmark, BookmarkCheck, FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface SavedJob extends JobResult {
  savedAt: Date;
}

export default function StudentJobs() {
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    field: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    workType: '',
  });
  
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async () => {
    if (!searchParams.field || !searchParams.location) {
      alert('Please fill in Field and Location');
      return;
    }

    setLoading(true);
    setCurrentPage(1);
    
    try {
      const result = await searchJobs(searchParams, 1);
      setJobs(result.jobs);
      setTotalResults(result.totalResults);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    setLoading(true);
    
    try {
      const result = await searchJobs(searchParams, (nextPage - 1) * 10 + 1);
      setJobs([...jobs, ...result.jobs]);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (job: JobResult) => {
    const savedJob: SavedJob = {
      ...job,
      savedAt: new Date(),
    };
    
    const updated = [...savedJobs, savedJob];
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
    
    // Record activity
    recordActivity('job_saved', { jobTitle: job.title, company: extractCompanyName(job) });
    window.dispatchEvent(new CustomEvent('activity-updated'));
  };

  const handleUnsaveJob = (jobLink: string) => {
    const updated = savedJobs.filter(j => {
      const link = j.apply_link || j.link;
      return link !== jobLink;
    });
    setSavedJobs(updated);
    localStorage.setItem('savedJobs', JSON.stringify(updated));
  };

  const isJobSaved = (jobLink: string) => {
    return savedJobs.some(j => {
      const link = j.apply_link || j.link;
      return link === jobLink;
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      try {
        const { extractTextFromPDF } = await import('@/services/gemini');
        const text = await extractTextFromPDF(file);
        setResumeText(text);
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        setResumeText('Failed to extract text from PDF. Please paste the resume text manually.');
      }
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      alert('Please upload a resume or enter resume text');
      return;
    }

    setAnalyzing(true);
    try {
      const { analyzeResume } = await import('@/services/gemini');
      const jobDesc = selectedJob ? `${selectedJob.title} - ${selectedJob.snippet}` : undefined;
      const result = await analyzeResume(resumeText, jobDesc);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const JobCard = ({ job }: { job: JobResult }) => {
    const companyName = extractCompanyName(job);
    const jobType = extractJobType(job, searchParams);
    const workType = extractWorkType(job, searchParams);
    const applyLink = job.apply_link || job.link || '#';
    const saved = isJobSaved(applyLink);
    const jobLocation = job.location || searchParams.location;
    const jobDescription = job.description || job.snippet || 'No description available';
    const experienceLevel = job.experience_level || searchParams.experienceLevel;

    return (
      <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {companyName}
                </Badge>
                {job.industry && (
                  <Badge variant="outline">{job.industry}</Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {jobLocation}
                </Badge>
                <Badge variant="outline">{jobType}</Badge>
                <Badge variant={workType === 'Remote' ? 'default' : 'outline'}>
                  {workType}
                </Badge>
                {experienceLevel && (
                  <Badge variant="outline">{experienceLevel}</Badge>
                )}
                {job.salary_range && (
                  <Badge variant="secondary">{job.salary_range}</Badge>
                )}
              </div>
              {job.posted_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {job.posted_date}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => saved ? handleUnsaveJob(applyLink) : handleSaveJob(job)}
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {jobDescription}
          </p>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(job)}
                >
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{job.title}</DialogTitle>
                  <DialogDescription>
                    {companyName} • {jobLocation}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <p className="text-sm text-muted-foreground">{jobDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{jobType}</Badge>
                    <Badge>{workType}</Badge>
                    {experienceLevel && (
                      <Badge>{experienceLevel}</Badge>
                    )}
                    {job.salary_range && (
                      <Badge variant="secondary">{job.salary_range}</Badge>
                    )}
                    {job.industry && (
                      <Badge variant="outline">{job.industry}</Badge>
                    )}
                  </div>
                  {job.posted_date && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Posted: {job.posted_date}
                    </div>
                  )}
                  <Button
                    className="w-full text-lg py-6 hover:scale-105 transition-transform"
                    onClick={() => window.open(applyLink, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Apply Now
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className="flex-1 text-base py-6 hover:scale-105 transition-transform"
              onClick={() => window.open(applyLink, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Search</h1>
          <p className="text-muted-foreground">
            Find real job openings with working apply links from top job sites
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList>
            <TabsTrigger value="search">Search Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
            <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search Filters</CardTitle>
                <CardDescription>Fill in the details to find relevant jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="field">Field / Job Role *</Label>
                    <Input
                      id="field"
                      placeholder="e.g., Software Developer"
                      value={searchParams.field}
                      onChange={(e) => setSearchParams({ ...searchParams, field: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Bengaluru"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={searchParams.jobType}
                      onValueChange={(value) => setSearchParams({ ...searchParams, jobType: value })}
                    >
                      <SelectTrigger id="jobType">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
                        <SelectItem value="Volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select
                      value={searchParams.experienceLevel}
                      onValueChange={(value) => setSearchParams({ ...searchParams, experienceLevel: value })}
                    >
                      <SelectTrigger id="experience">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                        <SelectItem value="Entry Level">Entry Level</SelectItem>
                        <SelectItem value="Associate">Associate</SelectItem>
                        <SelectItem value="Mid Senior Level">Mid Senior Level</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Type</Label>
                    <Select
                      value={searchParams.workType}
                      onValueChange={(value) => setSearchParams({ ...searchParams, workType: value })}
                    >
                      <SelectTrigger id="workType">
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Jobs
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Search Results */}
            {jobs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {totalResults} jobs
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {jobs.map((job, index) => (
                    <JobCard key={index} job={job} />
                  ))}
                </div>
                {jobs.length < totalResults && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Jobs'
                    )}
                  </Button>
                )}
              </div>
            )}

            {jobs.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Enter search criteria and click "Search Jobs" to find opportunities
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved" className="space-y-4">
            {savedJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No saved jobs yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedJobs.map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resume Analysis Tab */}
          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resume & Cover Letter Suggestions</CardTitle>
                <CardDescription>
                  Upload your resume or paste resume text to get AI-powered suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume-upload">Upload Resume (PDF)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="resume-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      className="flex-1"
                    />
                    {resumeFile && (
                      <Badge variant="secondary">
                        <FileText className="h-3 w-3 mr-1" />
                        {resumeFile.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume-text">Or Paste Resume Text</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={10}
                  />
                </div>

                {selectedJob && (
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-sm font-semibold mb-2">Analyzing for:</p>
                    <p className="text-sm">{selectedJob.title}</p>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleAnalyzeResume}
                  disabled={analyzing || !resumeText.trim()}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Analyze Resume
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
                      </div>
                      
                      {analysisResult.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Strengths</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysisResult.strengths.map((strength: string, idx: number) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysisResult.improvements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysisResult.improvements.map((improvement: string, idx: number) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysisResult.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Suggestions</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {analysisResult.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

