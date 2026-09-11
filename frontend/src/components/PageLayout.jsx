import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import FooterSection from './FooterSection';

const PageLayout = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="page-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-main)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '100px' }}>
        {children}
      </main>
      <FooterSection />
    </div>
  );
};

export default PageLayout;
