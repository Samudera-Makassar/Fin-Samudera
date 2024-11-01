import React, { useState, useEffect } from 'react';
import ReimbursementTable from '../components/ReimbursementTable';
import LpjBsTable from '../components/LpjBsTable';
import ReportCard from '../components/ReportCard';
import CancelModal from '../components/CancelModal';
import Layout from './Layout';

const AdminDashboard = () => {

    useEffect(() => {
        document.title = 'Dashboard - Samudera Indonesia'
    }, [])

    const [data, setData] = useState({
        reimbursements: [
            { id: 'RBS-BBM-01', jenis: 'BBM', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Disetujui' },
            { id: 'RBS-MED-02', jenis: 'Medical', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Ditolak' },
        ],
        lpjBs: [
            { id: 'LPJ-01', jenis: 'BBM', noBs: 'BS0001', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Diproses' },
        ] 
    });

    const reimbursementCount = data.reimbursements.filter(item => item.status === 'Diproses').length;
    const lpjCount = data.lpjBs.filter(item => item.status === 'Diproses').length;

    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    const handleCancel = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCancelReason('');
        setSelectedReport(null);
    };

    const handleSubmitCancel = () => {
        console.log(`Alasan pembatalan laporan ${selectedReport.id}: ${cancelReason}`);
        handleCloseModal();
    };

    return (
        <div>
            <Layout>
                <div className="container mx-auto py-8">
                    <div className="w-full">
                        <h2 className="text-xl font-medium mb-4">
                            Welcome, <span className='font-bold'>Rachmat Maulana</span>
                        </h2>
                        <ReportCard 
                            reimbursementCount={reimbursementCount}
                            lpjCount={lpjCount}
                        />
                        <ReimbursementTable 
                            reimbursements={data.reimbursements} 
                            onCancel={handleCancel} 
                        />
                        <LpjBsTable
                            lpjBs={data.lpjBs} 
                            onCancel={handleCancel} 
                        />
                    </div>
                </div>
                
                <CancelModal 
                    showModal={showModal}
                    selectedReport={selectedReport}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitCancel}
                />
            </Layout>
        </div>
    )
}

export default AdminDashboard;
