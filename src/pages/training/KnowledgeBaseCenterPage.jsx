import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ChevronRight,
  Star,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Building2,
  DollarSign,
  Users,
  Settings,
  BarChart3,
  Folder
} from 'lucide-react';

const KnowledgeBaseCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
    { id: 'projects', name: 'Projects & Units', icon: Building2, color: 'bg-green-100 text-green-600' },
    { id: 'accounting', name: 'Accounting', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'pipeline', name: 'Deal Pipeline', icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
    { id: 'team', name: 'Team & Users', icon: Users, color: 'bg-orange-100 text-orange-600' },
    { id: 'settings', name: 'Settings & Admin', icon: Settings, color: 'bg-gray-100 text-gray-600' }
  ];

  const articles = [
    {
      id: 1,
      title: 'Getting Started with AtlasRC',
      description: 'Learn the basics of navigating and using the platform',
      category: 'getting-started',
      type: 'guide',
      readTime: '5 min',
      views: 1250,
      helpful: 98,
      featured: true
    },
    {
      id: 2,
      title: 'Creating Your First Project',
      description: 'Step-by-step guide to setting up a new development project',
      category: 'projects',
      type: 'tutorial',
      readTime: '8 min',
      views: 890,
      helpful: 95,
      featured: true
    },
    {
      id: 3,
      title: 'Managing Multi-Unit Projects',
      description: 'How to configure projects with multiple lots, homes, or rental units',
      category: 'projects',
      type: 'guide',
      readTime: '10 min',
      views: 756,
      helpful: 92
    },
    {
      id: 4,
      title: 'Understanding the Deal Pipeline',
      description: 'Track opportunities from sourcing to closing',
      category: 'pipeline',
      type: 'guide',
      readTime: '7 min',
      views: 678,
      helpful: 90
    },
    {
      id: 5,
      title: 'Setting Up Chart of Accounts',
      description: 'Configure your accounting structure for real estate',
      category: 'accounting',
      type: 'tutorial',
      readTime: '12 min',
      views: 534,
      helpful: 88
    },
    {
      id: 6,
      title: 'Budget Tracking & Variance Analysis',
      description: 'Monitor project budgets and understand variances',
      category: 'accounting',
      type: 'guide',
      readTime: '8 min',
      views: 445,
      helpful: 91
    },
    {
      id: 7,
      title: 'Adding Team Members & Permissions',
      description: 'Invite users and configure role-based access',
      category: 'team',
      type: 'tutorial',
      readTime: '5 min',
      views: 623,
      helpful: 94
    },
    {
      id: 8,
      title: 'Subdivision Lot Management',
      description: 'Track lot inventory, pricing tiers, and sales for subdivisions',
      category: 'projects',
      type: 'guide',
      readTime: '15 min',
      views: 412,
      helpful: 96
    },
    {
      id: 9,
      title: 'Draw Request Processing',
      description: 'Submit and manage construction draw requests',
      category: 'accounting',
      type: 'tutorial',
      readTime: '10 min',
      views: 389,
      helpful: 89
    },
    {
      id: 10,
      title: 'Configuring System Settings',
      description: 'Customize AtlasRC for your organization',
      category: 'settings',
      type: 'guide',
      readTime: '6 min',
      views: 298,
      helpful: 85
    },
    {
      id: 11,
      title: 'Multi-Property Acquisitions',
      description: 'Link multiple properties to a single deal',
      category: 'pipeline',
      type: 'guide',
      readTime: '8 min',
      views: 367,
      helpful: 93
    },
    {
      id: 12,
      title: 'Unit Pricing & Rent Matrix Setup',
      description: 'Configure pricing tiers for different unit types',
      category: 'projects',
      type: 'tutorial',
      readTime: '7 min',
      views: 278,
      helpful: 90
    }
  ];

  const faqs = [
    {
      question: 'How do I add multiple properties to one opportunity?',
      answer: 'Navigate to the opportunity detail page and use the "Add Properties" button to link additional parcels or addresses to the same deal.',
      category: 'pipeline'
    },
    {
      question: 'Can I track different lot sizes with different prices?',
      answer: 'Yes! Use the Unit Pricing Matrix to define size tiers (e.g., Small, Medium, Large) and set different prices for each tier.',
      category: 'projects'
    },
    {
      question: 'How do I invite a new team member?',
      answer: 'Go to Settings > Users Management and click "Add New User". Enter their email and assign a role.',
      category: 'team'
    },
    {
      question: 'What\'s the difference between a project and an opportunity?',
      answer: 'An opportunity is a potential deal in your pipeline. Once you close on a property, it becomes a project for active management.',
      category: 'getting-started'
    },
    {
      question: 'How do I track construction draws?',
      answer: 'Go to your project\'s Draws section to create draw requests, attach invoices, and track lender approvals.',
      category: 'accounting'
    },
    {
      question: 'Can I manage rental units and sale units in the same project?',
      answer: 'Yes, you can configure mixed-use projects with both for-sale and for-rent units in the Unit Inventory Manager.',
      category: 'projects'
    }
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = !searchQuery ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredArticles = articles.filter(a => a.featured);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'tutorial': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700';
      case 'tutorial': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Knowledge Base</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-gray-600 mt-2">Find answers, guides, and tutorials</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search for articles, tutorials, and FAQs..."
              className="pl-12 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-6 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            >
              <CardContent className="pt-6 text-center">
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-3`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Articles */}
      {!searchQuery && selectedCategory === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Featured Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {featuredArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getTypeBadge(article.type)}>
                          {getTypeIcon(article.type)}
                          <span className="ml-1 capitalize">{article.type}</span>
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{article.title}</h3>
                      <p className="text-sm text-gray-600">{article.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList>
          <TabsTrigger value="articles">
            <FileText className="w-4 h-4 mr-2" />
            Articles ({filteredArticles.length})
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQs ({filteredFaqs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <Card>
            <CardContent className="pt-6">
              {filteredArticles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No articles found matching your search</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTypeBadge(article.type)}>
                            {getTypeIcon(article.type)}
                            <span className="ml-1 capitalize">{article.type}</span>
                          </Badge>
                          <Badge variant="outline">
                            {categories.find(c => c.id === article.category)?.name}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-1">{article.title}</h3>
                        <p className="text-sm text-gray-600">{article.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{article.views.toLocaleString()} views</span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {article.helpful}% found helpful
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faqs">
          <Card>
            <CardContent className="pt-6">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No FAQs found matching your search</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-gray-600">{faq.answer}</p>
                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Yes
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Can&apos;t find what you&apos;re looking for?</h3>
              <p className="text-blue-700">Contact our support team for personalized assistance</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Contact Support
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBaseCenterPage;
