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
        >
          <span style={{ color: '#F5C542' }}>✦</span> REPLAY INTRO
        </button>
      )}
    </>
  );
}

export default LandingPage;
