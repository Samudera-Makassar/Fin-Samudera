import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useParams } from 'react-router-dom'

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

                // Fetch names for all reviewers in reviewer2 array
                if (Array.isArray(lpjData?.user?.reviewer2) && lpjData.user.reviewer2.length > 0) {
                    const reviewerPromises = lpjData.user.reviewer2.map(async (reviewerUid) => {
                        const reviewerDocRef = doc(db, 'users', reviewerUid)
                        const reviewerSnapshot = await getDoc(reviewerDocRef)
                        return reviewerSnapshot.exists() ? reviewerSnapshot.data().nama : null
                    })

                    const reviewerNames = await Promise.all(reviewerPromises)
                    setReviewers(reviewerNames.filter(Boolean)) // Simpan hanya reviewer yang valid
                }
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
                        <p>Tanggal Pengajuan</p>
                        <p>: {formatDate(lpjDetail?.tanggalPengajuan) ?? 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-16">
                        <p>Kategori LPJ Bon Sementara</p>
                        <p>: {lpjDetail?.kategori ?? 'N/A'}</p>
                        <p>Nomor Bon Sementara</p>
                        <p>: {lpjDetail?.noBs ?? 'N/A'}</p>
                        <p>Jumlah Bon Sementara</p>
                        <p>: Rp{lpjDetail?.jumlahBs.toLocaleString('id-ID') ?? 'N/A'}</p>
                        <p>Status</p>
                        <p>: {lpjDetail?.status ?? 'N/A'}</p>
                        <p>
                            {lpjDetail?.status === 'Ditolak' 
                                ? 'Ditolak Oleh' 
                                : 'Disetujui Oleh'}
                        </p>
                        <p>
                            : {lpjDetail?.status === 'Disetujui' 
                                ? (reviewers.length > 0 ? reviewers.join(', ') : 'N/A') 
                                : lpjDetail?.status === 'Ditolak' 
                                ? (reviewers.length > 0 ? reviewers.join(', ') : 'N/A') 
                                : '-'}
                        </p>
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
                                    <td className="px-4 py-2 border">Rp{item.jumlahBiaya.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="px-4 py-4"></td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5"className="px-4 py-2 text-right border">
                                    Total Biaya :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.totalBiaya?.toLocaleString('id-ID')}
                                </td>
                            </tr>                            
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">
                                    Sisa Lebih Bon Sementara :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.sisaLebih?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">
                                    Sisa Kurang Dibayarkan ke Pegawai :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.sisaKurang?.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end mt-6">
                    <button className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200">
                        Download
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DetailLpj
