import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, getDocs, count, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  Wrench, 
  Activity, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Map as MapIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    mechanics: 0,
    activeRequests: 0,
    revenue: 0
  });

  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    // Real-time requests
    const unsub = onSnapshot(collection(db, 'requests'), (snap) => {
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setRequests(all);
      
      const revenue = all
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + (r.finalFare || r.estimatedFare || 0), 0);
      
      setStats(prev => ({
        ...prev,
        activeRequests: all.filter(r => ['pending', 'accepted', 'arrived', 'started'].includes(r.status)).length,
        revenue
      }));
    });

    // Counts (simplified for demo)
    getDocs(collection(db, 'users')).then(snap => setStats(prev => ({ ...prev, users: snap.size })));
    getDocs(collection(db, 'mechanics')).then(snap => setStats(prev => ({ ...prev, mechanics: snap.size })));

    return () => unsub();
  }, []);

  const chartData = [
    { name: 'Mon', jobs: 4, revenue: 2400 },
    { name: 'Tue', jobs: 3, revenue: 1398 },
    { name: 'Wed', jobs: 2, revenue: 9800 },
    { name: 'Thu', jobs: 6, revenue: 3908 },
    { name: 'Fri', jobs: 8, revenue: 4800 },
    { name: 'Sat', jobs: 12, revenue: 6800 },
    { name: 'Sun', jobs: 10, revenue: 5300 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-extrabold tracking-tight">Admin Control</h2>
           <p className="text-slate-500">Platform performance at a glance.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"> <MapIcon className="h-4 w-4" /> Live Map </Button>
           <Button className="bg-orange-600 hover:bg-orange-700">Download Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Mechanics', value: stats.mechanics, icon: Wrench, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Live Jobs', value: stats.activeRequests, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Platform Volume', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm transition-transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600 font-bold">
                 <TrendingUp className="h-3 w-3" /> +12.5% vs last week
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {requests.slice(0, 5).map(req => (
                   <div key={req.id} className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${req.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                         {req.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate">{req.issueType} Request</p>
                         <p className="text-xs text-slate-500">ID: ...{req.id.slice(-6)} • {req.status}</p>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                         Rs.{req.estimatedFare}
                      </div>
                   </div>
                ))}
                {requests.length === 0 && <p className="text-center text-slate-400 py-12">No activity yet</p>}
             </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <TabsTrigger value="requests" className="rounded-lg px-8">All Requests</TabsTrigger>
          <TabsTrigger value="mechanics" className="rounded-lg px-8">Mechanics</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-6">
           <Card className="border-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-xs font-bold uppercase tracking-widest text-slate-500">
                       <tr>
                          <th className="p-4">Request ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                       {requests.map(req => (
                          <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                             <td className="p-4 font-mono text-xs">{req.id}</td>
                             <td className="p-4 font-bold">{req.customerId.slice(-6)}</td>
                             <td className="p-4">{req.issueType}</td>
                             <td className="p-4">
                                <Badge variant="secondary" className="capitalize">{req.status}</Badge>
                             </td>
                             <td className="p-4 font-bold">Rs. {req.estimatedFare}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
