import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig' // Pastikan db diimpor dari firebaseConfig
import { doc, getDoc } from 'firebase/firestore'
import ReimbursementTable from '../components/ReimbursementTable'
import LpjBsTable from '../components/LpjBsTable'
import ReportCard from '../components/ReportCard'
import Modal from '../components/Modal'
import Layout from './Layout'

const ReviewerDashboard = ({ userUid }) => {
    const [user, setUser] = useState(null) // State untuk menyimpan data user yang sedang login
    const [data, setData] = useState({
        reimbursements: [
            { id: 'RBS-BBM-01', jenis: 'BBM', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Disetujui' },
            { id: 'RBS-MED-02', jenis: 'Medical', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Ditolak' }
        ],
        lpjBs: [
            {
                id: 'LPJ-01',
                jenis: 'BBM',
                noBs: 'BS0001',
                tanggal: '10-Okt-2024',
                jumlah: 'Rp.123.000',
                status: 'Diproses'
            }
        ]
    })

    // Ambil email dari localStorage jika tidak dikirim melalui prop
    const uid = userUid || localStorage.getItem('userUid')

    useEffect(() => {
        document.title = 'Dashboard - Samudera Indonesia'

        const fetchUserData = async () => {
            try {
                if (uid) {
                    // Ambil data user dari Firestore berdasarkan email sebagai ID dokumen
                    const userDoc = await getDoc(doc(db, 'users', uid))
                    if (userDoc.exists()) {
                        setUser({
                            name: userDoc.data().nama || 'User'
                        })
                    } else {
                        console.log('User data not found in Firestore')
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUserData()
    }, [uid])

    // State untuk mengelola modal
    const [showModal, setShowModal] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [cancelReason, setCancelReason] = useState('')

    const reimbursementCount = data.reimbursements.filter((item) => item.status === 'Diproses').length
    const lpjCount = data.lpjBs.filter((item) => item.status === 'Diproses').length

    const handleCancel = (report) => {
        setSelectedReport(report)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setCancelReason('')
        setSelectedReport(null)
    }

    const handleSubmitCancel = () => {
        console.log(`Alasan pembatalan laporan ${selectedReport.id}: ${cancelReason}`)
        handleCloseModal()
    }

    return (
        <div>
            <Layout>
                <div className="container mx-auto py-8">
                    <div className="w-full">
                        <h2 className="text-xl font-medium mb-4">
                            Welcome, <span className="font-bold">{user?.name || 'User'}</span>
                        </h2>
                        <ReportCard reimbursementCount={reimbursementCount} lpjCount={lpjCount} />
                        <ReimbursementTable reimbursements={data.reimbursements} onCancel={handleCancel} />
                        <LpjBsTable lpjBs={data.lpjBs} onCancel={handleCancel} />
                    </div>
                </div>

                <Modal
                    showModal={showModal}
                    selectedReport={selectedReport}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitCancel}
                    title="Konfirmasi Pembatalan"
                    message={`Apakah Anda yakin ingin membatalkan laporan ${selectedReport?.id || 'ini'}?`}
                    cancelText="Tidak"
                    confirmText="Ya, Batalkan"
                    showCancelReason={true}
                />
            </Layout>
        </div>
    )
}

export default ReviewerDashboard
