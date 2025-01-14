import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import SidebarWrapper from './components/sidebarWrapper';
import RbsBbm from './pages/RbsBbm';
import RbsOperasional from './pages/RbsOperasional';
import RbsUmum from './pages/RbsUmum';
import LpjUmum from './pages/LpjUmum';
import LpjMarketing from './pages/LpjMarketing';
import DetailReimbursementPage from './pages/DetailRbsPage';
import DetailLpjPage from './pages/DetailLpjPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ValidatorDashboard from './pages/ValidatorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/protectedRoute';
import RbsCheckPage from './pages/RbsCheckPage';
import LpjCheckPage from './pages/LpjCheckPage';
import ManageUserPage from './pages/ManageUserPage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import CreateBon from './pages/CreateBonPage';
import CreateBsCheckPage from './pages/CreateBsCheckPage';
import DetailCreateBsPage from './pages/DetailCreateBsPage';

const AppContent = () => {
    const userRole = localStorage.getItem('userRole'); // Ambil role dari localStorage

    return (
        <div>
            <SidebarWrapper role={userRole} />

            <Routes>
                <Route path="/" element={<Login />} />
                
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/reviewer" element={<ReviewerDashboard />} />
                <Route path="/dashboard/validator" element={<ValidatorDashboard />} />
                <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
                
                <Route path="/reimbursement/bbm" element={<RbsBbm />} />
                <Route path="/reimbursement/operasional" element={<RbsOperasional />} />
                <Route path="/reimbursement/umum" element={<RbsUmum />} />
                <Route path="/reimbursement/:id" element={<DetailReimbursementPage />} />                
                <Route path="/reimbursement/cek-pengajuan" element={<RbsCheckPage />} />

                <Route path="/create-bs/create" element={<CreateBon />} />
                <Route path="/create-bs/cek-pengajuan" element={<CreateBsCheckPage />} />
                <Route path="/create-bs/:id" element={<DetailCreateBsPage />} />

                <Route path="/lpj/umum" element={<LpjUmum />} />
                <Route path="/lpj/marketing" element={<LpjMarketing />} />
                <Route path="/lpj/:id" element={<DetailLpjPage />} />
                <Route path="/lpj/cek-pengajuan" element={<LpjCheckPage />} />

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
