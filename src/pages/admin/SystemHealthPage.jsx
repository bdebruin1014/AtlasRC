import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, Server, Database, HardDrive, Cpu, MemoryStick, Globe,
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, Zap,
  TrendingUp, TrendingDown, Minus, Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemHealthPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // System metrics
  const [metrics, setMetrics] = useState({
    uptime: '15d 7h 32m',
    uptimePercent: 99.95,
    lastRestart: '2024-01-01T00:00:00Z',

    cpu: {
      usage: 42,
      cores: 8,
      temperature: 58,
      trend: 'stable',
    },
    memory: {
      used: 12.4,
      total: 32,
      percent: 38.75,
      trend: 'up',
    },
    storage: {
      used: 245,
      total: 500,
      percent: 49,
      trend: 'up',
    },
    database: {
      connections: 24,
      maxConnections: 100,
      queryTime: 45,
      status: 'healthy',
    },
    api: {
      latency: 120,
      requestsPerMin: 1450,
      errorRate: 0.02,
      status: 'healthy',
    },
    redis: {
      memory: 256,
      maxMemory: 1024,
      hitRate: 94.5,
      status: 'healthy',
    },
  });

  // Service statuses
  const [services, setServices] = useState([
    { name: 'Web Server', status: 'operational', latency: 45, uptime: 99.99 },
    { name: 'API Gateway', status: 'operational', latency: 120, uptime: 99.95 },
    { name: 'Database (Primary)', status: 'operational', latency: 5, uptime: 99.99 },
    { name: 'Database (Replica)', status: 'operational', latency: 8, uptime: 99.98 },
    { name: 'Redis Cache', status: 'operational', latency: 2, uptime: 99.99 },
    { name: 'File Storage (S3)', status: 'operational', latency: 85, uptime: 99.95 },
    { name: 'Email Service', status: 'degraded', latency: 350, uptime: 98.50 },
    { name: 'Background Jobs', status: 'operational', latency: null, uptime: 99.90 },
    { name: 'Search Service', status: 'operational', latency: 25, uptime: 99.85 },
    { name: 'CDN', status: 'operational', latency: 15, uptime: 99.99 },
  ]);

  // Recent incidents
  const [incidents, setIncidents] = useState([
    {
      id: 1,
      title: 'Email service slowdown',
      status: 'investigating',
      severity: 'minor',
      startedAt: '2024-01-15T13:30:00Z',
      description: 'Email delivery experiencing delays',
    },
    {
      id: 2,
      title: 'Database maintenance completed',
      status: 'resolved',
      severity: 'maintenance',
      startedAt: '2024-01-14T02:00:00Z',
      resolvedAt: '2024-01-14T04:30:00Z',
      description: 'Scheduled database optimization',
    },
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate metric updates
        setMetrics(prev => ({
          ...prev,
          cpu: { ...prev.cpu, usage: Math.min(100, Math.max(20, prev.cpu.usage + (Math.random() * 10 - 5))) },
          memory: { ...prev.memory, percent: Math.min(100, Math.max(30, prev.memory.percent + (Math.random() * 2 - 1))) },
          api: { ...prev.api, latency: Math.max(50, prev.api.latency + (Math.random() * 20 - 10)) },
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast({
      title: 'Metrics Refreshed',
      description: 'System health data has been updated',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'outage':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'outage':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressColor = (percent) => {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const overallStatus = operationalCount === services.length ? 'operational' :
    operationalCount >= services.length - 1 ? 'degraded' : 'outage';

  return (
    <div className="space-y-6">
      <Helmet>
        <title>System Health | Admin</title>
      </Helmet>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-gray-600 mt-2">Real-time monitoring of system performance and service status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Auto-refresh</span>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'On' : 'Off'}
            </Button>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className={overallStatus === 'operational' ? 'border-green-200 bg-green-50' :
        overallStatus === 'degraded' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <div>
                <h3 className="font-semibold">
                  {overallStatus === 'operational' ? 'All Systems Operational' :
                    overallStatus === 'degraded' ? 'Partial System Degradation' : 'System Outage'}
                </h3>
                <p className="text-sm text-gray-600">
                  {operationalCount} of {services.length} services operational
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.uptimePercent}%</div>
              <div className="text-sm text-gray-500">Uptime (30 days)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="font-medium">CPU Usage</span>
              </div>
              {getTrendIcon(metrics.cpu.trend)}
            </div>
            <div className="text-3xl font-bold">{metrics.cpu.usage.toFixed(1)}%</div>
            <Progress value={metrics.cpu.usage} className={`mt-2 ${getProgressColor(metrics.cpu.usage)}`} />
            <div className="text-xs text-gray-500 mt-2">{metrics.cpu.cores} cores @ {metrics.cpu.temperature}°C</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MemoryStick className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Memory</span>
              </div>
              {getTrendIcon(metrics.memory.trend)}
            </div>
            <div className="text-3xl font-bold">{metrics.memory.percent.toFixed(1)}%</div>
            <Progress value={metrics.memory.percent} className={`mt-2 ${getProgressColor(metrics.memory.percent)}`} />
            <div className="text-xs text-gray-500 mt-2">{metrics.memory.used} GB / {metrics.memory.total} GB</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Storage</span>
              </div>
              {getTrendIcon(metrics.storage.trend)}
            </div>
            <div className="text-3xl font-bold">{metrics.storage.percent}%</div>
            <Progress value={metrics.storage.percent} className={`mt-2 ${getProgressColor(metrics.storage.percent)}`} />
            <div className="text-xs text-gray-500 mt-2">{metrics.storage.used} GB / {metrics.storage.total} GB</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">API Latency</span>
              </div>
              <Badge className={metrics.api.latency < 200 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {metrics.api.status}
              </Badge>
            </div>
            <div className="text-3xl font-bold">{Math.round(metrics.api.latency)}ms</div>
            <div className="text-xs text-gray-500 mt-4">
              {metrics.api.requestsPerMin.toLocaleString()} req/min • {metrics.api.errorRate}% errors
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Real-time status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          {service.latency !== null ? `${service.latency}ms latency` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{service.uptime}%</div>
                        <div className="text-xs text-gray-500">uptime</div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {metrics.database.connections}/{metrics.database.maxConnections}
                </div>
                <Progress
                  value={(metrics.database.connections / metrics.database.maxConnections) * 100}
                  className="h-3"
                />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active</span>
                    <span className="font-medium">{metrics.database.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available</span>
                    <span className="font-medium">{metrics.database.maxConnections - metrics.database.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max</span>
                    <span className="font-medium">{metrics.database.maxConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Query Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{metrics.database.queryTime}ms</div>
                <p className="text-sm text-gray-500 mb-4">Average query time</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Slow queries (>1s)</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Failed queries</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cache hit rate</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Redis Memory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {metrics.redis.memory} MB
                </div>
                <Progress
                  value={(metrics.redis.memory / metrics.redis.maxMemory) * 100}
                  className="h-3"
                />
                <div className="mt-4 text-sm text-gray-500">
                  {metrics.redis.maxMemory} MB max configured
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Cache Hit Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2 text-green-600">
                  {metrics.redis.hitRate}%
                </div>
                <Progress value={metrics.redis.hitRate} className="h-3 bg-green-500" />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hits</span>
                    <span className="font-medium">1.2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Misses</span>
                    <span className="font-medium">68K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Active and recently resolved incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p>No active or recent incidents</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {incident.status === 'resolved' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <h4 className="font-medium">{incident.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              incident.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                                incident.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                          }>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status === 'resolved' ? 'operational' : 'degraded')}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <div className="text-xs text-gray-500">
                        Started: {formatDateTime(incident.startedAt)}
                        {incident.resolvedAt && ` • Resolved: ${formatDateTime(incident.resolvedAt)}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Uptime</span>
              <div className="font-medium">{metrics.uptime}</div>
            </div>
            <div>
              <span className="text-gray-500">Last Restart</span>
              <div className="font-medium">{formatDateTime(metrics.lastRestart)}</div>
            </div>
            <div>
              <span className="text-gray-500">Version</span>
              <div className="font-medium">v2.4.1</div>
            </div>
            <div>
              <span className="text-gray-500">Environment</span>
              <div className="font-medium">Production</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthPage;
