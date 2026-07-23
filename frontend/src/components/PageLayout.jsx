import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import FooterSection from './FooterSection';
import FloatingChat from './FloatingChat';

const PageLayout = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="page-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0B0B0E', color: '#FFFFFF' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '100px' }}>
        {children}
      </main>
      <FooterSection />
      <FloatingChat />
    </div>
  );
};

export default PageLayout;
