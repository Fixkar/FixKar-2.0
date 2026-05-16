import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LogIn, Car, Wrench } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async (role: 'user' | 'mechanic') => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const mechDoc = await getDoc(doc(db, 'mechanics', user.uid));

      if (!userDoc.exists() && !mechDoc.exists()) {
        // New user - create profile based on picked role
        if (role === 'user') {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user',
            createdAt: new Date().toISOString(),
            vehicles: []
          });
        } else {
          await setDoc(doc(db, 'mechanics', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'mechanic',
            isOnline: false,
            rating: 5,
            reviewCount: 0,
            subscriptionPlan: 'free',
            createdAt: new Date().toISOString()
          });
        }
        toast.success(`Welcome to FixKar! Registered as ${role}`);
      } else {
        toast.success('Welcome back!');
      }

      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tighter sm:text-6xl uppercase">
            Fix<span className="text-orange-600">Kar</span>
          </h1>
          <p className="mt-2 text-slate-400 text-lg">Roadside assistance, reimagined for Pakistan.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-6 w-6 text-orange-500" />
                Need Assistance?
              </CardTitle>
              <CardDescription className="text-slate-400">
                Register as a vehicle owner to get help anytime, anywhere.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleGoogleLogin('user')} 
                disabled={loading}
                className="w-full bg-white text-black hover:bg-slate-200 h-12 text-lg font-semibold"
              >
                <LogIn className="mr-2 h-5 w-5" /> Continue as Customer
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-blue-500" />
                Want to Help?
              </CardTitle>
              <CardDescription className="text-slate-400">
                Join our network of expert mechanics and workshops.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => handleGoogleLogin('mechanic')} 
                disabled={loading}
                variant="outline"
                className="w-full border-slate-700 hover:bg-slate-800 h-12 text-lg font-semibold"
              >
                <LogIn className="mr-2 h-5 w-5" /> Continue as Mechanic
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-slate-500 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
