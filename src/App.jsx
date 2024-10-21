import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import RbsMedical from './pages/RbsMedical'
import RbsBbm from './pages/RbsBbm'
import RbsOperasional from './pages/RbsOperasional'
import RbsUmum from './pages/RbsUmum'
import LpjUmum from './pages/LpjUmum'
import LpjMarketing from './pages/LpjMarketing'
import DetailReimbursementPage from './pages/DetailRbsPage'
import DetailLpjPage from './pages/DetailLpjPage'
// import './App.css';

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
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
