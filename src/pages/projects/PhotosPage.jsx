import React, { useState } from 'react';
import { Plus, Search, X, Download, Upload, Calendar, Camera, Image, Grid, List, Filter, ChevronLeft, ChevronRight, Maximize2, Trash2, Tag, MapPin, Clock, User, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PhotosPage = ({ projectId }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'timeline'
  const [filterCategory, setFilterCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [photos, setPhotos] = useState([
    // December 2024
    { id: 1, filename: 'IMG_1234.jpg', category: 'progress', unit: 'All', date: '2024-12-20', uploadedBy: 'Mike Johnson', description: 'Framing progress - Building A nearly complete', tags: ['framing', 'building-a'], featured: true },
    { id: 2, filename: 'IMG_1235.jpg', category: 'progress', unit: 'Unit 1', date: '2024-12-20', uploadedBy: 'Mike Johnson', description: 'Unit 1 - Interior drywall complete', tags: ['drywall', 'unit-1'], featured: false },
    { id: 3, filename: 'IMG_1236.jpg', category: 'progress', unit: 'Unit 1', date: '2024-12-20', uploadedBy: 'Mike Johnson', description: 'Unit 1 - Kitchen cabinets installed', tags: ['cabinets', 'kitchen', 'unit-1'], featured: true },
    { id: 4, filename: 'IMG_1237.jpg', category: 'progress', unit: 'Unit 2', date: '2024-12-18', uploadedBy: 'Mike Johnson', description: 'Unit 2 - Flooring installation', tags: ['flooring', 'unit-2'], featured: false },
    { id: 5, filename: 'IMG_1238.jpg', category: 'exterior', unit: 'All', date: '2024-12-15', uploadedBy: 'Sarah Mitchell', description: 'Site overview from street', tags: ['exterior', 'aerial'], featured: true },
    { id: 6, filename: 'IMG_1239.jpg', category: 'progress', unit: 'Unit 3', date: '2024-12-15', uploadedBy: 'Mike Johnson', description: 'Unit 3 - Electrical rough-in', tags: ['electrical', 'unit-3'], featured: false },
    // November 2024
    { id: 7, filename: 'IMG_1200.jpg', category: 'progress', unit: 'All', date: '2024-11-20', uploadedBy: 'Mike Johnson', description: 'Roof trusses installed on Building A', tags: ['roofing', 'building-a'], featured: true },
    { id: 8, filename: 'IMG_1201.jpg', category: 'progress', unit: 'All', date: '2024-11-15', uploadedBy: 'Mike Johnson', description: 'Framing in progress - all buildings', tags: ['framing'], featured: false },
    { id: 9, filename: 'IMG_1202.jpg', category: 'exterior', unit: 'All', date: '2024-11-10', uploadedBy: 'Sarah Mitchell', description: 'Street view with framing', tags: ['exterior', 'framing'], featured: false },
    // October 2024
    { id: 10, filename: 'IMG_1150.jpg', category: 'progress', unit: 'All', date: '2024-10-25', uploadedBy: 'Mike Johnson', description: 'Foundation complete - all units', tags: ['foundation'], featured: true },
    { id: 11, filename: 'IMG_1151.jpg', category: 'progress', unit: 'Unit 1', date: '2024-10-20', uploadedBy: 'Mike Johnson', description: 'Unit 1 foundation pour', tags: ['foundation', 'unit-1'], featured: false },
    { id: 12, filename: 'IMG_1152.jpg', category: 'progress', unit: 'Unit 2', date: '2024-10-20', uploadedBy: 'Mike Johnson', description: 'Unit 2 foundation forms', tags: ['foundation', 'unit-2'], featured: false },
    // September 2024
    { id: 13, filename: 'IMG_1100.jpg', category: 'site', unit: 'All', date: '2024-09-15', uploadedBy: 'Sarah Mitchell', description: 'Site grading complete', tags: ['grading', 'sitework'], featured: true },
    { id: 14, filename: 'IMG_1101.jpg', category: 'site', unit: 'All', date: '2024-09-10', uploadedBy: 'Mike Johnson', description: 'Utility trenching', tags: ['utilities', 'sitework'], featured: false },
    // Pre-construction
    { id: 15, filename: 'IMG_1000.jpg', category: 'site', unit: 'All', date: '2024-03-01', uploadedBy: 'Bryan VanRock', description: 'Site before construction', tags: ['before', 'site'], featured: true },
    { id: 16, filename: 'IMG_1001.jpg', category: 'site', unit: 'All', date: '2024-03-01', uploadedBy: 'Bryan VanRock', description: 'Land acquisition - aerial view', tags: ['before', 'aerial'], featured: false },
  ]);

  const categories = [
    { id: 'all', name: 'All Photos' },
    { id: 'progress', name: 'Progress' },
    { id: 'exterior', name: 'Exterior' },
    { id: 'interior', name: 'Interior' },
    { id: 'site', name: 'Site' },
    { id: 'closing', name: 'Closing' },
    { id: 'marketing', name: 'Marketing' },
  ];

  const filteredPhotos = photos.filter(photo => {
    if (filterCategory === 'all') return true;
    return photo.category === filterCategory;
  });

  // Group photos by month for timeline view
  const groupedPhotos = filteredPhotos.reduce((groups, photo) => {
    const date = new Date(photo.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(photo);
    return groups;
  }, {});

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (lightboxIndex < filteredPhotos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const totalPhotos = photos.length;
  const featuredPhotos = photos.filter(p => p.featured).length;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Photos</h1>
          <p className="text-sm text-gray-500">{totalPhotos} photos • {featuredPhotos} featured</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Download All</Button>
          <Button className="bg-[#047857] hover:bg-[#065f46]" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-1" />Upload Photos
          </Button>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search photos..." className="pl-9" />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select className="border rounded-md px-3 py-2 text-sm">
            <option value="">All Units</option>
            <option>All</option>
            <option>Unit 1</option>
            <option>Unit 2</option>
            <option>Unit 3</option>
          </select>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded", viewMode === 'grid' && "bg-white shadow")}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('timeline')} className={cn("p-2 rounded", viewMode === 'timeline' && "bg-white shadow")}>
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-4 gap-4">
          {filteredPhotos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="bg-white border rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedPhoto(photo);
                openLightbox(index);
              }}
            >
              <div className="aspect-square bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-300" />
                </div>
                {photo.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs rounded">Featured</div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{photo.description}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{photo.date}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded capitalize">{photo.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {Object.entries(groupedPhotos).map(([monthYear, monthPhotos]) => (
            <div key={monthYear}>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                {monthYear}
                <span className="text-sm font-normal text-gray-500">({monthPhotos.length} photos)</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {monthPhotos.map((photo, index) => {
                  const globalIndex = filteredPhotos.findIndex(p => p.id === photo.id);
                  return (
                    <div 
                      key={photo.id}
                      className="bg-white border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openLightbox(globalIndex)}
                    >
                      <div className="aspect-square bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-300" />
                        </div>
                        {photo.featured && (
                          <div className="absolute top-1 left-1 w-2 h-2 bg-amber-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs truncate">{photo.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Upload Photos</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium mb-2">Drag & drop photos here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button variant="outline">Select Photos</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Category</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Unit</label>
                  <select className="w-full border rounded-md px-3 py-2">
                    <option>All</option>
                    <option>Unit 1</option>
                    <option>Unit 2</option>
                    <option>Unit 3</option>
                    <option>Unit 4</option>
                    <option>Unit 5</option>
                    <option>Unit 6</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Date</label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <Input placeholder="Brief description of photos" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Tags</label>
                <Input placeholder="framing, exterior, etc. (comma separated)" />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button className="bg-[#047857] hover:bg-[#065f46]">Upload</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button className="absolute top-4 right-4 text-white" onClick={closeLightbox}>
            <X className="w-8 h-8" />
          </button>
          
          {lightboxIndex > 0 && (
            <button className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={prevPhoto}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {lightboxIndex < filteredPhotos.length - 1 && (
            <button className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={nextPhoto}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="max-w-4xl max-h-[80vh] flex flex-col items-center">
            <div className="bg-gray-800 w-full aspect-video flex items-center justify-center rounded-lg">
              <Image className="w-24 h-24 text-gray-600" />
            </div>
            <div className="mt-4 text-white text-center">
              <p className="text-lg font-medium">{filteredPhotos[lightboxIndex]?.description}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{filteredPhotos[lightboxIndex]?.date}</span>
                <span className="flex items-center gap-1"><FolderOpen className="w-4 h-4" />{filteredPhotos[lightboxIndex]?.unit}</span>
                <span className="flex items-center gap-1"><User className="w-4 h-4" />{filteredPhotos[lightboxIndex]?.uploadedBy}</span>
              </div>
              {filteredPhotos[lightboxIndex]?.tags.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  {filteredPhotos[lightboxIndex]?.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/10 rounded text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                <Download className="w-4 h-4 mr-1" />Download
              </Button>
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                <Star className="w-4 h-4 mr-1" />Feature
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIndex + 1} / {filteredPhotos.length}
          </div>
        </div>
      )}
    </div>
  );
};

// Add Star to imports at top
const Star = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default PhotosPage;
