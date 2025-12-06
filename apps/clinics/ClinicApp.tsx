import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClinicDirectory from './ClinicDirectory';
import ClinicDetail from './ClinicDetail';
import PatientDashboard from './PatientDashboard';
import BookingSuccess from './BookingSuccess';

const ClinicApp: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-full">
      <Routes>
        <Route path="/" element={<ClinicDirectory />} />
        {/* Support both relative dashboard and global via App.tsx */}
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/success" element={<BookingSuccess />} />
        <Route path=":orgId" element={<ClinicDetail />} />
      </Routes>
    </div>
  );
};

export default ClinicApp;