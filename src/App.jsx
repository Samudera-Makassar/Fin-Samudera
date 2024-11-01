import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import SidebarWrapper from './components/sidebarWrapper';
import RbsMedical from './pages/RbsMedical';
import RbsBbm from './pages/RbsBbm';
import RbsOperasional from './pages/RbsOperasional';
import RbsUmum from './pages/RbsUmum';
import LpjUmum from './pages/LpjUmum';
import LpjMarketing from './pages/LpjMarketing';
import DetailReimbursementPage from './pages/DetailRbsPage';
import DetailLpjPage from './pages/DetailLpjPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/protectedRoute';
import RbsCheckPage from './pages/RbsCheckPage';
import LpjCheckPage from './pages/LpjCheckPage';
import ManageUserPage from './pages/ManageUserPage';

const AppContent = ({ userRole }) => {
    return (
        <div>
            <SidebarWrapper role={userRole} />

            <Routes>
                <Route path="/" element={<Login />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard/employee" element={
                    <ProtectedRoute role="employee" userRole={userRole}>
                        <EmployeeDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/reviewer" element={
                    <ProtectedRoute role="reviewer" userRole={userRole}>
                        <ReviewerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard/admin" element={
                    <ProtectedRoute role="admin" userRole={userRole}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Reimbursement Routes */}
                <Route path="/reimbursement/medical" element={<RbsMedical />} />
                <Route path="/reimbursement/bbm" element={<RbsBbm />} />
                <Route path="/reimbursement/operasional" element={<RbsOperasional />} />
                <Route path="/reimbursement/umum" element={<RbsUmum />} />
                <Route path="/reimbursement/detail" element={<DetailReimbursementPage />} />
                <Route path="/reimbursement/cek-laporan" element={<RbsCheckPage />} />

                {/* LPJ Routes */}
                <Route path="/lpj/umum" element={<LpjUmum />} />
                <Route path="/lpj/marketing" element={<LpjMarketing />} />
                <Route path="/lpj/detail" element={<DetailLpjPage />} />
                <Route path="/lpj/cek-laporan" element={<LpjCheckPage />} />

                {/* Manage User Route */}
                <Route path="/manage-users" element={<ManageUserPage />} />

                {/* Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

const App = () => {
    const userRole = 'admin';  // Contoh peran pengguna

    return (
        <BrowserRouter>
            <AppContent userRole={userRole} />
        </BrowserRouter>
    );
}

export default App;
