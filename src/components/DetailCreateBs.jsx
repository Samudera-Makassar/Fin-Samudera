import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useParams, useNavigate } from 'react-router-dom'
import { generateBsPDF } from '../utils/BsPdf'
import ModalPDF from './ModalPDF'
import { toast, ToastContainer } from 'react-toastify'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const DetailCreateBs = () => {
    const [userData, setUserData] = useState(null)
    const [bonSementaraDetail, setBonSementaraDetail] = useState(null)
    const [reviewers, setReviewers] = useState([])    
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const { id } = useParams() 
    const navigate = useNavigate() 
    const uid = localStorage.getItem('userUid')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)

                // Fetch user data
                const userDocRef = doc(db, 'users', uid)
                const userSnapshot = await getDoc(userDocRef)

                if (!userSnapshot.exists()) {
                    throw new Error('User tidak ditemukan')
                }

                // Fetch lpj data
                const bonSementaraDocRef = doc(db, 'bonSementara', id)
                const bonSementaraSnapshot = await getDoc(bonSementaraDocRef)

                if (!bonSementaraSnapshot.exists()) {
                    throw new Error('Data Bon Sementara tidak ditemukan')
                }

                const bonSementaraData = bonSementaraSnapshot.data()
                setUserData(userSnapshot.data())
                setBonSementaraDetail(bonSementaraData)

                // Helper function to fetch names of reviewers
                const fetchReviewerNames = async (reviewerArray) => {
                    if (!Array.isArray(reviewerArray)) return []
                    const promises = reviewerArray.map(async (reviewerUid) => {
                        try {
                            const reviewerDocRef = doc(db, 'users', reviewerUid)
                            const reviewerSnapshot = await getDoc(reviewerDocRef)
                            return reviewerSnapshot.exists() ? reviewerSnapshot.data().nama : null
                        } catch (error) {
                            console.error(`Error fetching reviewer (${reviewerUid}):`, error)
                            return null
                        }
                    })
                    return Promise.all(promises)
                }
    
                // Fetch names for all reviewers in reviewer1 and reviewer2
                const [reviewer1Names, reviewer2Names] = await Promise.all([
                    fetchReviewerNames(bonSementaraData?.user?.reviewer1),
                    fetchReviewerNames(bonSementaraData?.user?.reviewer2),
                ])
    
                // Combine reviewer names and filter out null values
                const validReviewerNames = [...reviewer1Names, ...reviewer2Names].filter(name => name !== null)
                setReviewers(validReviewerNames)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError(error.message)
            } finally {
                setIsLoading(false)
            }
        }

        if (uid && id) {
            fetchData()
        }
    }, [uid, id]) // Dependencies array to prevent infinite loop

    // Fungsi untuk mendapatkan status approval dengan nama reviewer
    const getDetailedApprovalStatus = (bonSementara, reviewerNames) => {
        if (!bonSementara || !bonSementara.statusHistory || bonSementara.statusHistory.length === 0) {
            return '-'
        }
    
        const lastStatus = bonSementara.statusHistory[bonSementara.statusHistory.length - 1]
        const { status, actor } = lastStatus
    
        // Helper function to determine approver
        const determineApprover = (reviewerArray, roleIndexStart) => {
            // Cari index reviewer di array reviewerNames berdasarkan UID actor
            const reviewerIndex = reviewerArray.findIndex(uid => uid === actor)
            if (reviewerIndex !== -1) {
                return reviewerNames[roleIndexStart + reviewerIndex] || 'N/A'
            }
            return '-'
        }
    
        // Periksa Reviewer 1 dan Reviewer 2
        const reviewer1Array = bonSementara?.user?.reviewer1 || []
        const reviewer2Array = bonSementara?.user?.reviewer2 || []
    
        switch (bonSementara.status) {
            case 'Ditolak': {
                if (status.includes('Super Admin')) {
                    return 'Super Admin'
                }
                if (status.includes('Reviewer 1')) {
                    return determineApprover(reviewer1Array, 0)
                }
                if (status.includes('Reviewer 2')) {
                    return determineApprover(reviewer2Array, reviewer1Array.length)
                }
                break
            }
    
            case 'Diproses': {
                if (status.includes('Super Admin')) {
                    return 'Super Admin'
                }
                if (status.includes('Reviewer 1')) {
                    return determineApprover(reviewer1Array, 0)
                }
                break
            }
    
            case 'Disetujui': {
                if (status.includes('Super Admin')) {
                    return 'Super Admin'
                }
                if (status.includes('Reviewer 2')) {
                    return determineApprover(reviewer2Array, reviewer1Array.length)
                }
                break
            }
    
            default:
                return '-'
        }
    
        return '-'
    }
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A' // Handle null/undefined
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date)
    }

    const [modalPdfUrl, setModalPdfUrl] = useState(null) 
    const [modalTitle, setModalTitle] = useState('') 

    const closePreview = () => {
        setModalPdfUrl(null) // Reset URL untuk menutup preview
        setModalTitle ('') 
    }

    const handleGenerateAndPreviewPDF = async () => {
        setIsLoading(true)
        try {
            setIsLoading(true)
            const url = await generateBsPDF(bonSementaraDetail)

            if (url) {
                setModalPdfUrl(url)
                setModalTitle(`Preview ${bonSementaraDetail.displayId}`)
            }
        } catch (error) {
            toast.error('Gagal menghasilkan PDF')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBuatLaporan = () => {
        const bonSementara = bonSementaraDetail?.bonSementara?.[0]
        if (bonSementara?.kategori === 'GA/Umum') {
            navigate('/lpj/umum', {
                state: {
                    nomorBS: bonSementara.nomorBS,
                    jumlahBS: bonSementara.jumlahBS,
                    aktivitas: bonSementara.aktivitas,
                },
            })
        } else if (bonSementara?.kategori === 'Marketing/Operasional') {
            navigate('/lpj/marketing', {
                state: {
                    nomorBS: bonSementara.nomorBS,
                    jumlahBS: bonSementara.jumlahBS,
                    aktivitas: bonSementara.aktivitas,
                },
            })
        } else {
            alert('Kategori tidak dikenali.')
        }
    }    

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <h2 className="text-xl font-medium mb-4">
                    Detail <span className="font-bold">Pengajuan Bon Sementara</span>
                </h2>
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    {/* User Details Skeleton */}
                    <div className="grid grid-cols-2 gap-x-16 mb-6 font-medium">
                        <div className="grid grid-cols-[auto_1fr] gap-x-16">
                            {[...Array(4)].map((_, index) => (
                                <React.Fragment key={index}>
                                    <Skeleton width={100} height={20} />
                                    <Skeleton width={200} height={20} />
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-16">
                            {[...Array(4)].map((_, index) => (
                                <React.Fragment key={index}>
                                    <Skeleton width={100} height={20} />
                                    <Skeleton width={200} height={20} />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="mb-8">
                        <div className="min-w-full bg-white border rounded-lg text-sm">
                            <div className="bg-gray-100 grid grid-cols-5">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="p-1">
                                        <Skeleton height={25} />
                                    </div>
                                ))}
                            </div>

                            {[...Array(2)].map((_, index) => (
                                <div key={index} className="grid grid-cols-5 border-b">
                                    {[...Array(5)].map((_, colIndex) => (
                                        <div key={colIndex} className="p-1">
                                            <Skeleton height={25} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex justify-end mt-4 space-x-1">
                        <Skeleton width={170} height={45} />
                        <Skeleton width={170} height={45} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Detail <span className="font-bold">Pengajuan Bon Sementara</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-x-16 mb-6 font-medium">
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>Nama Lengkap</p>
                        <p>: {bonSementaraDetail?.user?.nama ?? 'N/A'}</p>
                        <p>Department</p>
                        <p>
                            :{' '}
                            {Array.isArray(bonSementaraDetail?.user?.department) &&
                            bonSementaraDetail.user.department.length > 0
                                ? bonSementaraDetail.user.department.join(', ')
                                : ''}
                        </p>
                        <p>Unit Bisnis</p>
                        <p>: {bonSementaraDetail?.user?.unit ?? 'N/A'}</p>
                        <p>Posisi</p>
                        <p>: {bonSementaraDetail?.user?.posisi ?? 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>Nama Bank</p>
                        <p>: {bonSementaraDetail?.user?.bankName ?? 'N/A'}</p>
                        <p>Nomor Rekening</p>
                        <p>: {bonSementaraDetail?.user?.accountNumber ?? 'N/A'}</p>
                        <p>Status</p>
                        <p>: {bonSementaraDetail?.status ?? 'N/A'}</p>
                        <p>{bonSementaraDetail?.status === 'Ditolak' ? 'Ditolak Oleh' : 'Disetujui Oleh'}</p>
                        <p>: {getDetailedApprovalStatus(bonSementaraDetail, reviewers)}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="min-w-full bg-white border rounded-lg text-sm table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border w-auto">Nomor BS</th>
                                <th className="px-4 py-2 border w-auto">Kategori</th>
                                <th className="px-4 py-2 border w-auto">Aktivitas</th>
                                <th className="px-4 py-2 border w-auto">Jumlah BS</th>
                                <th className="px-4 py-2 border w-auto">Tanggal Pengajuan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bonSementaraDetail?.bonSementara?.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{item.nomorBS}</td>
                                    <td className="px-4 py-2 border">{item.kategori}</td>
                                    <td className="px-4 py-2 border">{item.aktivitas}</td>
                                    <td className="px-4 py-2 border">Rp{item.jumlahBS.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-2 border">
                                        {formatDate(bonSementaraDetail.tanggalPengajuan) ?? 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="px-4 py-4"></td>
                            </tr>

                            {bonSementaraDetail?.status === 'Dibatalkan' && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-2 text-left border">
                                        <span className="font-semibold">Alasan Pembatalan :</span>{' '}
                                        {bonSementaraDetail?.cancelReason}
                                    </td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>

                {/* Tombol Buat Laporan dan Download hanya  tampil jika user adalah pembuat nomor bs */}
                <div className="flex justify-end mt-6 space-x-2">
                    {userData?.uid === bonSementaraDetail?.user.uid && (
                        <button
                            onClick={handleBuatLaporan}
                            className={`px-12 py-3 rounded ${
                                bonSementaraDetail?.status === 'Disetujui'
                                    ? 'text-red-600 bg-transparent hover:text-red-800 border border-red-600 hover:border-red-800'
                                    : 'text-white bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={bonSementaraDetail?.status !== 'Disetujui'}
                        >
                            Buat Laporan
                        </button>
                    )}

                    {userData?.uid === bonSementaraDetail?.user.uid && (
                        <button
                            className={`px-16 py-3 rounded text-white ${
                                bonSementaraDetail?.status === 'Disetujui'
                                    ? 'bg-red-600 hover:bg-red-700 hover:text-gray-200'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={handleGenerateAndPreviewPDF}
                            disabled={bonSementaraDetail?.status !== 'Disetujui' || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
                                    Loading..
                                </>
                            ) : (
                                'Print'
                            )}
                        </button>
                    )}
                </div>
            </div>

            <ModalPDF 
                showModal={!!modalPdfUrl} 
                previewUrl={modalPdfUrl} 
                onClose={closePreview} 
                title={modalTitle} 
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

export default DetailCreateBs
