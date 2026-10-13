/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, Employee, Shift } from './types';
import { INITIAL_EMPLOYEES } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/ui/Toast';
import { SmartRosterModal } from './components/modals/SmartRosterModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

// Views
import { OverviewView } from './components/dashboard/OverviewView';
import { StaffRosterView } from './components/roster/StaffRosterView';
import { ForecastView } from './components/forecast/ForecastView';
import { TalentPoolView } from './components/talent/TalentPoolView';
import { WhatsAppSimulatorView } from './components/simulator/WhatsAppSimulatorView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSmartRosterOpen, setIsSmartRosterOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update specific shift in the roster
  const handleUpdateShift = (shiftId: string, updates: Partial<Shift>) => {
    setEmployees(prev =>
      prev.map(emp => ({
        ...emp,
        shifts: emp.shifts.map(s => (s.id === shiftId ? { ...s, ...updates } : s))
      }))
    );
  };

  // Smart Roster execution: auto-fills all vacant shifts
  const handleApplySmartRoster = () => {
    setEmployees(prev =>
      prev.map(emp => ({
        ...emp,
        shifts: emp.shifts.map(s => {
          if (s.status === 'Vacant') {
            return {
              ...s,
              status: 'Confirmed',
              role: s.role.includes('Open') ? 'Staffed by Floater' : `${s.role} (Covered)`,
              shiftLabel: s.shiftLabel === 'Open Shift' ? 'Covered' : s.shiftLabel,
              staffNeeded: 0,
            };
          }
          return s;
        })
      }))
    );
    showToast('AI Smart Roster generated! 5 open vacancies covered via Talent Pool floaters.');
  };

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#0b1c30] overflow-hidden antialiased">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onTriggerToast={showToast}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto pt-20 px-4 sm:px-6 lg:px-8">
          {currentTab === 'overview' && (
            <OverviewView
              onNavigateTab={setCurrentTab}
              onOpenSmartRoster={() => setIsSmartRosterOpen(true)}
              onTriggerToast={showToast}
            />
          )}

          {currentTab === 'staff-roster' && (
            <StaffRosterView
              employees={employees}
              onOpenSmartRoster={() => setIsSmartRosterOpen(true)}
              onTriggerToast={showToast}
              onUpdateShift={handleUpdateShift}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'ai-forecast' && (
            <ForecastView
              onTriggerToast={showToast}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'talent-pool' && (
            <TalentPoolView
              onTriggerToast={showToast}
            />
          )}

          {currentTab === 'whatsapp-simulator' && (
            <WhatsAppSimulatorView
              onTriggerToast={showToast}
              onAutoAddShiftToRoster={(empName, role, dept) => {
                setEmployees(prev =>
                  prev.map(emp => {
                    if (emp.name === empName) {
                      return {
                        ...emp,
                        shifts: emp.shifts.map((s, idx) => {
                          if (idx === 5) { // Saturday
                            return {
                              ...s,
                              status: 'Confirmed',
                              role: role,
                              department: dept,
                              shiftLabel: 'Evening',
                              timeRange: '12:00 - 20:00',
                            };
                          }
                          return s;
                        })
                      };
                    }
                    return emp;
                  })
                );
              }}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              onTriggerToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onTriggerToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Smart Roster Generation Modal */}
      <SmartRosterModal
        isOpen={isSmartRosterOpen}
        onClose={() => setIsSmartRosterOpen(false)}
        onApplyRoster={handleApplySmartRoster}
      />

      {/* Command+K Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentTab}
        onTriggerToast={showToast}
      />

      {/* Floating Feedback Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
