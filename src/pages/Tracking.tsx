import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Phone, 
  MessageSquare, 
  User, 
  Car, 
  Navigation, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export default function Tracking() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [mechanic, setMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;

    const unsub = onSnapshot(doc(db, 'requests', requestId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRequest({ id: snap.id, ...data });

        // Get mechanic details
        const mechUnsub = onSnapshot(doc(db, 'mechanics', data.mechanicId), (mechSnap) => {
          if (mechSnap.exists()) {
            setMechanic({ id: mechSnap.id, ...mechSnap.data() });
          }
          setLoading(false);
        });

        return () => mechUnsub();
      } else {
        toast.error('Request not found');
        navigate('/');
      }
    });

    return () => unsub();
  }, [requestId]);

  const cancelRequest = async () => {
    if (!requestId) return;
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      toast.info('Request cancelled');
      navigate('/');
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      <p className="text-slate-500 animate-pulse">Requesting assistance...</p>
    </div>
  );

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    arrived: 'bg-purple-100 text-purple-700',
    started: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 p-2 rounded-xl">
             <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{request.issueType}</h2>
            <p className="text-sm text-slate-500">ID: {requestId?.slice(-6)}</p>
          </div>
        </div>
        <Badge className={statusColors[request.status]}>{request.status.toUpperCase()}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 relative min-h-[400px] rounded-3xl overflow-hidden border shadow-inner bg-slate-50">
          <APIProvider apiKey={MAPS_KEY}>
            <Map
              defaultCenter={request.customerLocation}
              defaultZoom={15}
              mapId="TRACKING_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <AdvancedMarker position={request.customerLocation}>
                 <Pin background="#ea580c" />
              </AdvancedMarker>
              
              {mechanic?.currentLocation && (
                 <AdvancedMarker position={mechanic.currentLocation}>
                   <div className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg">
                      <Navigation className="h-4 w-4 text-white rotate-45" />
                   </div>
                 </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border text-sm max-w-[200px]">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="font-bold">Live Tracking</span>
             </div>
             <p className="text-xs text-slate-500 italic">Mechanic is on the way to your location.</p>
          </div>
        </div>

        <div className="space-y-6">
          {mechanic && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Mechanic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border">
                      <img src={mechanic.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mechanic.uid}`} alt="" />
                   </div>
                   <div>
                      <h4 className="font-bold text-lg leading-tight">{mechanic.displayName}</h4>
                      <p className="text-sm text-slate-500">★ {mechanic.rating} Rating</p>
                      <p className="text-xs font-bold text-blue-600">PRO MECHANIC</p>
                   </div>
                </div>

                <div className="flex gap-2">
                   <Button variant="outline" className="flex-1 gap-2">
                      <Phone className="h-4 w-4" /> Call
                   </Button>
                   <Button variant="outline" className="flex-1 gap-2">
                      <MessageSquare className="h-4 w-4" /> Chat
                   </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm">
             <CardHeader className="pb-2">
                <CardTitle className="text-lg">Service Summary</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Base Fare</span>
                   <span className="font-semibold">Rs. 500</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Service Fee</span>
                   <span className="font-semibold">Rs. {request.estimatedFare - 500}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                   <span className="font-bold">Total Estimate</span>
                   <span className="font-bold text-orange-600 text-lg">Rs. {request.estimatedFare}</span>
                </div>
             </CardContent>
          </Card>

          {request.status === 'pending' && (
             <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 font-bold" onClick={cancelRequest}>
                Cancel Request
             </Button>
          )}

          {request.status === 'completed' && (
             <div className="space-y-3">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                   <CheckCircle2 className="h-5 w-5" />
                   <span className="font-bold">Service Completed!</span>
                </div>
                <Button className="w-full h-12 text-lg font-bold" onClick={() => navigate('/')}>Return Home</Button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
