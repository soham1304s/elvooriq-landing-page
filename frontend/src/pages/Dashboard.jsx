import React from 'react';
import DashboardHero from '../components/dashboard/DashboardHero';
import DashboardServices from '../components/dashboard/DashboardServices';
import DashboardPlatforms from '../components/dashboard/DashboardPlatforms';
import DashboardBenefits from '../components/dashboard/DashboardBenefits';
import DashboardTestimonials from '../components/dashboard/DashboardTestimonials';
import DashboardFAQ from '../components/dashboard/DashboardFAQ';
import FooterSection from '../components/FooterSection';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* We can add a sidebar or a specific dashboard header here later, 
          but for now, we want the exact hero section from the design to take over. */}
      <DashboardHero />
      <DashboardServices />
      <DashboardPlatforms />
      <DashboardBenefits />
      <DashboardTestimonials />
      <DashboardFAQ />
      <FooterSection />
    </div>
  );
};

export default Dashboard;
