import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useParams, useNavigate } from 'react-router-dom'

const DetailCreateBs = () => {
    const [userData, setUserData] = useState(null)
    const [bonSementaraDetail, setBonSementaraDetail] = useState(null)
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

                setUserData(userSnapshot.data())
                setBonSementaraDetail(bonSementaraSnapshot.data())
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
        if (bonSementaraDetail?.bonSementara?.[0]?.kategori === 'GA/Umum') {
            navigate('/lpj/umum')
        } else if (bonSementaraDetail?.bonSementara?.[0]?.kategori === 'Marketing/Operasional') {
            navigate('/lpj/marketing')
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
                        <p>Disetujui Oleh</p>
                        <p>: {bonSementaraDetail?.reviewer1?.[0] ?? ''}</p>
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
                                    <td className="px-4 py-2 border">{item.jumlahBS}</td>
                                    <td className="px-4 py-2 border">
                                        {formatDate(bonSementaraDetail.tanggalPengajuan) ?? 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleBuatLaporan}
                        className="px-12 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                    >
                        Buat Laporan
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DetailCreateBs
