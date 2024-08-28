// src/components/AuthWrapper.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthWrapper({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : null;
}
