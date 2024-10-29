import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ role, userRole, children }) => {
    return role === userRole ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
