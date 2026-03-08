import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import DashboardOverview from '../components/DashboardOverview';
import ProgramsManagement from '../components/ProgramsManagement';
import AdminSettings from '../components/AdminSettings';
import StudentApplications from '../components/StudentApplications';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<'overview' | 'programs' | 'applications' | 'settings'>('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <DashboardOverview />;
      case 'programs':
        return <ProgramsManagement />;
      case 'applications':
        return <StudentApplications />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout}>
      {renderPage()}
    </AdminLayout>
  );
}



