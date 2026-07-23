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
import FeaturedSection from '../components/FeaturedSection';
import SuccessStoriesSection from '../components/SuccessStoriesSection';
import BrandCollabsSection from '../components/BrandCollabsSection';
import LearningCenterSection from '../components/LearningCenterSection';
import JournalSection from '../components/JournalSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import FooterSection from '../components/FooterSection';
import FloatingChat from '../components/FloatingChat';

function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('elvooriq_intro_seen');
    if (hasSeenIntro) {
      setIntroComplete(true);
      document.body.style.overflow = 'auto';
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroComplete(true);
    sessionStorage.setItem('elvooriq_intro_seen', 'true');
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
        <FeaturedSection />
        <SuccessStoriesSection />
        <BrandCollabsSection />
        <LearningCenterSection />
        <JournalSection />
        <FAQSection />
        <ContactSection />
      </main>
      <FooterSection />
      <FloatingChat />
    </>
  );
}

export default LandingPage;
