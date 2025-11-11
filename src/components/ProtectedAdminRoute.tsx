// src/components/ProtectedAdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../types';

interface ProtectedAdminRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ user, children }) => {
  if (!user || user.userType !== 'admin') {
    // Not logged in or not an admin → redirect to home
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedAdminRoute;
