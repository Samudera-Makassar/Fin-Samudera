import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useParams } from 'react-router-dom'
import { downloadLpjPDF } from '../utils/LpjPdf';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ModalPDF from './ModalPDF'

const DetailLpj = () => {
    const [userData, setUserData] = useState(null)
    const [lpjDetail, setLpjDetail] = useState(null)
    const [reviewers, setReviewers] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { id } = useParams() // Get lpj ID from URL params    
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

                // Fetch lpj data
                const lpjDocRef = doc(db, 'lpj', id)
                const lpjSnapshot = await getDoc(lpjDocRef)

                if (!lpjSnapshot.exists()) {
                    throw new Error('Data LPJ Bon Sementara tidak ditemukan')
                }

                const lpjData = lpjSnapshot.data()
                setUserData(userSnapshot.data())
                setLpjDetail(lpjData)

                // Fetch names for all reviewers in reviewer1 and reviewer2 arrays
                const fetchReviewerNames = async () => {
                    const reviewerPromises = [];

                    // Tambahkan reviewer1 jika ada
                    if (Array.isArray(lpjData?.user?.reviewer1)) {
                        reviewerPromises.push(
                            ...lpjData.user.reviewer1.map(async (reviewerUid) => {
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
                    if (Array.isArray(lpjData?.user?.reviewer2)) {
                        reviewerPromises.push(
                            ...lpjData.user.reviewer2.map(async (reviewerUid) => {
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
    const getDetailedApprovalStatus = (lpj, reviewerNames) => {
        if (!lpj || !lpj.statusHistory || lpj.statusHistory.length === 0) {
            return '-'
        }

        const lastStatus = lpj.statusHistory[lpj.statusHistory.length - 1]

        // Untuk status Ditolak
        if (lpj.status === 'Ditolak') {
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
        else if (lpj.status === 'Diproses') {
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
        else if (lpj.status === 'Disetujui') {
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

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Detail <span className="font-bold">LPJ Bon Sementara</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-x-16 mb-6 font-medium">
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>ID</p>
                        <p>: {lpjDetail?.displayId ?? 'N/A'}</p>
                        <p>Nama Lengkap</p>
                        <p>: {lpjDetail?.user?.nama ?? 'N/A'}</p>
                        <p>Department</p>
                        <p>: {Array.isArray(lpjDetail?.user?.department) && lpjDetail.user.department.length > 0 ? lpjDetail.user.department.join(', ') : ''}</p>
                        <p>Unit Bisnis</p>
                        <p>: {lpjDetail?.user?.unit ?? 'N/A'}</p>
                        {lpjDetail?.kategori?.toLowerCase() === "marketing/operasional" && (
                            <>
                                <p>Project</p>
                                <p>: {lpjDetail?.project ?? 'N/A'}</p>
                                <p>Customer</p>
                                <p>: {lpjDetail?.customer ?? 'N/A'}</p>
                            </>
                        )}
                        <p>Tanggal Pengajuan</p>
                        <p>: {formatDate(lpjDetail?.tanggalPengajuan) ?? 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>Kategori LPJ Bon Sementara</p>
                        <p>: {lpjDetail?.kategori ?? 'N/A'}</p>
                        <p>Nomor Bon Sementara</p>
                        <p>: {lpjDetail?.nomorBS ?? 'N/A'}</p>
                        <p>Jumlah Bon Sementara</p>
                        <p>: Rp{lpjDetail?.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</p>
                        {lpjDetail?.kategori?.toLowerCase() === "marketing/operasional" && (
                            <>
                                <p>Nomor Job Order</p>
                                <p>: {lpjDetail?.nomorJO ?? 'N/A'}</p>
                                <p>Lokasi</p>
                                <p>: {lpjDetail?.lokasi ?? 'N/A'}</p>
                            </>
                        )}
                        <p>Status</p>
                        <p>: {lpjDetail?.status ?? 'N/A'}</p>
                        <p>
                            {lpjDetail?.status === 'Ditolak' 
                                ? 'Ditolak Oleh' 
                                : 'Disetujui Oleh'}
                        </p>
                        <p>: {getDetailedApprovalStatus(lpjDetail, reviewers)}</p>
                    </div>
                </div>

                <div className="mb-8">
                <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border">No.</th>
                                <th className="px-4 py-2 border">Item</th>
                                <th className="px-4 py-2 border">Tanggal Kegiatan</th>
                                <th className="px-4 py-2 border">Biaya</th>
                                <th className="px-4 py-2 border">Jumlah</th>
                                <th className="px-4 py-2 border">Keterangan</th>
                                <th className="px-4 py-2 border">Jumlah Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lpjDetail?.lpj?.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{index + 1}</td>
                                    <td className="px-4 py-2 border">{item.namaItem}</td>
                                    <td className="px-4 py-2 border">{formatDate(item.tanggal)}</td>
                                    <td className="px-4 py-2 border">Rp{item.biaya.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-2 border">{item.jumlah}</td>
                                    <td className="px-4 py-2 border">{item.keterangan ?? '-'}</td>
                                    <td className="px-4 py-2 border">Rp{item.jumlahBiaya.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="7" className="px-4 py-4"></td>
                            </tr>

                            {lpjDetail?.status === 'Dibatalkan' && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-2 text-left border">
                                        <span className='font-semibold'>Alasan Pembatalan :</span> {lpjDetail?.cancelReason}
                                    </td>
                                </tr>
                            )}

                            <tr className="font-semibold">
                                <td colSpan="6"className="px-4 py-2 text-right border">
                                    Total Biaya :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.totalBiaya?.toLocaleString('id-ID')}
                                </td>
                            </tr>                            
                            <tr className="font-semibold">
                                <td colSpan="6" className="px-4 py-2 text-right border">
                                    Sisa Lebih Bon Sementara :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.sisaLebih?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="6" className="px-4 py-2 text-right border">
                                    Sisa Kurang Dibayarkan ke Pegawai :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.sisaKurang?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end mt-6 space-x-2">
                    {/* Tombol untuk melihat lampiran */}
                    <button
                        className={`px-12 py-3 rounded ${
                            userData?.uid === lpjDetail?.user.uid
                            ? 'text-red-600 bg-transparent hover:text-red-800 border border-red-600 hover:border-red-800'
                            : 'text-white bg-red-600 hover:bg-red-700 hover:text-gray-200'
                        }`}
                        onClick={() => handleViewAttachment(lpjDetail?.lampiranUrl)}
                    >
                        Lihat Lampiran
                    </button>

                    {/* Hanya tampilkan tombol Download jika user adalah pembuat lpj */}
                    {userData?.uid === lpjDetail?.user.uid && (
                        <button
                            className={`px-16 py-3 rounded text-white ${
                                lpjDetail?.status === 'Disetujui'
                                    ? 'bg-red-600 hover:bg-red-700 hover:text-gray-200'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            onClick={() => downloadLpjPDF(lpjDetail)}
                            disabled={lpjDetail?.status !== 'Disetujui'}
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

export default DetailLpj
