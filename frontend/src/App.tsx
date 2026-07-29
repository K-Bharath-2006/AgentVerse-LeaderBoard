import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Common pages
import Home from './pages/public/Home';
import Dashboard from './pages/public/Dashboard';
import Leaderboard from './pages/public/Leaderboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
 
// Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import JuryDashboard from './pages/jury/JuryDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
 
// Protected Route HOC
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};
 
import { Toaster } from 'react-hot-toast';

function App() {
  const { checkAuth } = useAuthStore();
 
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
 
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Jury Routes */}
        <Route path="/jury/*" element={
          <ProtectedRoute allowedRoles={['faculty_jury', 'alumni_jury', 'industry_jury']}>
            <JuryDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
