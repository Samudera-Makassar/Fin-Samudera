import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useParams, useNavigate } from 'react-router-dom'

const DetailCreateBs = () => {
    const [userData, setUserData] = useState(null)
    const [bonSementaraDetail, setBonSementaraDetail] = useState(null)
    const [reviewers, setReviewers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { id } = useParams() 
    const navigate = useNavigate() 
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
                const bonSementaraDocRef = doc(db, 'bonSementara', id)
                const bonSementaraSnapshot = await getDoc(bonSementaraDocRef)

                if (!bonSementaraSnapshot.exists()) {
                    throw new Error('Data Bon Sementara tidak ditemukan')
                }

                const bonSementaraData = bonSementaraSnapshot.data()
                setUserData(userSnapshot.data())
                setBonSementaraDetail(bonSementaraData)

                // Fetch names for all reviewers in reviewer1 and reviewer2 arrays
                const fetchReviewerNames = async () => {
                    const reviewerPromises = [];

                    // Tambahkan reviewer1 jika ada
                    if (Array.isArray(bonSementaraData?.user?.reviewer1)) {
                        reviewerPromises.push(
                            ...bonSementaraData.user.reviewer1.map(async (reviewerUid) => {
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
                    if (Array.isArray(bonSementaraData?.user?.reviewer2)) {
                        reviewerPromises.push(
                            ...bonSementaraData.user.reviewer2.map(async (reviewerUid) => {
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
                console.error('Error fetching data:', error)
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
    const getDetailedApprovalStatus = (bonSementara, reviewerNames) => {
        if (!bonSementara || !bonSementara.statusHistory || bonSementara.statusHistory.length === 0) {
            return '-'
        }

        const lastStatus = bonSementara.statusHistory[bonSementara.statusHistory.length - 1]

        // Untuk status Ditolak
        if (bonSementara.status === 'Ditolak') {
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
        else if (bonSementara.status === 'Diproses') {
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
        else if (bonSementara.status === 'Disetujui') {
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
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A' // Handle null/undefined
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date)
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
    

    if (!userData) {
        return <div>Loading...</div>
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
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={bonSementaraDetail?.status !== 'Disetujui'}
                        >
                            Download
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DetailCreateBs
