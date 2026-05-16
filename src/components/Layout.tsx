import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { 
  Home, 
  MapPin, 
  User, 
  History, 
  Settings, 
  LogOut, 
  Menu,
  Wrench,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from './ui/sheet';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/', roles: ['user', 'mechanic', 'admin', undefined] },
    { label: 'Request help', icon: MapPin, path: '/request', roles: ['user'] },
    { label: 'My Dashboard', icon: Wrench, path: '/mechanic', roles: ['mechanic'] },
    { label: 'Admin', icon: ShieldCheck, path: '/admin', roles: ['admin'] },
    { label: 'Profile', icon: User, path: '/profile', roles: ['user', 'mechanic', 'admin'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-orange-600">FixKar</h2>
                <p className="text-sm text-slate-500">Your roadside guardian</p>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.filter(item => !item.roles || (profile && item.roles.includes(profile.role)) || (!profile && item.roles.includes(undefined))).map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-4"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="text-2xl font-bold tracking-tighter text-orange-600 cursor-pointer" onClick={() => navigate('/')}>
            FIXKAR
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
          ) : (
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden bg-white border-t h-16 flex items-center justify-around px-4 sticky bottom-0 z-50">
        {navItems.filter(item => !item.roles || (profile && item.roles.includes(profile.role)) || (!profile && item.roles.includes(undefined))).slice(0, 4).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 text-xs ${location.pathname === item.path ? 'text-orange-600' : 'text-slate-500'}`}
          >
            <item.icon className="h-6 w-6" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
