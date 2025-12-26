import { useState, useEffect, useMemo } from 'react';
import { MentorNavbar } from '@/components/MentorNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, AlertTriangle, TrendingUp, TrendingDown, Users, UserCheck, Sparkles } from 'lucide-react';
import { getMentorStudents, type Student } from '@/services/mentorStudents';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { generateOpenRouterText } from '@/services/gemini';

type SortOption = 'alphabetical' | 'highest-progress' | 'lowest-progress' | 'at-risk';
type PerformanceFilter = 'all' | 'Good' | 'Average' | 'Needs Attention';
type BranchFilter = 'all' | 'CSE' | 'ECE' | 'Civil' | 'Mechanical';

export default function MentorStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const { data: students = [], isLoading, refetch } = useQuery({
    queryKey: ['mentor-students', user?.id],
    queryFn: () => getMentorStudents(user?.id || ''),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Generate AI insights
  useEffect(() => {
    if (students.length > 0 && !aiInsights && !loadingInsights) {
      setLoadingInsights(true);
      generateInsights(students)
        .then((insights) => {
          setAiInsights(insights);
          setLoadingInsights(false);
        })
        .catch(() => {
          setLoadingInsights(false);
        });
    }
  }, [students, aiInsights, loadingInsights]);

  const generateInsights = async (studentList: Student[]): Promise<string> => {
    const atRiskCount = studentList.filter((s) => s.performanceStatus === 'Needs Attention').length;
    const avgProgress = studentList.length > 0 
      ? studentList.reduce((sum, s) => sum + s.currentProgress, 0) / studentList.length 
      : 0;
    const topPerformers = studentList
      .filter((s) => s.performanceStatus === 'Good')
      .sort((a, b) => b.currentProgress - a.currentProgress)
      .slice(0, 3)
      .map((s) => s.name);

    // Collect weak topics
    const weakTopicMap: { [key: string]: number } = {};
    studentList.forEach((student) => {
      student.weakAreas.forEach((area) => {
        weakTopicMap[area] = (weakTopicMap[area] || 0) + 1;
      });
    });
    const commonWeakTopic = Object.entries(weakTopicMap)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None identified';

    try {
      const prompt = `You are an educational mentor AI assistant. Provide brief, actionable insights based on the following class data:

Total Students: ${studentList.length}
At-Risk Students: ${atRiskCount}
Average Progress: ${avgProgress.toFixed(1)}%
Top Performers: ${topPerformers.join(', ') || 'None'}
Most Common Weak Topic: ${commonWeakTopic}

Provide 3-4 bullet points with:
1. Number of students needing attention today
2. Overall class performance trend
3. Top performers recognition
4. Common weak topic that needs class-wide focus

Keep it concise, professional, and actionable. Format as bullet points.`;

      const insights = await generateOpenRouterText(prompt);
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return `• ${atRiskCount} students need attention today\n• Average class progress: ${avgProgress.toFixed(1)}%\n• Top performers: ${topPerformers.join(', ') || 'None'}\n• Common weak topic: ${commonWeakTopic}`;
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.rollNumber.toLowerCase().includes(query) ||
          student.branch.toLowerCase().includes(query)
      );
    }

    // Branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter((student) => student.branch === branchFilter);
    }

    // Semester filter
    if (semesterFilter !== 'all') {
      filtered = filtered.filter((student) => student.semester === parseInt(semesterFilter));
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter((student) => student.performanceStatus === performanceFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) =>
        statusFilter === 'active' ? student.isActive : !student.isActive
      );
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'highest-progress':
        filtered.sort((a, b) => b.currentProgress - a.currentProgress);
        break;
      case 'lowest-progress':
        filtered.sort((a, b) => a.currentProgress - b.currentProgress);
        break;
      case 'at-risk':
        filtered.sort((a, b) => {
          if (a.performanceStatus === 'Needs Attention' && b.performanceStatus !== 'Needs Attention') return -1;
          if (a.performanceStatus !== 'Needs Attention' && b.performanceStatus === 'Needs Attention') return 1;
          return a.currentProgress - b.currentProgress;
        });
        break;
    }

    return filtered;
  }, [students, searchQuery, branchFilter, semesterFilter, performanceFilter, statusFilter, sortBy]);

  // Separate at-risk students
  const atRiskStudents = useMemo(
    () => filteredAndSortedStudents.filter((s) => s.performanceStatus === 'Needs Attention'),
    [filteredAndSortedStudents]
  );

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'CSE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ECE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Civil':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Mechanical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'Good':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Needs Attention':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleViewReport = (studentId: string) => {
    navigate(`/mentor/students/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MentorNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Students</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your assigned students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter((s) => s.isActive).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">At-Risk Students</p>
                  <p className="text-2xl font-bold text-red-600">{atRiskStudents.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold text-primary">
                    {students.length > 0
                      ? Math.round(
                          students.reduce((sum, s) => sum + s.currentProgress, 0) / students.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Mentor Insights (AI)
            </CardTitle>
            <CardDescription>AI-generated insights about your students</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInsights ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiInsights ? (
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm">{aiInsights}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Generating insights...</p>
            )}
          </CardContent>
        </Card>

        {/* At-Risk Students Section */}
        {atRiskStudents.length > 0 && (
          <Card className="mb-6 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                At-Risk Students ({atRiskStudents.length})
              </CardTitle>
              <CardDescription>
                Students requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {atRiskStudents.slice(0, 6).map((student) => (
                  <Card
                    key={student.id}
                    className="border-red-200 dark:border-red-900 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewReport(student.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={student.profilePicture} />
                          <AvatarFallback>
                            {student.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNumber} • Sem {student.semester} • {student.branch}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span className="text-red-600 font-medium">{student.currentProgress}%</span>
                            </div>
                            <Progress value={student.currentProgress} className="h-2" />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {student.weakAreas.slice(0, 2).map((area, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find students by name, email, roll number, or branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <Select value={branchFilter} onValueChange={(value) => setBranchFilter(value as BranchFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="ECE">ECE</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                </SelectContent>
              </Select>

              {/* Semester Filter */}
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Performance Filter */}
              <Select
                value={performanceFilter}
                onValueChange={(value) => setPerformanceFilter(value as PerformanceFilter)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="highest-progress">Highest Progress</SelectItem>
                  <SelectItem value="lowest-progress">Lowest Progress</SelectItem>
                  <SelectItem value="at-risk">Most At-Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedStudents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No students found</p>
              <p className="text-muted-foreground">
                {searchQuery || branchFilter !== 'all' || semesterFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No students assigned yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStudents.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4"
                style={{
                  borderLeftColor:
                    student.performanceStatus === 'Needs Attention'
                      ? 'rgb(239 68 68)'
                      : student.performanceStatus === 'Good'
                      ? 'rgb(34 197 94)'
                      : 'rgb(234 179 8)',
                }}
                onClick={() => handleViewReport(student.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profilePicture} />
                      <AvatarFallback>
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {student.rollNumber}
                          </p>
                        </div>
                        {student.performanceStatus === 'Needs Attention' && (
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={getBranchColor(student.branch)}>
                          {student.branch}
                        </Badge>
                        <Badge variant="outline">Semester {student.semester}</Badge>
                        <Badge className={getPerformanceColor(student.performanceStatus)}>
                          {student.performanceStatus}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{student.currentProgress}%</span>
                          </div>
                          <Progress value={student.currentProgress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Last active: {student.lastActiveTime}</span>
                          <span>Accuracy: {student.accuracy.toFixed(1)}%</span>
                        </div>
                      </div>

                      {student.weakAreas.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Weak Areas:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.weakAreas.slice(0, 3).map((area, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {student.weakAreas.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.weakAreas.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReport(student.id);
                        }}
                      >
                        View Detailed Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredAndSortedStudents.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredAndSortedStudents.length} of {students.length} students
          </div>
        )}
      </main>
    </div>
  );
}

