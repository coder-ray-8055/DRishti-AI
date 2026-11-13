import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScreeningPage } from './pages/NewScreeningPage';
import { ScreeningResultPage } from './pages/ScreeningResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { CareGuidancePage } from './pages/CareGuidancePage';
import { ResearchPage } from './pages/ResearchPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Clinical Workspace Routes */}
      <Route
        path="/app"
        element={
          <AppShell>
            <DashboardPage />
          </AppShell>
        }
      />
      <Route
        path="/app/screening"
        element={
          <AppShell>
            <NewScreeningPage />
          </AppShell>
        }
      />
      <Route
        path="/app/screening/:id/result"
        element={
          <AppShell>
            <ScreeningResultPage />
          </AppShell>
        }
      />
      <Route
        path="/app/history"
        element={
          <AppShell>
            <HistoryPage />
          </AppShell>
        }
      />
      <Route
        path="/app/care"
        element={
          <AppShell>
            <CareGuidancePage />
          </AppShell>
        }
      />
      <Route
        path="/app/research"
        element={
          <AppShell>
            <ResearchPage />
          </AppShell>
        }
      />
      <Route
        path="/app/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />

      {/* Fallback to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

