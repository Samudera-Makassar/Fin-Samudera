import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RbsMedical from './pages/RbsMedical'
import RbsBbm from './pages/RbsBbm'
import RbsOperasional from './pages/RbsOperasional'
import RbsUmum from './pages/RbsUmum'
// import './App.css';

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    {/* <Route path="/" element={<Login />} /> */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reimbursement/medical" element={<RbsMedical />} />
                    <Route path="/reimbursement/bbm" element={<RbsBbm />} />
                    <Route path="/reimbursement/operasional" element={<RbsOperasional />} />
                    <Route path="/reimbursement/umum" element={<RbsUmum />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
