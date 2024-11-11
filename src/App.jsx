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
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';

const AppContent = () => {
    const userRole = localStorage.getItem('userRole'); // Ambil role dari localStorage

    return (
        <div>
            <SidebarWrapper role={userRole} />

            <Routes>
                <Route path="/" element={<Login />} />
                
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/reviewer" element={<ReviewerDashboard />} />
                <Route path="/dashboard/employee" element={<EmployeeDashboard />} />

                <Route path="/reimbursement/medical" element={<RbsMedical />} />
                <Route path="/reimbursement/bbm" element={<RbsBbm />} />
                <Route path="/reimbursement/operasional" element={<RbsOperasional />} />
                <Route path="/reimbursement/umum" element={<RbsUmum />} />
                <Route path="/reimbursement/detail" element={<DetailReimbursementPage />} />
                <Route path="/reimbursement/cek-laporan" element={<RbsCheckPage />} />

                <Route path="/lpj/umum" element={<LpjUmum />} />
                <Route path="/lpj/marketing" element={<LpjMarketing />} />
                <Route path="/lpj/detail" element={<DetailLpjPage />} />
                <Route path="/lpj/cek-laporan" element={<LpjCheckPage />} />

                <Route path="/manage-users" element={<ManageUserPage />} />
                <Route path="/manage-users/add" element={<AddUserPage />} />
                <Route path="/manage-users/edit" element={<EditUserPage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

const App = () => {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
