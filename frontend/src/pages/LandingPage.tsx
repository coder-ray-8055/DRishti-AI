import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { Stats } from '../components/landing/Stats';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Technology } from '../components/landing/Technology';
import { About } from '../components/landing/About';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F3] selection:bg-[#DCE6DE] selection:text-[#183F35]">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <HowItWorks />
        <Technology />
        <About />
      </main>
      <Footer />
    </div>
  );
};

