import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Activity, BookOpen, Layers, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Research & Model', href: '/app/research' },
    { name: 'Clinical Guidance', href: '/app/care' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#F7F7F3]/95 backdrop-blur-md border-b border-[#E6E8E2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#183F35] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Eye className="w-6 h-6 text-[#DCE6DE]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#183F35]">DRISHTI AI</span>
              <span className="text-[11px] font-semibold text-[#737B75] tracking-wider uppercase -mt-1">
                Retinal Screening
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-[#202923] hover:text-[#183F35] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/app"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-[#183F35] hover:text-[#315D4D] px-3 py-2 rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Clinical App</span>
            </Link>
            <Link
              to="/app/screening"
              className="inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <span>Start Screening</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#202923] hover:bg-[#EAE5D9] transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E6E8E2] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#202923] hover:bg-[#F7F7F3]"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#E6E8E2] space-y-2">
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-semibold text-[#183F35] hover:bg-[#F7F7F3]"
            >
              <Activity className="w-5 h-5" />
              <span>Clinical App</span>
            </Link>
            <Link
              to="/app/screening"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full bg-[#183F35] text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-sm"
            >
              <span>Start Screening</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

