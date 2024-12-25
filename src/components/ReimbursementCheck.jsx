import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import Modal from './Modal'
import Select from 'react-select'
import EmptyState from '../assets/images/EmptyState.png'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const ReimbursementCheck = () => {
    const [activeTab, setActiveTab] = useState('pending')
    const [data, setData] = useState({ reimbursements: [] })
    const [approvedData, setApprovedData] = useState({ reimbursements: [] })
    const [filteredApprovedData, setFilteredApprovedData] = useState({ reimbursements: [] })
    const [showModal, setShowModal] = useState(false)
    const [modalProps, setModalProps] = useState({})

    const uid = localStorage.getItem('userUid')
    const userRole = localStorage.getItem('userRole')

    // Get current date
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // JavaScript months are 0-indexed

    const [yearOptions, setYearOptions] = useState([{ value: currentYear, label: `${currentYear}` }])

    // Set default filters with current month and year
    const [filters, setFilters] = useState({
        bulan: { value: currentMonth, label: new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(today) },
        tahun: { value: currentYear, label: `${currentYear}` }
    })

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
                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return
                }

                let pendingReimbursements = []
                let approvedReimbursements = []

                if (userRole === 'Super Admin') {
                    // Pending reimbursements for Super Admin
                    const pendingQ = query(
                        collection(db, 'reimbursement'),
                        where('status', 'in', ['Diproses', 'Diajukan'])
                    )
                    const pendingSnapshot = await getDocs(pendingQ)
                    pendingReimbursements = pendingSnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data(),
                    }))

                    // Approved reimbursements for Super Admin
                    const approvedQ = query(
                        collection(db, 'reimbursement'),
                        where('status', 'in', ['Diproses', 'Disetujui'])
                    )
                    const approvedSnapshot = await getDocs(approvedQ)
                    approvedReimbursements = approvedSnapshot.docs
                        .map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        }))
                        .filter((doc) =>
                            doc.statusHistory.some((history) =>
                                history.actor === uid &&
                                [
                                    'Disetujui oleh Super Admin (Pengganti Reviewer 1)',
                                    'Disetujui oleh Super Admin (Pengganti Reviewer 2)',
                                    'Disetujui oleh Super Admin',
                                ].includes(history.status)
                            )
                        )
                } else {
                    // For reviewers
                    const pendingQ1 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diajukan'),
                        where('user.reviewer1', 'array-contains', uid)
                    )
                    const pendingQ2 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer2', 'array-contains', uid)
                    )

                    const [snapshot1, snapshot2] = await Promise.all([
                        getDocs(pendingQ1),
                        getDocs(pendingQ2),
                    ])

                    pendingReimbursements = [
                        ...snapshot1.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        })),
                        ...snapshot2.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        })),
                    ]

                    // Approved reimbursements
                    const approvedQ = query(
                        collection(db, 'reimbursement'),
                        where('status', 'in', ['Diproses', 'Disetujui'])
                    )
                    const approvedSnapshot = await getDocs(approvedQ)
                    approvedReimbursements = approvedSnapshot.docs
                        .map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data(),
                        }))
                        .filter((doc) =>
                            doc.statusHistory.some((history) =>
                                history.actor === uid &&
                                ['Disetujui oleh Reviewer 1', 'Disetujui oleh Reviewer 2'
                                ].includes(history.status)
                            )
                        )
                }

                // Sort reimbursements by date
                pendingReimbursements.sort((a, b) => {
                    const dateA = new Date(a.tanggalPengajuan)
                    const dateB = new Date(b.tanggalPengajuan)
                    return dateA - dateB
                })

                // Sort approved reimbursements by the latest statusHistory timestamp
                approvedReimbursements.sort((a, b) => {
                    const latestA = Math.max(
                        ...a.statusHistory
                            .filter((history) => history.actor === uid)
                            .map((history) => new Date(history.timestamp))
                    )
                    const latestB = Math.max(
                        ...b.statusHistory
                            .filter((history) => history.actor === uid)
                            .map((history) => new Date(history.timestamp))
                    )
                    return latestB - latestA
                })

                const existingYears = new Set(
                    approvedReimbursements
                        .map(item =>
                            item.statusHistory
                                .filter(
                                    status =>
                                        status.actor === uid && status.status.includes('Disetujui')
                                )
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
                        )
                        .filter(Boolean) // Hilangkan nilai undefined jika tidak ada tanggal
                        .map(timestamp => new Date(timestamp).getFullYear()) // Ambil tahun dari timestamp
                )

                const updatedYearOptions = Array.from(existingYears)
                    .map(year => ({ value: year, label: `${year}` }))
                    .sort((a, b) => b.value - a.value); // Urutkan tahun dari yang terbaru

                setYearOptions(updatedYearOptions)

                setData({ reimbursements: pendingReimbursements })
                setApprovedData({ reimbursements: approvedReimbursements })
            } catch (error) {
                console.error('Error fetching reimbursements data:', error)
            }
        }

        fetchUserAndReimbursements()
    }, [])

    // Handle Approve
    const handleApprove = (item) => {
        openModal({
            title: 'Konfirmasi Approve',
            message: `Apakah Anda yakin ingin menyetujui reimbursement dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')
                    const userRole = localStorage.getItem('userRole')
                    const reimbursementRef = doc(db, 'reimbursement', item.id)

                    // Cek apakah UID termasuk dalam super admin, reviewer1, atau reviewer2
                    const isSuperAdmin = userRole === 'Super Admin'
                    const isReviewer1 = item.user.reviewer1.includes(uid)
                    const isReviewer2 = item.user.reviewer2.includes(uid)

                    const hasSingleReviewer = !item.user.reviewer2.length

                    let updateData = {}

                    if (isSuperAdmin) {
                        // Super Admin approval logic
                        if (hasSingleReviewer) {
                            // Jika hanya ada satu reviewer, langsung set status ke 'Disetujui'
                            updateData = {
                                status: 'Disetujui',
                                approvedByReviewer1Status: 'superadmin',
                                approvedBySuperAdmin: true,
                                statusHistory: arrayUnion({
                                    status: 'Disetujui oleh Super Admin',
                                    timestamp: new Date().toISOString(),
                                    actor: uid
                                })
                            }
                        } else {
                            // Super Admin approval logic
                            if (!item.approvedByReviewer1Status) {
                                // If not approved by anyone, Super Admin approves as first approver
                                updateData = {
                                    status: 'Diproses',
                                    approvedByReviewer1Status: 'superadmin', // New field to track approval type
                                    approvedBySuperAdmin: true,
                                    statusHistory: arrayUnion({
                                        status: 'Disetujui oleh Super Admin (Pengganti Reviewer 1)',
                                        timestamp: new Date().toISOString(),
                                        actor: uid
                                    })
                                }
                            } else if (
                                item.approvedByReviewer1Status === 'superadmin' ||
                                item.approvedByReviewer1Status === 'reviewer'
                            ) {
                                // If already approved by Reviewer 1 or Super Admin, finalize the approval
                                updateData = {
                                    status: 'Disetujui',
                                    approvedByReviewer2Status: 'superadmin',
                                    approvedBySuperAdmin: true,
                                    statusHistory: arrayUnion({
                                        status: 'Disetujui oleh Super Admin (Pengganti Reviewer 2)',
                                        timestamp: new Date().toISOString(),
                                        actor: uid
                                    })
                                }
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

                        if (
                            isReviewer2 &&
                            (item.approvedByReviewer1Status === 'reviewer' ||
                                item.approvedByReviewer1Status === 'superadmin')
                        ) {
                            // If reviewer2 and (Reviewer1 or SuperAdmin has approved), set status to 'Disetujui'
                            updateData = {
                                status: 'Disetujui',
                                approvedByReviewer2: true,
                                approvedByReviewer2Status: 'reviewer',
                                statusHistory: arrayUnion({
                                    status: 'Disetujui oleh Reviewer 2',
                                    timestamp: new Date().toISOString(),
                                    actor: uid
                                })
                            }
                        }
                    }

                    // Update the document
                    await updateDoc(reimbursementRef, updateData)

                    // Remove the approved item from the list
                    setData((prevData) => ({
                        reimbursements: prevData.reimbursements.filter((r) => r.id !== item.id)
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
        openModal({
            title: 'Konfirmasi Reject',
            message: `Apakah Anda yakin ingin menolak reimbursement dengan ID ${item.displayId}?`,
            onConfirm: async () => {
                try {
                    const uid = localStorage.getItem('userUid')
                    const userRole = localStorage.getItem('userRole')
                    const reimbursementRef = doc(db, 'reimbursement', item.id)

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
                            throw new Error('Anda tidak memiliki akses untuk menolak reimbursement ini.')
                        }
                    }

                    // Update the document
                    await updateDoc(reimbursementRef, updateData)

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

    const filterOptions = {
        bulan: [
            { value: 1, label: 'Januari' },
            { value: 2, label: 'Februari' },
            { value: 3, label: 'Maret' },
            { value: 4, label: 'April' },
            { value: 5, label: 'Mei' },
            { value: 6, label: 'Juni' },
            { value: 7, label: 'Juli' },
            { value: 8, label: 'Agustus' },
            { value: 9, label: 'September' },
            { value: 10, label: 'Oktober' },
            { value: 11, label: 'November' },
            { value: 12, label: 'Desember' }
        ]
    }

    useEffect(() => {
        const filterData = () => {
            const filtered = approvedData.reimbursements.filter(item => {
                const approvedTimestamp = item.statusHistory
                    .filter(status => status.actor === uid && status.status.includes('Disetujui'))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
            
                if (!approvedTimestamp) return false // Skip jika tidak ada tanggal disetujui
            
                const itemDate = new Date(approvedTimestamp)
                const matchesMonth = filters.bulan
                    ? itemDate.getMonth() + 1 === filters.bulan.value
                    : true
                const matchesYear = filters.tahun
                    ? itemDate.getFullYear() === filters.tahun.value
                    : true
            
                return matchesMonth && matchesYear
            })            
            setFilteredApprovedData({ reimbursements: filtered })
        }
        filterData()
    }, [filters.bulan, filters.tahun, approvedData])

    const handleFilterChange = (field, selectedOption) => {
        setFilters((prev) => ({
            ...prev,
            [field]: selectedOption
        }))        
    }

    const selectStyles = {
        control: (base) => ({
            ...base,
            display: 'flex', // Menggunakan Flexbox
            alignItems: 'center', // Teks berada di tengah vertikal
            justifyContent: 'space-between', // Menjaga ikon dropdown di kanan
            borderColor: '#e5e7eb',
            fontSize: '12px', // Ukuran teks
            height: '32px', // Tinggi field tetap
            padding: '0 4px', // Padding horizontal
            lineHeight: 'normal', // Pastikan line-height default
            '&:hover': {
                borderColor: '#3b82f6'
            },
            borderRadius: '8px' // Sudut melengkung
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100
        }),
        option: (base) => ({
            ...base,
            fontSize: '12px',
            padding: '6px 12px',
            cursor: 'pointer'
        })
    }

    const FilterSelect = ({ field, label }) => {
        // For year, use the dynamically generated yearOptions
        const options = field === 'tahun' ? yearOptions : filterOptions[field]

        return (
            <Select
                value={filters[field]}
                onChange={(option) => handleFilterChange(field, option)}
                options={options}
                placeholder={label}
                className="w-40"
                styles={selectStyles}
            />
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium">
                Cek <span className="font-bold">Laporan Reimbursement</span>
            </h2>

            {/* Tab Navigation */}
            <div className="flex mb-4 space-x-2 justify-end text-sm">
                <button
                    className={`px-4 py-2 rounded-full ${activeTab === 'pending'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    onClick={() => setActiveTab('pending')}
                >
                    Perlu Ditanggapi
                </button>
                <button
                    className={`px-4 py-2 rounded-full ${activeTab === 'approved'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    onClick={() => setActiveTab('approved')}
                >
                    Riwayat Persetujuan
                </button>
            </div>

            <div>
                {activeTab === 'pending' ? (
                    // Pending Reimbursements Table
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Reimbursement Perlu Ditanggapi</h3>
                        {data.reimbursements.length === 0 ? (
                            <div className="flex justify-center">
                                <figure className="w-44 h-44">
                                    <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                                </figure>
                            </div>
                        ) : (
                            <table className="min-w-full bg-white border rounded-lg text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="px-2 py-2 border text-center w-auto">No.</th>
                                        <th className="px-4 py-2 border">ID</th>
                                        <th className="px-4 py-2 border">Nama</th>
                                        <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                        <th className="px-4 py-2 border">Jumlah</th>
                                        <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                        <th className="p-2 border text-center">Status</th>
                                        <th className="py-2 border text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.reimbursements.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-2 py-2 border text-center w-auto">{index + 1}</td>
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
                                            <td className="px-4 py-2 border">Rp{item.totalBiaya.toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-2 border">{formatDate(item.tanggalPengajuan)}</td>
                                            <td className="px-2 py-2 border text-center">
                                                <span className={`px-4 py-1 rounded-full text-xs font-medium 
                                                    ${item.status === 'Diajukan' ? 'bg-blue-200 text-blue-800 border-[1px] border-blue-600' :
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
                        )}
                    </div>
                ) : (
                    // Approved Reimbursements Table
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-medium mb-4">Riwayat Persetujuan Reimbursement</h3>
                            <div className="flex space-x-2">
                                <FilterSelect field="bulan" label="Bulan" />
                                <FilterSelect field="tahun" label="Tahun" />
                            </div>
                        </div>
                        {filteredApprovedData.reimbursements.length === 0 ? (
                            <div className="flex justify-center">
                                <figure className="w-44 h-44">
                                    <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                                </figure>
                            </div>
                        ) : (
                            <table className="min-w-full bg-white border rounded-lg text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="px-2 py-2 border text-center w-auto">No.</th>
                                        <th className="px-4 py-2 border">ID</th>
                                        <th className="px-4 py-2 border">Nama</th>
                                        <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                        <th className="px-4 py-2 border">Jumlah</th>
                                        <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                        <th className="px-4 py-2 border">Tanggal Disetujui</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApprovedData.reimbursements.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-2 py-2 border text-center w-auto">{index + 1}</td>
                                            <td className="p-4 border">
                                                <Link
                                                    to={`/reimbursement/${item.id}`}
                                                    className="text-black hover:text-gray-700 hover:underline cursor-pointer"
                                                >
                                                    {item.displayId}
                                                </Link>
                                            </td>
                                            <td className="p-4 border">{item.user.nama}</td>
                                            <td className="p-4 border">{item.kategori}</td>
                                            <td className="p-4 border">Rp{item.totalBiaya.toLocaleString('id-ID')}</td>
                                            <td className="p-4 border">{formatDate(item.tanggalPengajuan)}</td>
                                            <td className="p-4 border">
                                                {formatDate(
                                                    item.statusHistory
                                                        .filter(
                                                            status =>
                                                                status.actor === uid && status.status.includes('Disetujui')
                                                        )
                                                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
