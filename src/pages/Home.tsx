import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  AlertTriangle, 
  Battery, 
  Fuel, 
  Tractor as Tow, 
  RotateCcw as Tire, 
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  Car
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Home() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const emergencyServices = [
    { title: 'Tire/Puncture', icon: Tire, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Battery', icon: Battery, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { title: 'Mechanical', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Fuel Delivery', icon: Fuel, color: 'text-red-500', bg: 'bg-red-50' },
    { title: 'Towing', icon: Tow, color: 'text-slate-500', bg: 'bg-slate-50' },
    { title: 'Electrical', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  if (profile?.role === 'mechanic') {
    return <Navigate to="/mechanic" />;
  }

  return (
    <div className="space-y-8">
      {/* Hero / Promo Section */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-orange-600 p-8 text-white flex flex-col justify-end">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
           <Search className="w-full h-full" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Need help on the road?</h2>
          <p className="text-orange-100 mt-2 max-w-md">Get expert assistance within minutes, anywhere in Pakistan.</p>
        </motion.div>
      </div>

      {/* Emergency Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Emergency Services</h3>
          <Button variant="link" className="text-orange-600 uppercase text-xs font-bold tracking-widest" onClick={() => navigate('/request')}>View All</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {emergencyServices.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-none shadow-sm hover:ring-2 hover:ring-orange-500/20"
                onClick={() => navigate(`/request?type=${service.title}`)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center`}>
                    <service.icon className={`h-6 w-6 ${service.color}`} />
                  </div>
                  <span className="font-semibold text-slate-700">{service.title}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vehicles Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">My Vehicles</h3>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600" onClick={() => navigate('/profile')}>
            <PlusCircle className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>
        {profile?.vehicles?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.vehicles.map((v: any) => (
              <Card key={v.id} className="border-none shadow-sm overflow-hidden flex">
                <div className="w-24 bg-slate-100 flex items-center justify-center text-slate-400">
                  <Car className="h-10 w-10" />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-lg">{v.brand} {v.model}</h4>
                  <p className="text-sm text-slate-500">{v.year} • {v.regNumber}</p>
                  <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Fully Covered
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-transparent text-center p-12">
            <p className="text-slate-500 mb-4">No vehicles added yet. Add your vehicle for faster service.</p>
            <Button onClick={() => navigate('/profile')}>Add My First Vehicle</Button>
          </Card>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Recent Activity</h3>
        <Card className="border-none shadow-sm">
           <CardContent className="p-8 text-center text-slate-400">
             <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
             <p>No recent service requests.</p>
           </CardContent>
        </Card>
      </section>
    </div>
  );
}
