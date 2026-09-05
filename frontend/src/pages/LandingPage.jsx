import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroLoader from '../components/IntroLoader';
import Header from '../components/Header';
import Hero from '../components/Hero';

import CreatorsMarquee from '../components/CreatorsMarquee';
import AboutSection from '../components/AboutSection';
import PillarsSection from '../components/PillarsSection';
import ServicesSection from '../components/ServicesSection';
import ResultsSection from '../components/ResultsSection';
import SuccessStoriesSection from '../components/SuccessStoriesSection';
import LearningCenterSection from '../components/LearningCenterSection';
import JournalSection from '../components/JournalSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import FooterSection from '../components/FooterSection';

function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('intro') === 'true' || urlParams.get('replay') === 'true') {
      sessionStorage.removeItem('elvooriq_intro_seen');
      setIntroComplete(false);
      return;
    }

    const hasSeenIntro = sessionStorage.getItem('elvooriq_intro_seen');
    if (hasSeenIntro) {
      setIntroComplete(true);
      document.body.style.overflow = 'auto';
      return;
    }

    // Failsafe timer: guarantees the platform reveals itself even if timers/animations are throttled
    const failsafe = setTimeout(() => {
      setIntroComplete(true);
      document.body.style.overflow = 'auto';
    }, 3800);

    return () => clearTimeout(failsafe);
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    sessionStorage.setItem('elvooriq_intro_seen', 'true');
  };

  const handleReplayIntro = () => {
    sessionStorage.removeItem('elvooriq_intro_seen');
    setIntroComplete(false);
  };

  return (
    <>
      <AnimatePresence>
        {!introComplete && <IntroLoader onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <Header />
      <main>
        <Hero animateHero={introComplete} />

        <CreatorsMarquee />
        <AboutSection />
        <PillarsSection />
        <ServicesSection />
        <ResultsSection />
        <SuccessStoriesSection />
        <LearningCenterSection />
        <JournalSection />
        <FAQSection />
        <ContactSection />
      </main>
      <FooterSection />

      {/* Floating Replay Intro Trigger */}
      {introComplete && (
        <button 
          onClick={handleReplayIntro}
          className="replay-intro-pill"
          title="Replay Opening Cosmic Sequence"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 88,
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(229, 193, 88, 0.35)',
            color: '#FFE57F',
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            letterSpacing: '1px',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00F59B';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 245, 155, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(229, 193, 88, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
          }}
        >
          <span style={{ color: '#00F59B' }}>✦</span> REPLAY INTRO
        </button>
      )}
    </>
  );
}

export default LandingPage;
