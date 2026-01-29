import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Upload,
  Download,
  FileText,
  Folder,
  Star,
  StarOff,
  Eye,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  TrendingUp,
  BarChart3,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  ExternalLink,
  Clock,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MarketResearchLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    market: '',
    source: '',
    description: '',
    file: null
  });

  const documents = [
    {
      id: 1,
      title: 'Austin Metro Market Report Q4 2024',
      category: 'market_report',
      market: 'Austin Metro',
      source: 'CBRE',
      fileType: 'pdf',
      fileSize: '4.2 MB',
      uploadDate: '2024-01-15',
      uploadedBy: 'Sarah Johnson',
      starred: true,
      views: 45,
      description: 'Comprehensive overview of Austin commercial real estate market trends'
    },
    {
      id: 2,
      title: 'Texas Land Sales Analysis 2024',
      category: 'land_report',
      market: 'Texas',
      source: 'Land Advisors',
      fileType: 'pdf',
      fileSize: '8.5 MB',
      uploadDate: '2024-02-01',
      uploadedBy: 'Michael Chen',
      starred: true,
      views: 32,
      description: 'Detailed analysis of land transactions across major Texas markets'
    },
    {
      id: 3,
      title: 'Multifamily Cap Rate Survey',
      category: 'cap_rates',
      market: 'National',
      source: 'Marcus & Millichap',
      fileType: 'pdf',
      fileSize: '2.1 MB',
      uploadDate: '2024-02-10',
      uploadedBy: 'Emily Rodriguez',
      starred: false,
      views: 28,
      description: 'National cap rate trends for multifamily properties'
    },
    {
      id: 4,
      title: 'San Antonio Demographic Study',
      category: 'demographics',
      market: 'San Antonio Metro',
      source: 'City of San Antonio',
      fileType: 'pdf',
      fileSize: '12.3 MB',
      uploadDate: '2024-01-28',
      uploadedBy: 'David Kim',
      starred: false,
      views: 18,
      description: 'Population growth and demographic trends in San Antonio MSA'
    },
    {
      id: 5,
      title: 'Industrial Market Outlook 2024',
      category: 'market_report',
      market: 'Austin Metro',
      source: 'JLL',
      fileType: 'pdf',
      fileSize: '5.8 MB',
      uploadDate: '2024-02-15',
      uploadedBy: 'Sarah Johnson',
      starred: true,
      views: 38,
      description: 'Industrial and logistics market trends and projections'
    },
    {
      id: 6,
      title: 'Homebuilder Survey Results',
      category: 'survey',
      market: 'Texas',
      source: 'Texas Association of Builders',
      fileType: 'xlsx',
      fileSize: '1.2 MB',
      uploadDate: '2024-02-20',
      uploadedBy: 'Michael Chen',
      starred: false,
      views: 22,
      description: 'Survey results from Texas homebuilders on market conditions'
    },
    {
      id: 7,
      title: 'Retail Vacancy Analysis',
      category: 'market_report',
      market: 'Austin Metro',
      source: 'CoStar',
      fileType: 'pdf',
      fileSize: '3.4 MB',
      uploadDate: '2024-03-01',
      uploadedBy: 'Emily Rodriguez',
      starred: false,
      views: 15,
      description: 'Retail vacancy rates and absorption trends'
    },
    {
      id: 8,
      title: 'Economic Forecast 2024-2026',
      category: 'economic',
      market: 'Texas',
      source: 'Federal Reserve Bank of Dallas',
      fileType: 'pdf',
      fileSize: '6.7 MB',
      uploadDate: '2024-01-10',
      uploadedBy: 'David Kim',
      starred: true,
      views: 55,
      description: 'Economic outlook and employment projections for Texas'
    }
  ];

  const categories = [
    { value: 'market_report', label: 'Market Reports', icon: BarChart3 },
    { value: 'land_report', label: 'Land Reports', icon: MapPin },
    { value: 'cap_rates', label: 'Cap Rate Data', icon: TrendingUp },
    { value: 'demographics', label: 'Demographics', icon: Building2 },
    { value: 'survey', label: 'Surveys', icon: FileText },
    { value: 'economic', label: 'Economic Data', icon: TrendingUp }
  ];

  const markets = ['Austin Metro', 'San Antonio Metro', 'Dallas Metro', 'Houston Metro', 'Texas', 'National'];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesMarket = marketFilter === 'all' || doc.market === marketFilter;
      return matchesSearch && matchesCategory && matchesMarket;
    });
  }, [searchQuery, categoryFilter, marketFilter]);

  const starredDocs = documents.filter(d => d.starred);

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : FileText;
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'xlsx': return '📊';
      case 'docx': return '📝';
      default: return '📁';
    }
  };

  const renderDocumentCard = (doc) => (
    <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {doc.starred ? (
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h3 className="font-semibold line-clamp-2 mb-2">{doc.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{doc.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{getCategoryLabel(doc.category)}</Badge>
          <Badge variant="outline">{doc.market}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{doc.source}</span>
          <span>{doc.fileSize}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {doc.uploadDate}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {doc.views} views
          </span>
        </div>
      </CardContent>
    </Card>
  );

  const renderDocumentList = (doc) => (
    <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="text-2xl">{getFileIcon(doc.fileType)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold truncate">{doc.title}</h3>
          {doc.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
        </div>
        <p className="text-sm text-gray-600 truncate">{doc.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">{getCategoryLabel(doc.category)}</Badge>
          <span>{doc.market}</span>
          <span>{doc.source}</span>
          <span>{doc.fileSize}</span>
        </div>
      </div>
      <div className="text-right text-sm text-gray-500">
        <div>{doc.uploadDate}</div>
        <div className="text-xs">{doc.views} views</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Market Research Library</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Market Research Library</h1>
          <p className="text-gray-600 mt-2">Store and organize market reports, studies, and third-party data</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Starred</p>
                <p className="text-2xl font-bold text-yellow-600">{starredDocs.length}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold">{documents.reduce((acc, d) => acc + d.views, 0)}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map(market => (
                  <SelectItem key={market} value={market}>{market}</SelectItem>
                ))}
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

      {/* Starred Section */}
      {starredDocs.length > 0 && categoryFilter === 'all' && marketFilter === 'all' && !searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Starred Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {starredDocs.slice(0, 4).map(renderDocumentCard)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Documents */}
      <Card>
        <CardHeader>
          <CardTitle>All Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredDocuments.map(renderDocumentCard)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(renderDocumentList)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Add a new document to the research library</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Document Title</Label>
              <Input
                placeholder="e.g., Austin Market Report Q1 2024"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={uploadData.category}
                  onValueChange={(value) => setUploadData({...uploadData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Market</Label>
                <Select
                  value={uploadData.market}
                  onValueChange={(value) => setUploadData({...uploadData, market: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map(market => (
                      <SelectItem key={market} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Source</Label>
              <Input
                placeholder="e.g., CBRE, CoStar, JLL"
                value={uploadData.source}
                onChange={(e) => setUploadData({...uploadData, source: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of the document..."
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label>File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PDF, XLSX, DOCX up to 50MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Upload Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketResearchLibraryPage;
