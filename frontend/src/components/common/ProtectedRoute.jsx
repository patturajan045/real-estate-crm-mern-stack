import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    Swal.fire({
      icon: 'warning',
      title: 'Access Restricted',
      text: `The ${user?.role || 'user'} role does not have permission to view this page.`,
      confirmButtonColor: '#2563eb',
    });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
