import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RbsMedical from './pages/RbsMedical'
import RbsBbm from './pages/RbsBbm'
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
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
