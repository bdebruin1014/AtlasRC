import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Play,
  Clock,
  CheckCircle2,
  BookOpen,
  Filter,
  Grid,
  List,
  Star,
  Award,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Settings,
  BarChart3,
  PlayCircle,
  Pause,
  Volume2
} from 'lucide-react';

const TrainingVideoLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen },
    { id: 'projects', name: 'Projects & Units', icon: Building2 },
    { id: 'accounting', name: 'Accounting', icon: DollarSign },
    { id: 'pipeline', name: 'Deal Pipeline', icon: BarChart3 },
    { id: 'team', name: 'Team Management', icon: Users },
    { id: 'advanced', name: 'Advanced Features', icon: Settings }
  ];

  const videos = [
    {
      id: 1,
      title: 'Welcome to AtlasRC',
      description: 'A comprehensive introduction to the platform and its core features',
      category: 'getting-started',
      level: 'beginner',
      duration: '5:30',
      thumbnail: '/api/placeholder/320/180',
      progress: 100,
      completed: true,
      views: 2450,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Navigating the Dashboard',
      description: 'Learn to use the main dashboard and customize your view',
      category: 'getting-started',
      level: 'beginner',
      duration: '4:15',
      thumbnail: '/api/placeholder/320/180',
      progress: 100,
      completed: true,
      views: 1890,
      rating: 4.7
    },
    {
      id: 3,
      title: 'Creating Your First Project',
      description: 'Step-by-step guide to setting up a new development project',
      category: 'projects',
      level: 'beginner',
      duration: '8:45',
      thumbnail: '/api/placeholder/320/180',
      progress: 65,
      completed: false,
      views: 1654,
      rating: 4.9
    },
    {
      id: 4,
      title: 'Multi-Unit Project Setup',
      description: 'Configure projects with lots, homes for sale, or rental units',
      category: 'projects',
      level: 'intermediate',
      duration: '12:20',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 987,
      rating: 4.8
    },
    {
      id: 5,
      title: 'Subdivision Management Deep Dive',
      description: 'Advanced techniques for managing large subdivision projects',
      category: 'projects',
      level: 'advanced',
      duration: '18:30',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 567,
      rating: 4.9
    },
    {
      id: 6,
      title: 'Unit Inventory & Pricing',
      description: 'Set up pricing matrices and track unit availability',
      category: 'projects',
      level: 'intermediate',
      duration: '10:15',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 743,
      rating: 4.6
    },
    {
      id: 7,
      title: 'Deal Pipeline Basics',
      description: 'Track opportunities from sourcing through closing',
      category: 'pipeline',
      level: 'beginner',
      duration: '7:40',
      thumbnail: '/api/placeholder/320/180',
      progress: 30,
      completed: false,
      views: 1234,
      rating: 4.7
    },
    {
      id: 8,
      title: 'Multi-Property Acquisitions',
      description: 'Link multiple parcels to a single acquisition deal',
      category: 'pipeline',
      level: 'intermediate',
      duration: '9:20',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 654,
      rating: 4.8
    },
    {
      id: 9,
      title: 'Accounting Fundamentals',
      description: 'Set up your chart of accounts and track transactions',
      category: 'accounting',
      level: 'beginner',
      duration: '11:00',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 1098,
      rating: 4.5
    },
    {
      id: 10,
      title: 'Budget Management & Tracking',
      description: 'Create budgets and monitor variances in real-time',
      category: 'accounting',
      level: 'intermediate',
      duration: '14:25',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 876,
      rating: 4.7
    },
    {
      id: 11,
      title: 'Draw Request Processing',
      description: 'Submit, track, and manage construction draws',
      category: 'accounting',
      level: 'intermediate',
      duration: '8:50',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 765,
      rating: 4.8
    },
    {
      id: 12,
      title: 'Team & Permission Management',
      description: 'Add users and configure role-based access control',
      category: 'team',
      level: 'beginner',
      duration: '6:30',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 543,
      rating: 4.6
    },
    {
      id: 13,
      title: 'Advanced Reporting',
      description: 'Create custom reports and dashboards',
      category: 'advanced',
      level: 'advanced',
      duration: '15:45',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 432,
      rating: 4.9
    },
    {
      id: 14,
      title: 'API Integrations',
      description: 'Connect AtlasRC with your other business tools',
      category: 'advanced',
      level: 'advanced',
      duration: '20:00',
      thumbnail: '/api/placeholder/320/180',
      progress: 0,
      completed: false,
      views: 234,
      rating: 4.7
    }
  ];

  const learningPaths = [
    {
      id: 1,
      title: 'New User Essentials',
      description: 'Everything you need to get started',
      videoCount: 5,
      totalDuration: '32 min',
      progress: 40,
      level: 'beginner'
    },
    {
      id: 2,
      title: 'Project Manager Track',
      description: 'Master project and unit management',
      videoCount: 8,
      totalDuration: '1 hr 15 min',
      progress: 12,
      level: 'intermediate'
    },
    {
      id: 3,
      title: 'Accounting Deep Dive',
      description: 'Financial tracking and reporting mastery',
      videoCount: 6,
      totalDuration: '55 min',
      progress: 0,
      level: 'intermediate'
    },
    {
      id: 4,
      title: 'Power User Certification',
      description: 'Advanced features and customization',
      videoCount: 10,
      totalDuration: '2 hr 30 min',
      progress: 0,
      level: 'advanced'
    }
  ];

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = !searchQuery ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
      const matchesLevel = levelFilter === 'all' || video.level === levelFilter;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [searchQuery, categoryFilter, levelFilter]);

  const totalWatched = videos.filter(v => v.completed).length;
  const inProgress = videos.filter(v => v.progress > 0 && !v.completed).length;
  const totalDuration = videos.reduce((acc, v) => {
    const [min, sec] = v.duration.split(':').map(Number);
    return acc + min + sec / 60;
  }, 0);

  const getLevelBadge = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderVideoCard = (video) => (
    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <PlayCircle className="w-16 h-16 text-white opacity-80" />
        </div>
        {video.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <Progress value={video.progress} className="h-1 rounded-none" />
          </div>
        )}
        {video.completed && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={getLevelBadge(video.level)} variant="secondary">
            {video.level}
          </Badge>
          <Badge variant="outline">
            {categories.find(c => c.id === video.category)?.name}
          </Badge>
        </div>
        <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>{video.views.toLocaleString()} views</span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {video.rating}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const renderVideoListItem = (video) => (
    <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="relative w-40 flex-shrink-0">
        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
          <PlayCircle className="w-8 h-8 text-white opacity-80" />
        </div>
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
          {video.duration}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={getLevelBadge(video.level)} variant="secondary">
            {video.level}
          </Badge>
          {video.completed && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <h3 className="font-semibold">{video.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-1">{video.description}</p>
        {video.progress > 0 && !video.completed && (
          <div className="mt-2">
            <Progress value={video.progress} className="h-1" />
            <span className="text-xs text-gray-500">{video.progress}% complete</span>
          </div>
        )}
      </div>
      <div className="text-right text-sm text-gray-500">
        <div>{video.views.toLocaleString()} views</div>
        <div className="flex items-center gap-1 justify-end">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          {video.rating}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Training Video Library</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Video Library</h1>
          <p className="text-gray-600 mt-2">Learn AtlasRC through guided video tutorials</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Videos Completed</p>
                <p className="text-2xl font-bold">{totalWatched}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{inProgress}</p>
              </div>
              <Play className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Videos</p>
                <p className="text-2xl font-bold">{videos.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Duration</p>
                <p className="text-2xl font-bold">{Math.round(totalDuration)} min</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Learning Paths
          </CardTitle>
          <CardDescription>Follow curated paths to master specific areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningPaths.map((path) => (
              <div key={path.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <Badge className={getLevelBadge(path.level)} variant="secondary">
                  {path.level}
                </Badge>
                <h3 className="font-semibold mt-2">{path.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{path.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{path.videoCount} videos</span>
                  <span>{path.totalDuration}</span>
                </div>
                {path.progress > 0 && (
                  <div className="mt-3">
                    <Progress value={path.progress} className="h-2" />
                    <span className="text-xs text-gray-500">{path.progress}% complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search videos..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      <Card>
        <CardHeader>
          <CardTitle>All Videos ({filteredVideos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVideos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No videos found matching your criteria</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map(renderVideoCard)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map(renderVideoListItem)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingVideoLibraryPage;
