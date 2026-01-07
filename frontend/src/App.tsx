import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

import ProtectedRoute from './components/auth/ProtectedRoute';
import MenuSidebar from './components/MenuSidebar';
import LoginPage from './pages/LoginPage';
import LeadProfilePage from './pages/LeadProfilePage';
import LeadsPage from './pages/Lead/LeadPage';
import CreateLeadPage from './pages/Lead/CreateLeadPage';
import EditLeadPage from './pages/Lead/EditLeadPage';
import UsersPage from './pages/UsersPage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex w-screen min-h-screen text-foreground bg-background">
      {/* Sidebar - responsive: mobile overlay, desktop fixed */}
      {!isLoginPage && (
        <MenuSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header - only show when sidebar is not open */}
        {!isLoginPage && (
          <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-background z-30 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
              <span className="text-primary text-xl">📊</span>
              <span className="ml-2 font-bold text-foreground">Avacasa</span>
            </div>
            <div className="w-10" />
          </header>
        )}

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <LeadsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/create"
              element={
                <ProtectedRoute>
                  <CreateLeadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <ProtectedRoute>
                  <EditLeadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <LeadProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/leads" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
