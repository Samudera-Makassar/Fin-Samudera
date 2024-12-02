import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebaseConfig' 
import Modal from './Modal'
import EmptyState from '../assets/images/EmptyState.png'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ReimbursementCheck = () => {
    const [data, setData] = useState({ reimbursements: [] })

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5 // Jumlah item per halaman

    const [showModal, setShowModal] = useState(false)
    const [modalProps, setModalProps] = useState({})

    // Fungsi untuk membuka modal
    const openModal = ({ title, message, onConfirm }) => {
        setModalProps({ title, message, onConfirm })
        setShowModal(true)
    }

    // Fungsi untuk menutup modal
    const closeModal = () => {
        setShowModal(false)
    }

    useEffect(() => {
        const fetchUserAndReimbursements = async () => {
            try {
                const uid = localStorage.getItem('userUid') // Ambil UID dari localStorage
                const userRole = localStorage.getItem('userRole')
    
                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return
                }
    
                // Fetch data user berdasarkan UID
                const userDocRef = doc(db, 'users', uid)
                const userDoc = await getDoc(userDocRef)
    
                // Query reimbursement berdasarkan UID user dan role
                let reimbursements = []
                if (userRole === 'Admin') {
                    // Jika Admin, tampilkan semua reimbursement yang diproses
                    const q = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diproses')
                    )
                    const querySnapshot = await getDocs(q)
                    reimbursements = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data(),
                    }))
                } else {
                    // Untuk reviewer
                    const q1 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer1', 'array-contains', uid)                                      
                    )

                    // Query tambahan untuk reviewer2 yang memerlukan approval reviewer1
                    const q2 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer2', 'array-contains', uid),
                        where('approvedByReviewer1', '==', true)
                    )

                    // Gabungkan hasil dari kedua query
                    const [snapshot1, snapshot2] = await Promise.all([
                        getDocs(q1),
                        getDocs(q2)
                    ])

                    reimbursements = [
                        ...snapshot1.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        })),
                        ...snapshot2.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        }))
                    ]
    
                    // Hapus duplikasi jika ada
                    reimbursements = Array.from(
                        new Map(reimbursements.map(item => [item.id, item]))
                        .values()
                    )                    
                }
                setData({ reimbursements })
            } catch (error) {
                console.error('Error fetching user or reimbursements data:', error)
            }
        }
    
        fetchUserAndReimbursements()
    }, [])
    
    // Handle Approve
    const handleApprove = (item) => {
        openModal ({
            title: 'Konfirmasi Approve',
            message: `Apakah Anda yakin ingin menyetujui reimbursement dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')
                    const reimbursementRef = doc(db, 'reimbursement', item.id)
        
                    // Check if user is reviewer1 or reviewer2
                    const isReviewer1 = item.user.reviewer1.includes(uid)
                    const isReviewer2 = item.user.reviewer2.includes(uid)
        
                    let updateData = {}
        
                    if (isReviewer1) {
                        // If reviewer1, set approvedByReviewer1 to true
                        updateData = {
                            approvedByReviewer1: true,                    
                            statusHistory: arrayUnion({
                                status: "Disetujui oleh Reviewer 1",
                                timestamp: new Date().toISOString(),
                                actor: uid,
                            })
                        }
                    } 
                    
                    if (isReviewer2 && item.approvedByReviewer1) {
                        // If reviewer2 and reviewer1 has approved, set status to 'Disetujui'
                        updateData = {
                            status: 'Disetujui',
                            approvedByReviewer2: true,                    
                            statusHistory: arrayUnion({
                                status: "Disetujui oleh Reviewer 2",
                                timestamp: new Date().toISOString(),
                                actor: uid,
                            })
                        }
                    }
        
                    // Update the document
                    await updateDoc(reimbursementRef, updateData)
        
                    // Remove the approved item from the list
                    setData(prevData => ({
                        reimbursements: prevData.reimbursements.filter(r => r.id !== item.id)
                    }))
        
                    toast.success('Reimbursement berhasil disetujui')
                    closeModal()
                } catch (error) {
                    console.error('Error approving reimbursement:', error)
                    toast.error('Gagal menyetujui reimbursement')
                }
            }
        })
    }

    // Handle Reject
    const handleReject = (item) => {
        openModal ({
            title: 'Konfirmasi Reject',
            message: `Apakah Anda yakin ingin menolak reimbursement dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')

                    // Cek apakah UID termasuk dalam reviewer1 atau reviewer2
                    const isReviewer1 = item.user.reviewer1.includes(uid)
                    const isReviewer2 = item.user.reviewer2.includes(uid)

                    let reviewerRole = ''
                    if (isReviewer1) {
                        reviewerRole = 'Reviewer 1'
                    } else if (isReviewer2) {
                        reviewerRole = 'Reviewer 2'
                    } else {
                        throw new Error('Anda tidak memiliki akses untuk menolak reimbursement ini.')
                    }
                    
                    // Update document to set status to 'Ditolak'
                    const reimbursementRef = doc(db, 'reimbursement', item.id)
                    await updateDoc(reimbursementRef, {
                        status: 'Ditolak',                        
                        statusHistory: arrayUnion({
                            status: `Ditolak oleh ${reviewerRole}`,
                            timestamp: new Date().toISOString(),
                            actor: uid,
                        })
                    })

                    // Remove the rejected item from the list
                    setData(prevData => ({
                        reimbursements: prevData.reimbursements.filter(r => r.id !== item.id)
                    }))

                    toast.success('Reimbursement berhasil ditolak')
                    closeModal()
                } catch (error) {
                    console.error('Error rejecting reimbursement:', error)
                    toast.error('Gagal menolak reimbursement')
                }
            }
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A' // Handle null/undefined
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
    }

    // Menghitung total halaman
    const totalPages = Math.ceil(data.reimbursements.length / itemsPerPage)

    // Mendapatkan data pengguna untuk halaman saat ini
    const currentReimbursements = data.reimbursements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Fungsi untuk berpindah ke halaman berikutnya
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    // Fungsi untuk berpindah ke halaman sebelumnya
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Cek <span className="font-bold">Laporan Reimbursement</span>
            </h2>
        
            <div>
                {data.reimbursements.length === 0 ? (
                    // Jika belum ada data reimbursement 
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Laporan Menunggu Review/Approve</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                            </figure>
                        </div>
                    </div>
                ) : (
                    // Jika ada data reimbursement
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Laporan Menunggu Review/Approve</h3>
                        <table className="min-w-full bg-white border rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-2 py-2 border text-center w-auto">No.</th>
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Nama</th>
                                    <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                    <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                    <th className="px-4 py-2 border">Jumlah</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.reimbursements.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2 border text-center w-auto">
                                            {index + 1 + (currentPage - 1) * itemsPerPage}
                                        </td>    
                                            <td className="px-4 py-2 border">
                                            <Link 
                                                to={`/reimbursement/${item.id}`}
                                                className="text-black hover:text-gray-700 hover:underline cursor-pointer"
                                            >
                                                {item.displayId}
                                            </Link>                                                                            
                                        </td>
                                        <td className="px-4 py-2 border">{item.user.nama}</td>
                                        <td className="px-4 py-2 border">{item.kategori}</td>
                                        <td className="px-4 py-2 border">{formatDate(item.tanggalPengajuan)}</td>
                                        <td className="px-4 py-2 border">Rp{item.totalBiaya.toLocaleString('id-ID')}</td>
                                        <td className="py-2 border text-center">
                                            <div className="flex justify-center space-x-4">                        
                                                <button 
                                                className="rounded-full p-1 bg-green-200 hover:bg-green-300 text-green-600 border-[1px] border-green-600"
                                                onClick={() => handleApprove(item)}
                                                title="Approve"
                                                >
                                                <svg
                                                    className="w-6 h-6"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path 
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7" 
                                                    />
                                                </svg>
                                                </button>
                                                
                                                <button 
                                                className="rounded-full p-1 bg-red-200 hover:bg-red-300 text-red-600 border-[1px] border-red-600"
                                                onClick={() => handleReject(item)}
                                                title="Reject"
                                                >
                                                <svg
                                                    className="w-6 h-6"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path 
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 18L18 6M6 6l12 12" 
                                                    />
                                                </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                showModal={showModal}
                title={modalProps.title}
                message={modalProps.message}
                onClose={closeModal}
                onConfirm={modalProps.onConfirm}
                cancelText='Batal'
                confirmText='Ya'
            />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
            />
        </div>
    )
}

export default ReimbursementCheck
