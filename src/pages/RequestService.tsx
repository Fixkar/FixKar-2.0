import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  Search, 
  Loader2,
  Car,
  ChevronRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const MAPS_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

export default function RequestService() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const findMechanics = async () => {
    if (!location) {
      toast.error('Please allow location access or select on map');
      return;
    }
    setSearching(true);
    setStep(2);

    try {
      // In a real app, use Geofire or similar. For now, just find online mechanics.
      const q = query(collection(db, 'mechanics'), where('isOnline', '==', true));
      const snaps = await getDocs(q);
      const mechs = snaps.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNearbyMechanics(mechs);
    } catch (error) {
      toast.error('Error finding mechanics');
    } finally {
      setSearching(false);
    }
  };

  const submitRequest = async (mechanic: any) => {
    if (!user || !location) return;
    
    try {
      const docRef = await addDoc(collection(db, 'requests'), {
        customerId: user.uid,
        mechanicId: mechanic.uid,
        status: 'pending',
        issueType,
        customerLocation: location,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedFare: 500 + Math.floor(Math.random() * 1000) // Mock fare
      });
      toast.success('Request sent to mechanic!');
      navigate(`/tracking/${docRef.id}`);
    } catch (error) {
      toast.error('Failed to create request');
    }
  };

  const issues = [
    'Tire/Puncture', 'Battery Jumpstart', 'Mechanical Breakdown', 
    'Fuel Delivery', 'Towing', 'Electrical Issue', 
    'Overheating', 'Lockout', 'Accident'
  ];

  if (!MAPS_KEY) return <div>Maps API Key Missing</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
        <div className="h-px w-8 bg-slate-200"></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
        <div className="h-px w-8 bg-slate-200"></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
      </div>

      {step === 1 && (
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>What's the issue?</CardTitle>
            <CardDescription>Select the type of assistance you need.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {issues.map(type => (
                <Button
                  key={type}
                  variant={issueType === type ? 'default' : 'outline'}
                  className={`h-16 justify-start px-4 ${issueType === type ? 'bg-orange-600' : 'bg-white'}`}
                  onClick={() => setIssueType(type)}
                >
                  <span className="truncate">{type}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                Confirm Location
              </h4>
              <div className="h-[300px] rounded-2xl overflow-hidden border">
                <APIProvider apiKey={MAPS_KEY}>
                  <Map
                    defaultCenter={location || { lat: 31.5204, lng: 74.3587 }} // Lahore
                    defaultZoom={15}
                    mapId="MECHANIC_REQUEST_MAP"
                    onClick={(e) => e.detail.latLng && setLocation(e.detail.latLng)}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  >
                    {location && <AdvancedMarker position={location}><Pin background="orange" /></AdvancedMarker>}
                  </Map>
                </APIProvider>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold"
              disabled={!issueType || !location}
              onClick={findMechanics}
            >
              Find Nearby Mechanics
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Scanning for mechanics...</h3>
            {searching && <Loader2 className="animate-spin h-6 w-6 text-orange-600" />}
          </div>
          
          <div className="grid gap-4">
            {nearbyMechanics.length > 0 ? (
              nearbyMechanics.map(mech => (
                <Card key={mech.uid} className="border-none shadow-sm hover:ring-2 hover:ring-orange-500 transition-all cursor-pointer overflow-hidden" onClick={() => submitRequest(mech)}>
                  <CardContent className="p-0 flex flex-col md:flex-row">
                    <div className="w-full md:w-48 bg-slate-100 p-4 flex flex-col items-center justify-center border-r">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center p-2 border shadow-sm">
                        <img src={mech.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mech.uid}`} alt="" className="w-full h-full rounded-full" />
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-orange-500 font-bold">
                        ★ {mech.rating || 5.0}
                      </div>
                    </div>
                    <div className="flex-1 p-6 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold">{mech.displayName}</h4>
                          <p className="text-slate-500 flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-green-500" />
                             Verified Mechanic
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none uppercase tracking-widest text-[10px]">Online</Badge>
                      </div>
                      
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {(mech.specialties || ['Cars', 'Bikes', 'Engine']).map((s: string) => (
                           <Badge key={s} variant="secondary" className="bg-slate-100">{s}</Badge>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                         <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 15-20 min</span>
                            <span className="flex items-center gap-1"><Navigation className="h-4 w-4" /> 2.4 km</span>
                         </div>
                         <Button className="bg-orange-600 hover:bg-orange-700 font-bold">Book Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">No mechanics found nearby</h3>
                <p className="text-slate-500">Try expanding your search or selecting a different service.</p>
                <Button variant="outline" className="mt-4" onClick={() => setStep(1)}>Back to options</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
