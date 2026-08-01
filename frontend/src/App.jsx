import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

// Lazy loading the dashboard routes (Route-based Code Splitting)
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout.jsx').then(m => ({ default: m.DashboardLayout })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then(m => ({ default: m.Dashboard })));
const Workflows = lazy(() => import('./pages/Workflows.jsx').then(m => ({ default: m.Workflows })));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder.jsx').then(m => ({ default: m.WorkflowBuilder })));
const Executions = lazy(() => import('./pages/Executions.jsx').then(m => ({ default: m.Executions })));
const Settings = lazy(() => import('./pages/Settings.jsx').then(m => ({ default: m.Settings })));

const queryClient = new QueryClient();

// Skeleton Loader for Routes
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#080b14]">
    <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
  </div>
);

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: { background: '#1c1f2e', color: '#fff', border: '1px solid rgba(255,255,255,0.05)' }
          }} 
        />
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                element={
                  <DashboardLayout />
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="workflows" element={<Workflows />} />
                <Route path="workflows/:id" element={<WorkflowBuilder />} />
                <Route path="executions" element={<Executions />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

