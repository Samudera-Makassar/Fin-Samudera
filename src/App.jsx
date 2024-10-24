import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/LoginPage'
import Sidebar from './components/Sidebar'
import RbsMedical from './pages/RbsMedical'
import RbsBbm from './pages/RbsBbm'
import RbsOperasional from './pages/RbsOperasional'
import RbsUmum from './pages/RbsUmum'
import LpjUmum from './pages/LpjUmum'
import LpjMarketing from './pages/LpjMarketing'
import DetailReimbursementPage from './pages/DetailRbsPage'
import DetailLpjPage from './pages/DetailLpjPage'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ReviewerDashboard from './pages/ReviewerDashboard'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
    const userRole = 'admin'; 

    const PrivateRoute = ({ children, allowedRoles }) => {
        if (allowedRoles.includes(userRole)) {
            return children;
        }
        return <div>Access Denied</div>;
    };

    return (
        <div>
            <BrowserRouter>
                <Sidebar role={userRole} />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard/employee" element={
                        <PrivateRoute allowedRoles={['employee']}>
                            <EmployeeDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/dashboard/reviewer" element={
                        <PrivateRoute allowedRoles={['reviewer']}>
                            <ReviewerDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/dashboard/admin" element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/reimbursement/medical" element={<RbsMedical />} />
                    <Route path="/reimbursement/bbm" element={<RbsBbm />} />
                    <Route path="/reimbursement/operasional" element={<RbsOperasional />} />
                    <Route path="/reimbursement/umum" element={<RbsUmum />} />
                    <Route path="/reimbursement/detail" element={<DetailReimbursementPage />} />
                    <Route path="/lpj/umum" element={<LpjUmum />} />
                    <Route path="/lpj/marketing" element={<LpjMarketing />} />
                    <Route path="/lpj/detail" element={<DetailLpjPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
