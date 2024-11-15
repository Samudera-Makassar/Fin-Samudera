import React, { useEffect, useState } from 'react'
import { db } from '../firebaseConfig' // Pastikan db diimpor dari firebaseConfig
import { doc, getDoc } from 'firebase/firestore'
import ReimbursementTable from '../components/ReimbursementTable'
import LpjBsTable from '../components/LpjBsTable'
import ReportCard from '../components/ReportCard'
import Modal from '../components/Modal'
import Layout from './Layout'

const AdminDashboard = ({ userEmail }) => {
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
    const email = userEmail || localStorage.getItem('userEmail')

    useEffect(() => {
        document.title = 'Dashboard - Samudera Indonesia'

        const fetchUserData = async () => {
            try {
                if (email) {
                    // Ambil data user dari Firestore berdasarkan email sebagai ID dokumen
                    const userDoc = await getDoc(doc(db, 'users', email))
                    if (userDoc.exists()) {
                        setUser({
                            name: userDoc.data().nama || 'Anonymous'
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
    }, [email])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState(null)
    const [cancelReason, setCancelReason] = useState('')

    const reimbursementCount = data.reimbursements.filter((item) => item.status === 'Diproses').length
    const lpjCount = data.lpjBs.filter((item) => item.status === 'Diproses').length

    const handleCancel = (report) => {
        setSelectedReport(report)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
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
                    showModal={isModalOpen}
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

export default AdminDashboard
