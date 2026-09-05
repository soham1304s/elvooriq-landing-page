import React from 'react';
import { AuthFlowProvider } from '../context/AuthFlowContext';
import FlowEngine from '../components/auth/FlowEngine';
import '../components/auth/Auth.css'; // Premium authentication styles

const AuthPage = () => {
  return (
    <div className="auth-page-container">
      {/* Background with animated particles/blobs */}
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      {/* Main Authentication Flow Engine */}
      <AuthFlowProvider>
        <FlowEngine />
      </AuthFlowProvider>
    </div>
  );
};

export default AuthPage;
