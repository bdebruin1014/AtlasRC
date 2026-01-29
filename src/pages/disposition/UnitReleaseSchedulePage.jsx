import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Edit2,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Building2,
  Home,
  MapPin
} from 'lucide-react';

const UnitReleaseSchedulePage = () => {
  const [selectedProject, setSelectedProject] = useState('oakwood');
  const [showAddReleaseModal, setShowAddReleaseModal] = useState(false);

  const [releaseData, setReleaseData] = useState({
    name: '',
    releaseDate: '',
    unitCount: '',
    targetPrice: '',
    notes: ''
  });

  const projects = [
    { id: 'oakwood', name: 'Oakwood Estates', type: 'subdivision' },
    { id: 'riverside', name: 'Riverside Apartments', type: 'rental' },
    { id: 'downtown', name: 'Downtown Homes', type: 'build_to_sell' }
  ];

  const releaseSchedules = {
    oakwood: {
      projectName: 'Oakwood Estates',
      projectType: 'subdivision',
      totalUnits: 150,
      releasedUnits: 110,
      soldUnits: 78,
      projectedRevenue: 18750000,
      actualRevenue: 9750000,
      releases: [
        {
          id: 1,
          name: 'Phase 1 - Initial Release',
          releaseDate: '2024-01-15',
          unitCount: 50,
          targetUnitsPerMonth: 8,
          targetPrice: 95000,
          actualAvgPrice: 96500,
          soldCount: 45,
          availableCount: 5,
          status: 'active',
          revenue: 4342500,
          projectedRevenue: 4750000
        },
        {
          id: 2,
          name: 'Phase 2 - Premium Lots',
          releaseDate: '2024-04-01',
          unitCount: 40,
          targetUnitsPerMonth: 6,
          targetPrice: 125000,
          actualAvgPrice: 122000,
          soldCount: 28,
          availableCount: 12,
          status: 'active',
          revenue: 3416000,
          projectedRevenue: 5000000
        },
        {
          id: 3,
          name: 'Phase 3 - Estate Lots',
          releaseDate: '2024-07-01',
          unitCount: 20,
          targetUnitsPerMonth: 4,
          targetPrice: 175000,
          actualAvgPrice: 180000,
          soldCount: 5,
          availableCount: 15,
          status: 'active',
          revenue: 900000,
          projectedRevenue: 3500000
        },
        {
          id: 4,
          name: 'Phase 4 - Final Release',
          releaseDate: '2024-10-01',
          unitCount: 40,
          targetUnitsPerMonth: 5,
          targetPrice: 140000,
          actualAvgPrice: null,
          soldCount: 0,
          availableCount: 0,
          status: 'scheduled',
          revenue: 0,
          projectedRevenue: 5600000
        }
      ]
    },
    riverside: {
      projectName: 'Riverside Apartments',
      projectType: 'rental',
      totalUnits: 200,
      releasedUnits: 120,
      leasedUnits: 95,
      projectedMonthlyRent: 350000,
      actualMonthlyRent: 166250,
      releases: [
        {
          id: 1,
          name: 'Building A - Launch',
          releaseDate: '2024-02-01',
          unitCount: 60,
          targetUnitsPerMonth: 15,
          targetRent: 1750,
          actualAvgRent: 1785,
          leasedCount: 55,
          availableCount: 5,
          status: 'active',
          monthlyRevenue: 98175,
          projectedMonthlyRevenue: 105000
        },
        {
          id: 2,
          name: 'Building B - Premium Units',
          releaseDate: '2024-05-01',
          unitCount: 60,
          targetUnitsPerMonth: 12,
          targetRent: 1950,
          actualAvgRent: 1925,
          leasedCount: 40,
          availableCount: 20,
          status: 'active',
          monthlyRevenue: 77000,
          projectedMonthlyRevenue: 117000
        },
        {
          id: 3,
          name: 'Building C',
          releaseDate: '2024-08-01',
          unitCount: 80,
          targetUnitsPerMonth: 10,
          targetRent: 1600,
          actualAvgRent: null,
          leasedCount: 0,
          availableCount: 0,
          status: 'scheduled',
          monthlyRevenue: 0,
          projectedMonthlyRevenue: 128000
        }
      ]
    }
  };

  const currentSchedule = releaseSchedules[selectedProject];
  const isRental = currentSchedule?.projectType === 'rental';

  const stats = useMemo(() => {
    if (!currentSchedule) return null;
    const activeReleases = currentSchedule.releases.filter(r => r.status === 'active');

    if (isRental) {
      return {
        totalUnits: currentSchedule.totalUnits,
        released: currentSchedule.releasedUnits,
        absorbed: currentSchedule.leasedUnits,
        absorptionRate: Math.round((currentSchedule.leasedUnits / currentSchedule.releasedUnits) * 100),
        projectedRevenue: currentSchedule.projectedMonthlyRent,
        actualRevenue: currentSchedule.actualMonthlyRent,
        revenueLabel: 'Monthly Rent'
      };
    } else {
      return {
        totalUnits: currentSchedule.totalUnits,
        released: currentSchedule.releasedUnits,
        absorbed: currentSchedule.soldUnits,
        absorptionRate: Math.round((currentSchedule.soldUnits / currentSchedule.releasedUnits) * 100),
        projectedRevenue: currentSchedule.projectedRevenue,
        actualRevenue: currentSchedule.actualRevenue,
        revenueLabel: 'Total Revenue'
      };
    }
  }, [currentSchedule, isRental]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAbsorptionColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Unit Release Schedule Planner</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Unit Release Schedule Planner</h1>
          <p className="text-gray-600 mt-2">Plan and track sales or lease-up schedules with projected revenue</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddReleaseModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Release
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">Total Units</p>
                <p className="text-2xl font-bold">{stats.totalUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">Released</p>
                <p className="text-2xl font-bold">{stats.released}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">{isRental ? 'Leased' : 'Sold'}</p>
                <p className="text-2xl font-bold text-green-600">{stats.absorbed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">Absorption Rate</p>
                <p className={`text-2xl font-bold ${getAbsorptionColor(stats.absorptionRate)}`}>
                  {stats.absorptionRate}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">Projected {stats.revenueLabel}</p>
                <p className="text-2xl font-bold text-gray-400">
                  ${(stats.projectedRevenue / (isRental ? 1 : 1000000)).toFixed(isRental ? 0 : 1)}{isRental ? '' : 'M'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-gray-500">Actual {stats.revenueLabel}</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(stats.actualRevenue / (isRental ? 1 : 1000000)).toFixed(isRental ? 0 : 2)}{isRental ? '' : 'M'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Progress - {currentSchedule.projectName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Units Released</span>
                    <span>{stats.released} / {stats.totalUnits} ({Math.round(stats.released / stats.totalUnits * 100)}%)</span>
                  </div>
                  <Progress value={(stats.released / stats.totalUnits) * 100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{isRental ? 'Units Leased' : 'Units Sold'}</span>
                    <span>{stats.absorbed} / {stats.released} ({stats.absorptionRate}%)</span>
                  </div>
                  <Progress value={stats.absorptionRate} className="h-3 bg-gray-200">
                    <div
                      className={`h-full rounded-full ${stats.absorptionRate >= 80 ? 'bg-green-500' : stats.absorptionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${stats.absorptionRate}%` }}
                    />
                  </Progress>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Revenue vs Projection</span>
                    <span>{Math.round(stats.actualRevenue / stats.projectedRevenue * 100)}%</span>
                  </div>
                  <Progress value={(stats.actualRevenue / stats.projectedRevenue) * 100} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Release Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Release Schedule
              </CardTitle>
              <CardDescription>
                {isRental ? 'Lease-up schedule and occupancy targets' : 'Sales release schedule and absorption targets'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Release</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Target/Month</TableHead>
                    <TableHead>Target {isRental ? 'Rent' : 'Price'}</TableHead>
                    <TableHead>Actual Avg</TableHead>
                    <TableHead>{isRental ? 'Leased' : 'Sold'}</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSchedule.releases.map((release) => {
                    const absorbed = isRental ? release.leasedCount : release.soldCount;
                    const absorptionRate = release.unitCount > 0 ? Math.round((absorbed / release.unitCount) * 100) : 0;
                    const targetPrice = isRental ? release.targetRent : release.targetPrice;
                    const actualPrice = isRental ? release.actualAvgRent : release.actualAvgPrice;
                    const revenue = isRental ? release.monthlyRevenue : release.revenue;
                    const projectedRevenue = isRental ? release.projectedMonthlyRevenue : release.projectedRevenue;

                    return (
                      <TableRow key={release.id}>
                        <TableCell className="font-medium">{release.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {release.releaseDate}
                          </div>
                        </TableCell>
                        <TableCell>{release.unitCount}</TableCell>
                        <TableCell>{isRental ? release.targetUnitsPerMonth : release.targetUnitsPerMonth}/mo</TableCell>
                        <TableCell>${targetPrice.toLocaleString()}{isRental && '/mo'}</TableCell>
                        <TableCell>
                          {actualPrice ? (
                            <span className={actualPrice >= targetPrice ? 'text-green-600' : 'text-red-600'}>
                              ${actualPrice.toLocaleString()}{isRental && '/mo'}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{absorbed}</span>
                            <span className={`text-sm ${getAbsorptionColor(absorptionRate)}`}>
                              ({absorptionRate}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {release.status === 'active' ? release.availableCount : '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              ${isRental ? revenue.toLocaleString() : (revenue / 1000000).toFixed(2) + 'M'}
                            </p>
                            <p className="text-xs text-gray-500">
                              of ${isRental ? projectedRevenue.toLocaleString() : (projectedRevenue / 1000000).toFixed(1) + 'M'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(release.status)}>
                            {release.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {release.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                            {release.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Timeline Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Release Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 ml-4"></div>
                <div className="space-y-6">
                  {currentSchedule.releases.map((release, index) => {
                    const absorbed = isRental ? release.leasedCount : release.soldCount;
                    const absorptionRate = release.unitCount > 0 ? Math.round((absorbed / release.unitCount) * 100) : 0;

                    return (
                      <div key={release.id} className="flex items-start gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          release.status === 'active' ? 'bg-green-500' :
                          release.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {release.status === 'active' ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{release.name}</h4>
                            <Badge className={getStatusBadge(release.status)}>{release.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Release Date: {release.releaseDate} • {release.unitCount} units •
                            Target: {release.targetUnitsPerMonth}/month
                          </p>
                          {release.status === 'active' && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{isRental ? 'Lease-up' : 'Sales'} Progress</span>
                                <span className={getAbsorptionColor(absorptionRate)}>
                                  {absorbed}/{release.unitCount} ({absorptionRate}%)
                                </span>
                              </div>
                              <Progress value={absorptionRate} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Release Modal */}
      <Dialog open={showAddReleaseModal} onOpenChange={setShowAddReleaseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Release</DialogTitle>
            <DialogDescription>Schedule a new unit release for this project</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Release Name</Label>
              <Input
                placeholder="e.g., Phase 2 - Premium Lots"
                value={releaseData.name}
                onChange={(e) => setReleaseData({...releaseData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Release Date</Label>
                <Input
                  type="date"
                  value={releaseData.releaseDate}
                  onChange={(e) => setReleaseData({...releaseData, releaseDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Number of Units</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={releaseData.unitCount}
                  onChange={(e) => setReleaseData({...releaseData, unitCount: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Target {isRental ? 'Rent' : 'Price'}</Label>
                <Input
                  type="number"
                  placeholder={isRental ? '1500' : '95000'}
                  value={releaseData.targetPrice}
                  onChange={(e) => setReleaseData({...releaseData, targetPrice: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>Target Units/Month</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={releaseData.targetUnitsPerMonth}
                  onChange={(e) => setReleaseData({...releaseData, targetUnitsPerMonth: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                placeholder="Additional details..."
                value={releaseData.notes}
                onChange={(e) => setReleaseData({...releaseData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddReleaseModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Add Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitReleaseSchedulePage;
