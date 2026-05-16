import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { 
  Wrench, 
  DollarSign, 
  Star, 
  MapPin, 
  Bell, 
  CheckCircle2, 
  X,
  Phone,
  Navigation,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function MechanicDashboard() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(profile?.isOnline || false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'requests'),
      where('mechanicId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setRequests(all);
      
      const active = all.find(r => ['accepted', 'arrived', 'started'].includes(r.status));
      setActiveRequest(active);
    });

    return () => unsub();
  }, [user]);

  const toggleOnline = async (val: boolean) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'mechanics', user.uid), { isOnline: val });
      setIsOnline(val);
      toast.success(val ? 'You are now online' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status,
        updatedAt: serverTimestamp()
      });
      toast.success(`Request marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const earnings = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.finalFare || r.estimatedFare), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500">
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.displayName}</h2>
            <p className="text-slate-500">{profile?.workshopName || 'Independent Mechanic'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Go Online</span>
            <span className="font-bold">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <Switch checked={isOnline} onCheckedChange={toggleOnline} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Rs. {earnings.toLocaleString()}</div>
            <p className="text-xs mt-1 text-orange-100 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Updated just now
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{requests.filter(r => r.status === 'completed').length}</div>
            <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs font-bold">
              <Star className="h-3 w-3 fill-current" /> 4.9 Average Rating
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 uppercase">{profile?.subscriptionPlan || 'Free'} Plan</div>
            <Button variant="link" className="p-0 h-auto text-xs text-orange-600 font-bold uppercase tracking-widest">Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>

      {activeRequest && (
        <Card className="border-2 border-orange-500 shadow-xl overflow-hidden animate-pulse-subtle">
           <CardHeader className="bg-orange-50 border-b border-orange-100">
              <div className="flex justify-between items-center">
                 <CardTitle className="text-orange-900">Active Job</CardTitle>
                 <Badge className="bg-orange-600 text-white border-none">{activeRequest.status.toUpperCase()}</Badge>
              </div>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-bold">{activeRequest.issueType}</h3>
                    <p className="text-slate-500 flex items-center gap-2">
                       <MapPin className="h-4 w-4" /> Near Garden Town, Lahore
                    </p>
                 </div>
                 <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">Rs. {activeRequest.estimatedFare}</div>
                    <p className="text-xs text-slate-400">Est. Payout</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <Button variant="outline" className="flex-1 h-12 gap-2">
                    <Phone className="h-4 w-4" /> Call Customer
                 </Button>
                 <Button variant="outline" className="flex-1 h-12 gap-2">
                    <Navigation className="h-4 w-4" /> Navigate
                 </Button>
              </div>

              <div className="pt-4 border-t flex flex-wrap gap-2">
                 {activeRequest.status === 'accepted' && (
                    <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => updateRequestStatus(activeRequest.id, 'arrived')}>I Have Arrived</Button>
                 )}
                 {activeRequest.status === 'arrived' && (
                    <Button className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 font-bold" onClick={() => updateRequestStatus(activeRequest.id, 'started')}>Start Service</Button>
                 )}
                 {activeRequest.status === 'started' && (
                    <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700 font-bold" onClick={() => updateRequestStatus(activeRequest.id, 'completed')}>Job Done & Collect Cash</Button>
                 )}
              </div>
           </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">New Requests</h3>
          <Badge variant="secondary">{requests.filter(r => r.status === 'pending').length} pending</Badge>
        </div>
        <div className="divide-y">
          {requests.filter(r => r.status === 'pending').map(req => (
            <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{req.issueType}</h4>
                  <p className="text-sm text-slate-500">2.4 km away • 15 mins ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <Button variant="outline" className="flex-1 md:flex-none h-11 px-6 border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateRequestStatus(req.id, 'cancelled')}>Decline</Button>
                 <Button className="flex-1 md:flex-none h-11 px-8 bg-black text-white hover:bg-slate-800" onClick={() => updateRequestStatus(req.id, 'accepted')}>Accept Job</Button>
              </div>
            </div>
          ))}
          {requests.filter(r => r.status === 'pending').length === 0 && (
             <div className="p-12 text-center text-slate-400">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-10" />
                <p>Waiting for new calls...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
