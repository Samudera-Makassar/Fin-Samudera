import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebaseConfig' 
import Modal from './Modal'
import EmptyState from '../assets/images/EmptyState.png'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const LpjBsCheck = () => {
    const [data, setData] = useState({ lpj: [] })

    const [currentPage, setCurrentPage] = useState(1)

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
        const fetchUserAndLpjs = async () => {
            try {
                const uid = localStorage.getItem('userUid') // Ambil UID dari localStorage
                const userRole = localStorage.getItem('userRole')

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')                    
                    return
                }              

                // Query reimbursement berdasarkan UID user dan role
                let lpj = []
                if (userRole === 'Super Admin') {
                    // Jika Super Admin, tampilkan semua lpj yang diproses
                    const q = query(
                        collection(db, 'lpj'),
                        where("status", "in", ["Diproses", "Diajukan"])
                    )
                    const querySnapshot = await getDocs(q)
                    lpj = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data(),
                    }))
                } else {
                    // Untuk reviewer 1: hanya tampilkan lpj dengan status 'Diajukan'
                    const q1 = query(
                        collection(db, 'lpj'),
                        where("status", "==", "Diajukan"),
                        where('user.reviewer1', 'array-contains', uid)                                      
                    )

                    // Untuk reviewer 2: tampilkan lpj dengan status 'Diproses' 
                    // yang sudah disetujui oleh reviewer 1
                    const q2 = query(
                        collection(db, 'lpj'),
                        where("status", "==", "Diproses"),
                        where('user.reviewer2', 'array-contains', uid),
                        where('approvedByReviewer1Status', 'in', ['reviewer', 'superadmin'])
                    )

                    // Gabungkan hasil dari kedua query
                    const [snapshot1, snapshot2] = await Promise.all([
                        getDocs(q1),
                        getDocs(q2)
                    ])

                    lpj = [
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
                    lpj = Array.from(
                        new Map(lpj.map(item => [item.id, item]))
                        .values()
                    )                    
                }

                // Sort lpj from oldest to newest based on tanggalPengajuan
                lpj.sort((a, b) => {
                    const dateA = new Date(a.tanggalPengajuan)
                    const dateB = new Date(b.tanggalPengajuan)
                    return dateA - dateB
                })

                setData({ lpj })
            } catch (error) {
                console.error('Error fetching user or lpj data:', error)
            }
        }

        fetchUserAndLpjs()
    }, [])

    // Handle Approve
    const handleApprove = (item) => {
        openModal ({
            title: 'Konfirmasi Approve',
            message: `Apakah Anda yakin ingin menyetujui LPJ Bon Sementara dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')
                    const userRole = localStorage.getItem('userRole')
                    const lpjRef = doc(db, 'lpj', item.id)
        
                    // Cek apakah UID termasuk dalam super admin, reviewer1, atau reviewer2
                    const isSuperAdmin = userRole === 'Super Admin'
                    const isReviewer1 = item.user.reviewer1.includes(uid)
                    const isReviewer2 = item.user.reviewer2.includes(uid)
        
                    const hasSingleReviewer = !item.user.reviewer2.length

                    let updateData = {}
        
                    if (isSuperAdmin) {
                        // Super Admin approval logic
                        if (!item.approvedByReviewer1Status) {
                            // If not approved by anyone, Super Admin approves as first approver
                            updateData = {
                                status: 'Diproses',
                                approvedByReviewer1Status: "superadmin", // New field to track approval type
                                approvedBySuperAdmin: true,
                                statusHistory: arrayUnion({
                                    status: "Disetujui oleh Super Admin (Pengganti Reviewer 1)",
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        } else if (item.approvedByReviewer1Status === "superadmin" || item.approvedByReviewer1Status === "reviewer") {
                            // If already approved by Reviewer 1 or Super Admin, finalize the approval
                            updateData = {
                                status: 'Disetujui',
                                approvedByReviewer2Status: "superadmin",                                 
                                approvedBySuperAdmin: true,
                                statusHistory: arrayUnion({
                                    status: "Disetujui oleh Super Admin (Pengganti Reviewer 2)",
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        }
                    } else {
                        if (isReviewer1) {
                            // Jika reviewer1, dan hanya ada satu reviewer
                            if (hasSingleReviewer) {
                                // Jika hanya ada satu reviewer, langsung set status ke 'Disetujui'
                                updateData = {
                                    status: 'Disetujui',
                                    approvedByReviewer1: true,
                                    approvedByReviewer1Status: 'reviewer',
                                    statusHistory: arrayUnion({
                                        status: 'Disetujui oleh Reviewer 1',
                                        timestamp: new Date().toISOString(),
                                        actor: uid
                                    })
                                }
                            } else {
                                // Jika ada reviewer 2, set approvedByReviewer1 ke true
                                updateData = {
                                    status: 'Diproses',
                                    approvedByReviewer1: true,
                                    approvedByReviewer1Status: 'reviewer',
                                    statusHistory: arrayUnion({
                                        status: 'Disetujui oleh Reviewer 1',
                                        timestamp: new Date().toISOString(),
                                        actor: uid
                                    })
                                }
                            }
                        } 
                    
                        if (isReviewer2 && 
                            (item.approvedByReviewer1Status === "reviewer" || item.approvedByReviewer1Status === "superadmin")) {
                            // If reviewer2 and (Reviewer1 or SuperAdmin has approved), set status to 'Disetujui'
                            updateData = {
                                status: 'Disetujui',
                                approvedByReviewer2: true,
                                approvedByReviewer2Status: "reviewer",                     
                                statusHistory: arrayUnion({
                                    status: "Disetujui oleh Reviewer 2",
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        }
                    }
        
                    // Update the document
                    await updateDoc(lpjRef, updateData)
        
                    // Remove the approved item from the list
                    setData(prevData => ({
                        lpj: prevData.lpj.filter(r => r.id !== item.id)
                    }))
        
                    toast.success('LPJ Bon Sementara berhasil disetujui')
                    closeModal()
                } catch (error) {
                    console.error('Error approving lpj:', error)
                    toast.error('Gagal menyetujui LPJ Bon Sementara')
                }
            }
        })
    }

    // Handle Reject
    const handleReject = (item) => {
        openModal ({
            title: 'Konfirmasi Reject',
            message: `Apakah Anda yakin ingin menolak LPJ Bon Sementara dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')
                    const userRole = localStorage.getItem('userRole')  
                    const lpjRef = doc(db, 'lpj', item.id)                  

                    // Cek apakah UID termasuk dalam super admin, reviewer1, atau reviewer2
                    const isSuperAdmin = userRole === 'Super Admin'
                    const isReviewer1 = item.user.reviewer1.includes(uid)
                    const isReviewer2 = item.user.reviewer2.includes(uid)

                    let updateData = {}
                    
                    if (isSuperAdmin) {
                        // Super Admin rejection logic
                        if (!item.approvedByReviewer1Status) {
                            // If not approved by anyone, Super Admin rejects as first reviewer                            
                            updateData = {
                                status: 'Ditolak',
                                approvedByReviewer1Status: "superadmin",
                                rejectedBySuperAdmin: true,
                                statusHistory: arrayUnion({
                                    status: 'Ditolak oleh Super Admin (Pengganti Reviewer 1)',
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        } else if (item.approvedByReviewer1Status === "superadmin" || item.approvedByReviewer1Status === "reviewer") {
                            // If already approved by Reviewer 1 or Super Admin, reject at final stage                            
                            updateData = {
                                status: 'Ditolak',
                                approvedByReviewer2Status: "superadmin",  
                                rejectedBySuperAdmin: true,
                                statusHistory: arrayUnion({
                                    status: 'Ditolak oleh Super Admin (Pengganti Reviewer 2)',
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        }
                    } else {
                        // Existing reviewer rejection logic
                        if (isReviewer1) {                            
                            updateData = {
                                status: 'Ditolak',
                                approvedByReviewer1Status: "reviewer",
                                statusHistory: arrayUnion({
                                    status: 'Ditolak oleh Reviewer 1',
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        } else if (isReviewer2 && (item.approvedByReviewer1Status === "reviewer" || item.approvedByReviewer1Status === "superadmin")) {                            
                            updateData = {
                                status: 'Ditolak',
                                statusHistory: arrayUnion({
                                    status: 'Ditolak oleh Reviewer 2',
                                    timestamp: new Date().toISOString(),
                                    actor: uid,
                                })
                            }
                        } else {
                            throw new Error('Anda tidak memiliki akses untuk menolak lpj ini.')
                        }
                    }
    
                    // Update the document
                    await updateDoc(lpjRef, updateData)
    
                    // Remove the rejected item from the list
                    setData(prevData => ({
                        lpj: prevData.lpj.filter(r => r.id !== item.id)
                    }))
    
                    toast.success('LPJ Bon Sementara berhasil ditolak')
                    closeModal()
                } catch (error) {
                    console.error('Error rejecting lpj:', error)
                    toast.error('Gagal menolak LPJ Bon Sementara')
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

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Cek <span className="font-bold">Laporan Bon Sementara</span>
            </h2>
        
            <div>
                {data.lpj.length === 0 ? (
                    // Jika belum ada data LPJ BS 
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar LPJ Bon Sementara Perlu Ditanggapi</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="lpj icon" className="w-full h-full object-contain" />
                            </figure>
                        </div>
                    </div>
                ) : (
                    // Jika ada data LPJ BS
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar LPJ Bon Sementara Perlu Ditanggapi</h3>
                        <table className="min-w-full bg-white border rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                <th className="px-2 py-2 border text-center w-auto">No.</th>
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Nama</th>
                                    <th className="px-4 py-2 border">Kategori LPJ BS</th>
                                    <th className="px-4 py-2 border">Nomor BS</th>
                                    <th className="px-4 py-2 border">Jumlah BS</th>
                                    <th className="px-4 py-2 border">Tanggal Pengajuan</th>                                    
                                    <th className="py-2 border text-center">Status</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lpj.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2 border text-center w-auto">
                                            {index + 1 + (currentPage - 1)}
                                        </td>    
                                            <td className="px-4 py-2 border">
                                            <Link 
                                                to={`/lpj/${item.id}`}
                                                className="text-black hover:text-gray-700 hover:underline cursor-pointer"
                                            >
                                                {item.displayId}
                                            </Link>                                                                            
                                        </td>
                                        <td className="px-4 py-2 border">{item.user.nama}</td>
                                        <td className="px-4 py-2 border">{item.kategori}</td>
                                        <td className="px-4 py-2 border">{item.nomorBS}</td>
                                        <td className="px-4 py-2 border">Rp{item.jumlahBS.toLocaleString('id-ID')}</td>              
                                        <td className="px-4 py-2 border">{formatDate(item.tanggalPengajuan)}</td>                                                              
                                        <td className="py-2 border text-center">
                                            <span className={`px-4 py-1 rounded-full text-xs font-medium 
                                                ${
                                                    item.status === 'Diajukan' ? 'bg-blue-200 text-blue-800 border-[1px] border-blue-600' : 
                                                    item.status === 'Disetujui' ? 'bg-green-200 text-green-800 border-[1px] border-green-600' : 
                                                    item.status === 'Diproses' ? 'bg-yellow-200 text-yellow-800 border-[1px] border-yellow-600' : 
                                                    item.status === 'Ditolak' ? 'bg-red-200 text-red-800 border-[1px] border-red-600' : 
                                                    'bg-gray-300 text-gray-700 border-[1px] border-gray-600'
                                                }`}
                                            >
                                                {item.status || 'Tidak Diketahui'}
                                            </span>
                                        </td>                          
                                        <td className="py-2 border text-center">
                                            <div className="flex justify-center space-x-2">                        
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
    );
};

export default LpjBsCheck;
