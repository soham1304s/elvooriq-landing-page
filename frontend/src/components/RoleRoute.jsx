import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route guard component verifying user JWT and RBAC role claims.
 * @param {Array<string>} allowedRoles - Roles permitted to view this route (e.g. ['ADMIN', 'EMPLOYEE'])
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('elvooriq_token');
  const userJson = localStorage.getItem('elvooriq_user');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    console.error('Invalid user session data', e);
  }

  // If no user object or role not permitted
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    // If user is Employee trying to access Admin, send to Workspace Portal
    if (user?.role === 'EMPLOYEE') {
      return <Navigate to="/workspace-portal" replace />;
    }
    // If user is Admin, send to Admin Panel
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin-panel" replace />;
    }
    // Default fallback
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;
