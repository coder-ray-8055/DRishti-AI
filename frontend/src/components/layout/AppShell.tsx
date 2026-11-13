import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Eye,
  LayoutDashboard,
  PlusCircle,
  History,
  BookOpen,
  LineChart,
  Settings,
  Menu,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../services/api';
import type { HealthResponse } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) {
          setHealth(res);
          setBackendConnected(true);
        }
      } catch (err) {
        if (mounted) {
          setBackendConnected(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Overview', path: '/app', icon: LayoutDashboard },
    { name: 'New Screening', path: '/app/screening', icon: PlusCircle },
    { name: 'Screening History', path: '/app/history', icon: History },
    { name: 'Care Guidance', path: '/app/care', icon: BookOpen },
    { name: 'Research & Model', path: '/app/research', icon: LineChart },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F3] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] border-r border-[#E6E8E2] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:h-screen lg:shrink-0`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-18 px-6 border-b border-[#E6E8E2] flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#183F35] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Eye className="w-5 h-5 text-[#DCE6DE]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#183F35]">DRISHTI AI</span>
                <span className="text-[10px] font-semibold text-[#737B75] tracking-widest uppercase -mt-0.5">
                  Clinical Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#737B75] hover:bg-[#F7F7F3]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Backend Status Banner */}
          <div className="px-5 py-3 border-b border-[#E6E8E2] bg-[#F7F7F3]/70">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737B75] font-medium">Model Engine:</span>
              <div className="flex items-center space-x-1.5 font-semibold">
                {backendConnected === null ? (
                  <span className="text-[#737B75] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Connecting…</span>
                  </span>
                ) : backendConnected && health?.model_loaded ? (
                  <span className="text-[#2D7A4F] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#2D7A4F]" />
                    <span>MobileNetV3 Online</span>
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <span>Backend Offline</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/app'
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#183F35] text-white shadow-sm'
                      : 'text-[#202923] hover:bg-[#F7F7F3] hover:text-[#183F35]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#DCE6DE]' : 'text-[#737B75]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E6E8E2]">
          <Link
            to="/app/screening"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center justify-center space-x-2 w-full bg-[#315D4D] hover:bg-[#183F35] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </Link>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[#737B75] px-1">
            <span>DRISHTI AI v1.0.0</span>
            <Link to="/" className="hover:text-[#183F35] flex items-center space-x-0.5">
              <span>Public Site</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E6E8E2] h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#202923] hover:bg-[#F7F7F3]"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#202923] tracking-tight">
              {location.pathname === '/app' && 'Overview & Dashboard'}
              {location.pathname.startsWith('/app/screening') && 'Retinal Screening'}
              {location.pathname.startsWith('/app/history') && 'Screening Records'}
              {location.pathname.startsWith('/app/care') && 'Clinical Care Guidance'}
              {location.pathname.startsWith('/app/research') && 'Research & Model Evaluation'}
              {location.pathname.startsWith('/app/settings') && 'System Settings'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/app/screening"
              className="hidden sm:inline-flex items-center space-x-2 bg-[#183F35] hover:bg-[#315D4D] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Screening</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

