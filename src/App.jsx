import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider } from './context/SchoolContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import UserManagement from './pages/UserManagement';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import LetterheadPreview from './pages/LetterheadPreview';
import Admissions from './pages/Admissions';
import PettyCash from './pages/PettyCash';
import TeachingPlans from './pages/TeachingPlans';
import ActivityLog from './pages/ActivityLog';

import StudentDashboard from './pages/StudentDashboard';
// Smart home route — parents see their own dashboard
const HomeRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'Parent') return <ParentDashboard />;
  if (user?.role === 'Student') return <StudentDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SchoolProvider>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes directly rendering layout shell */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<HomeRoute />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="settings" element={<Settings />} />
              <Route path="letterhead" element={<LetterheadPreview />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="petty-cash" element={<PettyCash />} />
              <Route path="teaching-plans" element={<TeachingPlans />} />
              <Route path="activity-log" element={<ActivityLog />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </SchoolProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
