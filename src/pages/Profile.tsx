import React, { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { db } from '../lib/firebase';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  User, 
  Car, 
  PlusCircle, 
  CreditCard, 
  History, 
  Settings, 
  ChevronRight,
  ShieldCheck,
  Bike,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    regNumber: '',
    type: 'car' as 'car' | 'bike'
  });

  const handleAddVehicle = async () => {
    if (!user || !newVehicle.brand || !newVehicle.model) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        ...newVehicle
      };

      await updateDoc(doc(db, 'users', user.uid), {
        vehicles: arrayUnion(vehicle)
      });

      toast.success('Vehicle added successfully');
      setShowAddVehicle(false);
      setNewVehicle({ brand: '', model: '', year: '', regNumber: '', type: 'car' });
    } catch (error) {
      toast.error('Failed to add vehicle');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border p-2 mb-4">
           <img src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-full h-full rounded-full" />
        </div>
        <h2 className="text-2xl font-bold">{profile?.displayName}</h2>
        <p className="text-slate-500">{profile?.email}</p>
        <Badge className="mt-2 bg-orange-100 text-orange-700 border-none uppercase tracking-widest">{profile?.role}</Badge>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-lg font-bold">My Vehicles</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAddVehicle(!showAddVehicle)}>
             {showAddVehicle ? 'Close' : 'Add Vehicle'}
          </Button>
        </div>

        {showAddVehicle && (
           <Card className="mb-6 border-none shadow-sm bg-orange-50 border-orange-100">
             <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Brand</label>
                      <Input placeholder="e.g. Toyota" value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Model</label>
                      <Input placeholder="e.g. Corolla" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Year</label>
                      <Input placeholder="e.g. 2022" value={newVehicle.year} onChange={e => setNewVehicle({...newVehicle, year: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Registration #</label>
                      <Input placeholder="e.g. LEA-1234" value={newVehicle.regNumber} onChange={e => setNewVehicle({...newVehicle, regNumber: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Type</label>
                   <div className="flex gap-2">
                      <Button variant={newVehicle.type === 'car' ? 'default' : 'outline'} className="flex-1" onClick={() => setNewVehicle({...newVehicle, type: 'car'})}>
                         <Car className="mr-2 h-4 w-4" /> Car
                      </Button>
                      <Button variant={newVehicle.type === 'bike' ? 'default' : 'outline'} className="flex-1" onClick={() => setNewVehicle({...newVehicle, type: 'bike'})}>
                         <Bike className="mr-2 h-4 w-4" /> Bike
                      </Button>
                   </div>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold" onClick={handleAddVehicle}>Save Vehicle</Button>
             </CardContent>
           </Card>
        )}

        <div className="space-y-3">
          {profile?.vehicles?.map((v: any) => (
             <Card key={v.id} className="border-none shadow-sm flex items-center p-4 gap-4">
                <div className="bg-slate-100 p-3 rounded-2xl text-slate-400">
                   {v.type === 'car' ? <Car className="h-6 w-6" /> : <Bike className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                   <h4 className="font-bold">{v.brand} {v.model}</h4>
                   <p className="text-sm text-slate-500">{v.year} • {v.regNumber}</p>
                </div>
                <ChevronRight className="text-slate-300" />
             </Card>
          ))}
          {(!profile?.vehicles || profile.vehicles.length === 0) && !showAddVehicle && (
             <div className="text-center p-8 border-dashed border-2 rounded-3xl text-slate-400">
                No vehicles added yet
             </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
         <h3 className="text-lg font-bold px-2">Account Settings</h3>
         <div className="grid gap-2">
            {[
               { icon: CreditCard, label: 'Payment Methods', sub: 'JazzCash, Card, EasyPaisa' },
               { icon: History, label: 'Booking History', sub: 'View your past requests' },
               { icon: ShieldCheck, label: 'Insurance Info', sub: 'Manage vehicle insurance' },
               { icon: Settings, label: 'Settings', sub: 'App preferences and safety' },
            ].map(item => (
               <Card key={item.label} className="border-none shadow-sm hover:bg-slate-50 cursor-pointer transition-colors p-4 flex items-center gap-4">
                  <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
                     <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-sm">{item.label}</h4>
                     <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <ChevronRight className="text-slate-300 h-4 w-4" />
               </Card>
            ))}
         </div>
      </section>

      <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-2xl font-bold" onClick={() => signOut(auth).then(() => navigate('/login'))}>
         <LogOut className="mr-2 h-5 w-5" /> Sign Out
      </Button>
    </div>
  );
}
