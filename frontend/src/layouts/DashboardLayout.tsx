/**
 * DashboardLayout.tsx — Layout หลัง login (Member/Trainer/Admin)
 * โครงสร้าง: TopNav (ลอยแบบ pill) + เนื้อหา · ลูกเล่นร่วมจาก AppFx
 */

import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import TopNav from '../components/TopNav';
import { AppFx, PageTransition } from '../components/AppFx';
import './DashboardLayout.css';

function DashboardLayout() {
  return (
    <div className="dash">
      <TopNav />
      <main className="dash__main">
        <ErrorBoundary>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </ErrorBoundary>
      </main>
      <AppFx />
    </div>
  );
}

export default DashboardLayout;
