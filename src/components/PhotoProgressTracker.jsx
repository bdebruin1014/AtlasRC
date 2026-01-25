import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import {
  Camera,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Tag,
  Grid,
  List,
  Image,
  Download,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Eye,
  ZoomIn,
  Maximize2,
  Building,
  Upload
} from 'lucide-react';

// Demo photo data
const DEMO_PHOTOS = [
  {
    id: 'p-1',
    filename: 'foundation_pour_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Foundation Pour - North Section',
    description: 'Concrete pour in progress, north section of building footprint',
    project_id: 'proj-1',
    location: 'Building A - North Foundation',
    area: 'Foundation',
    phase: 'foundation',
    tags: ['concrete', 'foundation', 'pour'],
    taken_by: 'John Smith',
    taken_date: '2026-01-15',
    taken_time: '10:30',
    weather: 'Sunny, 45°F',
    file_size: '4.2 MB',
    dimensions: '4032 x 3024',
    is_milestone: true,
    created_at: '2026-01-15T10:30:00Z'
  },
  {
    id: 'p-2',
    filename: 'framing_progress_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Framing Progress - Level 1',
    description: 'First floor framing 75% complete',
    project_id: 'proj-1',
    location: 'Building A - Level 1',
    area: 'Framing',
    phase: 'framing',
    tags: ['framing', 'wood', 'structure'],
    taken_by: 'Mike Williams',
    taken_date: '2026-01-20',
    taken_time: '14:15',
    weather: 'Overcast, 52°F',
    file_size: '3.8 MB',
    dimensions: '4032 x 3024',
    is_milestone: false,
    created_at: '2026-01-20T14:15:00Z'
  },
  {
    id: 'p-3',
    filename: 'inspection_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Electrical Rough-In Inspection',
    description: 'Electrical rough-in ready for inspection, Unit 201',
    project_id: 'proj-1',
    location: 'Unit 201',
    area: 'Electrical',
    phase: 'rough_in',
    tags: ['electrical', 'inspection', 'rough-in'],
    taken_by: 'Sarah Johnson',
    taken_date: '2026-01-22',
    taken_time: '09:00',
    weather: 'Clear, 48°F',
    file_size: '3.5 MB',
    dimensions: '4032 x 3024',
    is_milestone: true,
    created_at: '2026-01-22T09:00:00Z'
  },
  {
    id: 'p-4',
    filename: 'site_overview_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Weekly Site Overview',
    description: 'Aerial view of construction progress',
    project_id: 'proj-1',
    location: 'Site Overview',
    area: 'Site',
    phase: 'construction',
    tags: ['overview', 'aerial', 'progress'],
    taken_by: 'John Smith',
    taken_date: '2026-01-23',
    taken_time: '11:00',
    weather: 'Sunny, 55°F',
    file_size: '5.1 MB',
    dimensions: '4032 x 3024',
    is_milestone: false,
    created_at: '2026-01-23T11:00:00Z'
  },
  {
    id: 'p-5',
    filename: 'plumbing_rough_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Plumbing Rough-In',
    description: 'Main plumbing stack installation in progress',
    project_id: 'proj-1',
    location: 'Building A - Core',
    area: 'Plumbing',
    phase: 'rough_in',
    tags: ['plumbing', 'rough-in', 'pipes'],
    taken_by: 'Mike Williams',
    taken_date: '2026-01-24',
    taken_time: '13:45',
    weather: 'Rain, 50°F',
    file_size: '3.9 MB',
    dimensions: '4032 x 3024',
    is_milestone: false,
    created_at: '2026-01-24T13:45:00Z'
  },
  {
    id: 'p-6',
    filename: 'safety_meeting_001.jpg',
    url: '/placeholder.jpg',
    thumbnail_url: '/placeholder.jpg',
    title: 'Morning Safety Briefing',
    description: 'Daily safety meeting with all trades',
    project_id: 'proj-1',
    location: 'Site Trailer',
    area: 'Safety',
    phase: 'construction',
    tags: ['safety', 'meeting', 'team'],
    taken_by: 'Sarah Johnson',
    taken_date: '2026-01-25',
    taken_time: '07:00',
    weather: 'Clear, 42°F',
    file_size: '2.8 MB',
    dimensions: '4032 x 3024',
    is_milestone: false,
    created_at: '2026-01-25T07:00:00Z'
  }
];

const PHASES = [
  { value: 'pre_construction', label: 'Pre-Construction' },
  { value: 'site_work', label: 'Site Work' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'framing', label: 'Framing' },
  { value: 'rough_in', label: 'Rough-In' },
  { value: 'insulation', label: 'Insulation' },
  { value: 'drywall', label: 'Drywall' },
  { value: 'finishes', label: 'Finishes' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'punch_list', label: 'Punch List' },
  { value: 'construction', label: 'General Construction' }
];

const AREAS = [
  'Site', 'Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC',
  'Drywall', 'Paint', 'Flooring', 'Roofing', 'Exterior', 'Interior',
  'Landscaping', 'Safety', 'Other'
];

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const PhotoProgressTracker = ({ projectId = null }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    location: '',
    area: 'Site',
    phase: 'construction',
    tags: '',
    is_milestone: false
  });

  useEffect(() => {
    loadPhotos();
  }, [projectId]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        setPhotos(DEMO_PHOTOS);
      } else {
        let query = supabase
          .from('project_photos')
          .select('*')
          .order('taken_date', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPhotos(data || []);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matches =
          photo.title?.toLowerCase().includes(search) ||
          photo.description?.toLowerCase().includes(search) ||
          photo.location?.toLowerCase().includes(search) ||
          photo.tags?.some(t => t.toLowerCase().includes(search));
        if (!matches) return false;
      }

      if (selectedPhase !== 'all' && photo.phase !== selectedPhase) return false;
      if (selectedArea !== 'all' && photo.area !== selectedArea) return false;

      if (dateRange.start) {
        const photoDate = new Date(photo.taken_date);
        const startDate = new Date(dateRange.start);
        if (photoDate < startDate) return false;
      }
      if (dateRange.end) {
        const photoDate = new Date(photo.taken_date);
        const endDate = new Date(dateRange.end);
        if (photoDate > endDate) return false;
      }

      return true;
    });
  }, [photos, searchTerm, selectedPhase, selectedArea, dateRange]);

  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredPhotos.forEach(photo => {
      const date = photo.taken_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(photo);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [filteredPhotos]);

  const stats = useMemo(() => {
    const total = photos.length;
    const milestones = photos.filter(p => p.is_milestone).length;
    const thisWeek = photos.filter(p => {
      const photoDate = new Date(p.taken_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return photoDate >= weekAgo;
    }).length;
    const uniqueAreas = [...new Set(photos.map(p => p.area))].length;

    return { total, milestones, thisWeek, uniqueAreas };
  }, [photos]);

  const handleUpload = () => {
    const newPhoto = {
      id: `p-${Date.now()}`,
      filename: 'uploaded_photo.jpg',
      url: '/placeholder.jpg',
      thumbnail_url: '/placeholder.jpg',
      ...uploadData,
      tags: uploadData.tags.split(',').map(t => t.trim()).filter(Boolean),
      project_id: projectId,
      taken_by: 'Current User',
      taken_date: new Date().toISOString().split('T')[0],
      taken_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      weather: '',
      file_size: '3.5 MB',
      dimensions: '4032 x 3024',
      created_at: new Date().toISOString()
    };

    setPhotos(prev => [newPhoto, ...prev]);
    setShowUploadModal(false);
    setUploadData({
      title: '',
      description: '',
      location: '',
      area: 'Site',
      phase: 'construction',
      tags: '',
      is_milestone: false
    });
  };

  const navigatePhoto = (direction) => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1;
    } else {
      newIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0;
    }
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Camera className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Photo Documentation</h2>
              <p className="text-sm text-gray-500">Track construction progress visually</p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <Upload className="w-4 h-4" />
            Upload Photos
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Photos</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-cyan-50 rounded-lg p-4">
            <div className="text-sm text-cyan-600">This Week</div>
            <div className="text-2xl font-bold text-cyan-700">{stats.thisWeek}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-yellow-600">Milestones</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.milestones}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600">Areas Covered</div>
            <div className="text-2xl font-bold text-purple-700">{stats.uniqueAreas}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Phases</option>
            {PHASES.map(phase => (
              <option key={phase.value} value={phase.value}>{phase.label}</option>
            ))}
          </select>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Areas</option>
            {AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 ${viewMode === 'timeline' ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-gray-50'}`}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="p-4">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No photos found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm truncate">{photo.title}</p>
                    <p className="text-white/80 text-xs">{formatDate(photo.taken_date)}</p>
                  </div>
                </div>
                {photo.is_milestone && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Milestone
                  </div>
                )}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image className="w-8 h-8 text-gray-300" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
                    {photo.is_milestone && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                        Milestone
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{photo.description}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(photo.taken_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {photo.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {photo.taken_by}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                    {photo.area}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Timeline View */
          <div className="space-y-8">
            {groupedByDate.map(([date, datePhotos]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                  <h3 className="font-medium text-gray-900">{formatDate(date)}</h3>
                  <span className="text-sm text-gray-500">{datePhotos.length} photo{datePhotos.length > 1 ? 's' : ''}</span>
                </div>
                <div className="ml-6 border-l-2 border-gray-200 pl-6">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {datePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square group"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-300" />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        {photo.is_milestone && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigatePhoto('prev')}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={() => navigatePhoto('next')}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full mx-4">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center bg-gray-900">
                <Image className="w-24 h-24 text-gray-600" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium text-lg">{selectedPhoto.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{selectedPhoto.description}</p>
                  </div>
                  {selectedPhoto.is_milestone && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Milestone
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="text-white ml-2">{selectedPhoto.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Area:</span>
                    <span className="text-white ml-2">{selectedPhoto.area}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="text-white ml-2">{formatDate(selectedPhoto.taken_date)} at {selectedPhoto.taken_time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Taken by:</span>
                    <span className="text-white ml-2">{selectedPhoto.taken_by}</span>
                  </div>
                  {selectedPhoto.weather && (
                    <div>
                      <span className="text-gray-500">Weather:</span>
                      <span className="text-white ml-2">{selectedPhoto.weather}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="text-white ml-2">{selectedPhoto.file_size} ({selectedPhoto.dimensions})</span>
                  </div>
                </div>

                {selectedPhoto.tags?.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                    <Maximize2 className="w-4 h-4" />
                    Full Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Upload Photos</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">Drag and drop photos here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <button className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                  Select Files
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={uploadData.location}
                    onChange={(e) => setUploadData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select
                    value={uploadData.area}
                    onChange={(e) => setUploadData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    {AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
                <select
                  value={uploadData.phase}
                  onChange={(e) => setUploadData(prev => ({ ...prev, phase: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  {PHASES.map(phase => (
                    <option key={phase.value} value={phase.value}>{phase.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., foundation, concrete, inspection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadData.is_milestone}
                  onChange={(e) => setUploadData(prev => ({ ...prev, is_milestone: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">Mark as milestone photo</span>
              </label>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadData.title}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoProgressTracker;
