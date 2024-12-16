import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig' 
import { useParams } from 'react-router-dom'
import { downloadReimbursementPDF } from '../utils/ReimbursementPdf';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ModalPDF from './ModalPDF'

const DetailRbs = () => {
    const [userData, setUserData] = useState(null)
    const [reimbursementDetail, setReimbursementDetail] = useState(null)
    const [reviewers, setReviewers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { id } = useParams() // Get reimbursement ID from URL params    
    const uid = localStorage.getItem('userUid')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Fetch user data
                const userDocRef = doc(db, 'users', uid)
                const userSnapshot = await getDoc(userDocRef)
                
                if (!userSnapshot.exists()) {
                    throw new Error('User tidak ditemukan')
                }
                
                // Fetch reimbursement data
                const reimbursementDocRef = doc(db, 'reimbursement', id)
                const reimbursementSnapshot = await getDoc(reimbursementDocRef)
                
                if (!reimbursementSnapshot.exists()) {
                    throw new Error('Data reimbursement tidak ditemukan')
                }

                const reimbursementData = reimbursementSnapshot.data()
                setUserData(userSnapshot.data())
                setReimbursementDetail(reimbursementData)
                
                // Fetch names for all reviewers in reviewer1 and reviewer2 arrays
                const fetchReviewerNames = async () => {
                    const reviewerPromises = [];

                    // Tambahkan reviewer1 jika ada
                    if (Array.isArray(reimbursementData?.user?.reviewer1)) {
                        reviewerPromises.push(
                            ...reimbursementData.user.reviewer1.map(async (reviewerUid) => {
                                try {
                                    const reviewerDocRef = doc(db, 'users', reviewerUid)
                                    const reviewerSnapshot = await getDoc(reviewerDocRef)
                                    return reviewerSnapshot.exists() ? reviewerSnapshot.data().nama : null
                                } catch (error) {
                                    console.error('Error fetching Reviewer 1:', error)
                                    return null
                                }
                            })
                        )
                    }

                    // Tambahkan reviewer2 jika ada
                    if (Array.isArray(reimbursementData?.user?.reviewer2)) {
                        reviewerPromises.push(
                            ...reimbursementData.user.reviewer2.map(async (reviewerUid) => {
                                try {
                                    const reviewerDocRef = doc(db, 'users', reviewerUid)
                                    const reviewerSnapshot = await getDoc(reviewerDocRef)
                                    return reviewerSnapshot.exists() ? reviewerSnapshot.data().nama : null
                                } catch (error) {
                                    console.error('Error fetching Reviewer 2:', error)
                                    return null
                                }
                            })
                        )
                    }

                    const reviewerNames = await Promise.all(reviewerPromises)
                    const validReviewerNames = reviewerNames.filter(name => name !== null)
                    setReviewers(validReviewerNames)
                }

                // Panggil fungsi fetch reviewer names
                await fetchReviewerNames()
            } catch (error) {
                console.error("Error fetching data:", error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        if (uid && id) {
            fetchData()
        }
    }, [uid, id]) // Dependencies array to prevent infinite loop

    // Fungsi untuk mendapatkan status approval dengan nama reviewer
    const getDetailedApprovalStatus = (reimbursement, reviewerNames) => {
        if (!reimbursement || !reimbursement.statusHistory || reimbursement.statusHistory.length === 0) {
            return '-'
        }

        const lastStatus = reimbursement.statusHistory[reimbursement.statusHistory.length - 1]

        // Untuk status Ditolak
        if (reimbursement.status === 'Ditolak') {
            // Jika ditolak oleh Super Admin
            if (lastStatus.status.includes('Super Admin')) {
                // Super Admin menggantikan Reviewer 1
                if (lastStatus.status.includes('Reviewer 1')) {
                    return 'Super Admin'
                } 
                // Super Admin menggantikan Reviewer 2
                else {
                    return 'Super Admin'
                }
            } 
            // Ditolak oleh Reviewer 1
            else if (lastStatus.status.includes('Reviewer 1')) {
                return `${reviewerNames[0] || 'N/A'}`
            } 
            // Ditolak oleh Reviewer 2
            else if (lastStatus.status.includes('Reviewer 2')) {
                return `${reviewerNames[1] || 'N/A'}`
            }
        } 
        
        // Untuk status Diproses
        else if (reimbursement.status === 'Diproses') {
            // Jika disetujui oleh Super Admin
            if (lastStatus.status.includes('Super Admin')) {
                // Super Admin menggantikan Reviewer 1
                return 'Super Admin'
            } 
            // Disetujui oleh Reviewer 1
            else if (lastStatus.status.includes('Reviewer 1')) {
                return `${reviewerNames[0] || 'N/A'}`
            }
        }

        // Untuk status Disetujui
        else if (reimbursement.status === 'Disetujui') {
            // Jika disetujui oleh Super Admin
            if (lastStatus.status.includes('Super Admin')) {
                // Super Admin menggantikan Reviewer 2
                return 'Super Admin'
            } 
            // Disetujui oleh Reviewer 2
            else if (lastStatus.status.includes('Reviewer 2')) {
                return `${reviewerNames[1] || 'N/A'}`
            }
        }

        return '-'
    }

    const [previewUrl, setPreviewUrl] = useState(null)

    const handleViewAttachment = (lampiranUrl) => {
        if (lampiranUrl) {
            setPreviewUrl(lampiranUrl) // Set URL untuk preview
        } else {
            toast.error('Lampiran tidak tersedia')
        }
    }

    const closePreview = () => {
        setPreviewUrl(null) // Reset URL untuk menutup preview
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

    const getColumns = (kategori) => {
        const baseColumns = [
            { header: 'No.', key: 'no' },
            { header: 'Jenis Reimbursement', key: 'jenis' },
            { header: 'Tanggal Aktivitas', key: 'tanggal' }
        ]

        const categoryColumns = {
            bbm: [
                { header: 'Lokasi Pertamina', key: 'lokasi' },
                { header: 'Plat Nomor', key: 'plat' }
            ],
            medical: [
                { header: 'Nama Dokter', key: 'dokter' },
                { header: 'Nama Klinik/Rumah Sakit', key: 'klinik' }
            ],
            operasional: [
                { header: 'Kebutuhan', key: 'kebutuhan' },
                { header: 'Keterangan', key: 'keterangan' }
            ],
            'ga/umum': [
                { header: 'Kebutuhan', key: 'kebutuhan' },
                { header: 'Keterangan', key: 'keterangan' }
            ],            
            default: []
        }

        const additionalColumns = categoryColumns[kategori?.toLowerCase()] || categoryColumns.default
        return [...baseColumns, ...additionalColumns, { header: 'Biaya', key: 'biaya' }]
    }
    
    // Render cell berdasarkan key
    const renderCell = (item, column, index) => {
        switch (column.key) {
            case 'no':
                return index + 1
            case 'tanggal':
                return formatDate(item[column.key])
            case 'biaya':
                return item[column.key]?.toLocaleString('id-ID') || 'N/A'
            default:
                return item[column.key] || 'N/A'
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }
    
    const columns = getColumns(reimbursementDetail?.kategori)

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Detail <span className="font-bold">Reimbursement</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-x-16 mb-6 font-medium">
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>ID</p>
                        <p>: {reimbursementDetail?.displayId ?? 'N/A'}</p>
                        <p>Nama Lengkap</p>
                        <p>: {reimbursementDetail?.user?.nama ?? 'N/A'}</p>
                        <p>Department</p>
                        <p>
                            :{' '}
                            {Array.isArray(reimbursementDetail?.user?.department) &&
                            reimbursementDetail.user.department.length > 0
                                ? reimbursementDetail.user.department.join(', ')
                                : ''}
                        </p>
                        <p>Unit Bisnis</p>
                        <p>: {reimbursementDetail?.user?.unit ?? 'N/A'}</p>
                        <p>Tanggal Pengajuan</p>
                        <p>: {formatDate(reimbursementDetail?.tanggalPengajuan) ?? 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>Kategori Reimbursement</p>
                        <p>: {reimbursementDetail?.kategori ?? 'N/A'}</p>
                        <p>Nomor Rekening</p>
                        <p>: {reimbursementDetail?.user?.accountNumber ?? 'N/A'}</p>
                        <p>Nama Bank</p>
                        <p>: {reimbursementDetail?.user?.bankName ?? 'N/A'}</p>
                        <p>Status</p>
                        <p>: {reimbursementDetail?.status ?? 'N/A'}</p>
                        <p>{reimbursementDetail?.status === 'Ditolak' ? 'Ditolak Oleh' : 'Disetujui Oleh'}</p>
                        <p>: {getDetailedApprovalStatus(reimbursementDetail, reviewers)}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                {columns.map((column) => (
                                    <th key={column.key} className="px-4 py-2 border">
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reimbursementDetail?.reimbursements?.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-4 py-2 border">
                                            {renderCell(item, column, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-4"></td>
                            </tr>

                            {reimbursementDetail?.status === 'Dibatalkan' && (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-2 text-left border">
                                        <span className="font-semibold">Alasan Pembatalan :</span>{' '}
                                        {reimbursementDetail?.cancelReason}
                                    </td>
                                </tr>
                            )}

                            <tr className="font-semibold">
                                <td colSpan={columns.length - 1} className="px-4 py-2 text-right border">
                                    Total Biaya :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{reimbursementDetail?.totalBiaya?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end mt-6 space-x-2">
                    {/* Tombol untuk melihat lampiran */}
                    <button
                        className={`px-12 py-3 rounded ${
                            userData?.uid === reimbursementDetail?.user.uid
                            ? 'text-red-600 bg-transparent hover:text-red-800 border border-red-600 hover:border-red-800'
                            : 'text-white bg-red-600 hover:bg-red-700 hover:text-gray-200'
                        }`}
                        onClick={() => handleViewAttachment(reimbursementDetail?.lampiranUrl)}
                    >
                        Lihat Lampiran
                    </button>

                    {/* Hanya tampilkan tombol Download jika user adalah pembuat reimbursement */}
                    {userData?.uid === reimbursementDetail?.user.uid && (
                        <button
                            className={`px-16 py-3 rounded text-white ${
                                reimbursementDetail?.status === 'Disetujui'
                                    ? 'bg-red-600 hover:bg-red-700 hover:text-gray-200'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            onClick={() => downloadReimbursementPDF(reimbursementDetail)}
                            disabled={reimbursementDetail?.status !== 'Disetujui'}
                        >
                            Download
                        </button>
                    )}
                </div>
            </div>

            <ModalPDF
                showModal={!!previewUrl}
                previewUrl={previewUrl}
                onClose={closePreview}
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

export default DetailRbs