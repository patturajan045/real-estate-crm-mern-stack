import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CmsProvider } from './context/CmsContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import MainLayout from './layouts/MainLayout';

// Lazy-loaded routes for code splitting and ultra-fast initial page load
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Leads = lazy(() => import('./pages/Leads'));
const Properties = lazy(() => import('./pages/Properties'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CmsProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner fullPage message="Loading EstateFlow CRM..." />}>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Application Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="properties" element={<Properties />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route
                      path="users"
                      element={
                        <ProtectedRoute allowedRoles={['Super Admin', 'Admin']}>
                          <Users />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <ProtectedRoute allowedRoles={['Super Admin']}>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </CmsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
