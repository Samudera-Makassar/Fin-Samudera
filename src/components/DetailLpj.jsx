import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig' 
import { useParams } from 'react-router-dom'
import LpjUmum from '../pages/LpjUmum'
import LpjMarketing from '../pages/LpjMarketing'

const DetailLpj = () => {
    const [userData, setUserData] = useState(null)
    const [lpjDetail, setLpjDetail] = useState(null)
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
                    throw new Error('Data LPJ tidak ditemukan')
                }

                setUserData(userSnapshot.data())
                setLpjDetail(lpjSnapshot.data())
                
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
        }).format(date);
    }

    const getColumns = (kategori) => {
        const baseColumns = [
            { header: 'No.', key: 'no' },
            { header: 'Tanggal Aktivitas', key: 'tanggal' },
            { header: 'Item', key: 'namaItem' },
        ]

        const categoryColumns = {
            umum: [
                { header: 'Biaya', key: 'biaya' },
                { header: 'Jumlah', key: 'jumlah' }
            ],
            marketing: [
                { header: 'Biaya', key: 'biaya' },
                { header: 'Jumlah', key: 'jumlah' }
            ],           
            default: []
        }

        const additionalColumns = categoryColumns[kategori?.toLowerCase()] || categoryColumns.default
        return [...baseColumns, ...additionalColumns, { header: 'Jumlah Biaya', key: 'jumlahBiaya' }]
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

    if (!userData) {
        return <div>Loading...</div>
    }
    
    const columns = getColumns(lpjDetail?.kategori)

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
                        <p>Kategori lpj</p>
                        <p>: {lpjDetail?.kategori ?? 'N/A'}</p>
                        <p>Nomor Rekening</p>
                        <p>: {lpjDetail?.user?.accountNumber ?? 'N/A'}</p>
                        <p>Nama Bank</p>
                        <p>: {lpjDetail?.user?.bankName ?? 'N/A'}</p>
                        <p>Status</p>
                        <p>: {lpjDetail?.status ?? 'N/A'}</p>
                        <p>Disetujui Oleh</p>
                        <p>: {lpjDetail?.reviewer1?.[0] ?? ''}</p>
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
                            {lpjDetail?.lpj?.map((item, index) => (
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
                            <tr className="font-semibold">
                                <td colSpan={columns.length - 1} className="px-4 py-2 text-right border">
                                    Total Biaya :
                                </td>
                                <td className="px-4 py-2 border">
                                    Rp{lpjDetail?.totalBiaya?.toLocaleString('id-ID')}
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
