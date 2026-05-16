import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { Toaster } from './components/ui/sonner';
import Home from './pages/Home';
import Login from './pages/Login';
import MechanicDashboard from './pages/MechanicDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RequestService from './pages/RequestService';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import { Layout } from './components/Layout';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && profile?.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="/request" element={<PrivateRoute role="user"><Layout><RequestService /></Layout></PrivateRoute>} />
          <Route path="/tracking/:requestId" element={<PrivateRoute><Layout><Tracking /></Layout></PrivateRoute>} />
          
          {/* Mechanic Routes */}
          <Route path="/mechanic/*" element={<PrivateRoute role="mechanic"><Layout><MechanicDashboard /></Layout></PrivateRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/*" element={<PrivateRoute role="admin"><Layout><AdminDashboard /></Layout></PrivateRoute>} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}
