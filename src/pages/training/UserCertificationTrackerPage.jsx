import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Award,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Trophy,
  BookOpen,
  Target,
  TrendingUp,
  MoreHorizontal,
  Mail,
  RefreshCw,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserCertificationTrackerPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const certifications = [
    {
      id: 1,
      name: 'AtlasRC Fundamentals',
      description: 'Core platform knowledge and navigation',
      level: 'beginner',
      modules: 5,
      passingScore: 80,
      validityMonths: 12,
      enrolledCount: 45,
      completedCount: 38,
      avgScore: 87
    },
    {
      id: 2,
      name: 'Project Management Certified',
      description: 'Advanced project and unit management',
      level: 'intermediate',
      modules: 8,
      passingScore: 85,
      validityMonths: 12,
      enrolledCount: 28,
      completedCount: 22,
      avgScore: 89
    },
    {
      id: 3,
      name: 'Financial Operations Expert',
      description: 'Accounting, budgets, and financial reporting',
      level: 'intermediate',
      modules: 6,
      passingScore: 85,
      validityMonths: 12,
      enrolledCount: 18,
      completedCount: 14,
      avgScore: 91
    },
    {
      id: 4,
      name: 'Deal Pipeline Specialist',
      description: 'Acquisition and pipeline management',
      level: 'intermediate',
      modules: 5,
      passingScore: 85,
      validityMonths: 12,
      enrolledCount: 15,
      completedCount: 12,
      avgScore: 86
    },
    {
      id: 5,
      name: 'AtlasRC Power User',
      description: 'Complete platform mastery certification',
      level: 'advanced',
      modules: 12,
      passingScore: 90,
      validityMonths: 24,
      enrolledCount: 10,
      completedCount: 6,
      avgScore: 93
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Project Manager',
      department: 'Development',
      certifications: [
        { certId: 1, status: 'completed', score: 92, completedAt: '2024-01-15', expiresAt: '2025-01-15' },
        { certId: 2, status: 'completed', score: 88, completedAt: '2024-02-20', expiresAt: '2025-02-20' },
        { certId: 5, status: 'in_progress', progress: 67, currentModule: 8 }
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Accountant',
      department: 'Finance',
      certifications: [
        { certId: 1, status: 'completed', score: 95, completedAt: '2024-01-10', expiresAt: '2025-01-10' },
        { certId: 3, status: 'completed', score: 91, completedAt: '2024-02-05', expiresAt: '2025-02-05' }
      ]
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      role: 'Acquisitions Manager',
      department: 'Acquisitions',
      certifications: [
        { certId: 1, status: 'completed', score: 88, completedAt: '2024-01-20', expiresAt: '2025-01-20' },
        { certId: 4, status: 'completed', score: 94, completedAt: '2024-03-01', expiresAt: '2025-03-01' },
        { certId: 2, status: 'in_progress', progress: 45, currentModule: 4 }
      ]
    },
    {
      id: 4,
      name: 'David Kim',
      email: 'david.kim@company.com',
      role: 'Executive',
      department: 'Executive',
      certifications: [
        { certId: 1, status: 'completed', score: 85, completedAt: '2024-02-01', expiresAt: '2025-02-01' },
        { certId: 5, status: 'in_progress', progress: 25, currentModule: 3 }
      ]
    },
    {
      id: 5,
      name: 'Jessica Thompson',
      email: 'jessica.thompson@company.com',
      role: 'Project Coordinator',
      department: 'Development',
      certifications: [
        { certId: 1, status: 'in_progress', progress: 80, currentModule: 4 }
      ]
    },
    {
      id: 6,
      name: 'Robert Williams',
      email: 'robert.williams@company.com',
      role: 'Construction Manager',
      department: 'Construction',
      certifications: [
        { certId: 1, status: 'expired', score: 82, completedAt: '2023-01-15', expiresAt: '2024-01-15' },
        { certId: 2, status: 'not_started' }
      ]
    },
    {
      id: 7,
      name: 'Amanda Foster',
      email: 'amanda.foster@company.com',
      role: 'Sales Manager',
      department: 'Sales',
      certifications: [
        { certId: 1, status: 'completed', score: 90, completedAt: '2024-02-10', expiresAt: '2025-02-10' },
        { certId: 4, status: 'in_progress', progress: 60, currentModule: 3 }
      ]
    }
  ];

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Executive', label: 'Executive' },
    { value: 'Acquisitions Manager', label: 'Acquisitions' },
    { value: 'Sales Manager', label: 'Sales' }
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      if (statusFilter === 'all') return matchesSearch && matchesRole;

      const hasStatus = user.certifications.some(c => c.status === statusFilter);
      return matchesSearch && matchesRole && hasStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    let totalCerts = 0;
    let completed = 0;
    let inProgress = 0;
    let expired = 0;

    users.forEach(user => {
      user.certifications.forEach(cert => {
        totalCerts++;
        if (cert.status === 'completed') completed++;
        if (cert.status === 'in_progress') inProgress++;
        if (cert.status === 'expired') expired++;
      });
    });

    return { totalCerts, completed, inProgress, expired };
  }, []);

  const getLevelBadge = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'not_started': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUserCertificationStatus = (user, certId) => {
    return user.certifications.find(c => c.certId === certId);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>User Certification Tracker</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Certification Tracker</h1>
          <p className="text-gray-600 mt-2">Track training completion and certifications across your team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Certifications Earned</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            By User
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="w-4 h-4 mr-2" />
            By Certification
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const completedCerts = user.certifications.filter(c => c.status === 'completed').length;
                    const totalCerts = certifications.length;
                    const progressPercent = Math.round((completedCerts / totalCerts) * 100);

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{user.role}</p>
                            <p className="text-xs text-gray-500">{user.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.certifications.map((cert) => {
                              const certInfo = certifications.find(c => c.id === cert.certId);
                              return (
                                <Badge key={cert.certId} className={getStatusBadge(cert.status)}>
                                  {getStatusIcon(cert.status)}
                                  <span className="ml-1">{certInfo?.name.split(' ')[0]}</span>
                                  {cert.score && <span className="ml-1">({cert.score}%)</span>}
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{completedCerts}/{totalCerts}</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset Progress
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="grid gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cert.name}</h3>
                          <Badge className={getLevelBadge(cert.level)}>{cert.level}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{cert.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{cert.modules} modules</span>
                          <span>Passing: {cert.passingScore}%</span>
                          <span>Valid: {cert.validityMonths} months</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="grid grid-cols-3 gap-8">
                        <div>
                          <p className="text-2xl font-bold">{cert.enrolledCount}</p>
                          <p className="text-xs text-gray-500">Enrolled</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{cert.completedCount}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{cert.avgScore}%</p>
                          <p className="text-xs text-gray-500">Avg Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>Users with the most certifications and highest scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .map(user => ({
                    ...user,
                    completedCount: user.certifications.filter(c => c.status === 'completed').length,
                    avgScore: user.certifications
                      .filter(c => c.status === 'completed' && c.score)
                      .reduce((acc, c, _, arr) => acc + c.score / arr.length, 0)
                  }))
                  .sort((a, b) => b.completedCount - a.completedCount || b.avgScore - a.avgScore)
                  .slice(0, 5)
                  .map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{user.completedCount}</p>
                        <p className="text-xs text-gray-500">Certifications</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{Math.round(user.avgScore)}%</p>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                      <div className="flex">
                        {[...Array(Math.min(user.completedCount, 5))].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserCertificationTrackerPage;
