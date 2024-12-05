import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import EmptyState from '../assets/images/EmptyState.png'

const CreateBsTable = ({ onCancel }) => {
    const [data, setData] = useState({ bonSementara: [] })
    const [userData, setUserData] = useState(null) // State untuk menyimpan data user
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5 // Jumlah item per halaman

    useEffect(() => {
        const fetchUserAndBonSementara = async () => {
            try {
                const uid = localStorage.getItem('userUid') // Ambil UID dari localStorage

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    setLoading(false)
                    return
                }

                // Fetch data user berdasarkan UID
                const userDocRef = doc(db, 'users', uid)
                const userDoc = await getDoc(userDocRef)

                // Query reimbursement berdasarkan UID user
                const q = query(
                    collection(db, 'bonSementara'),
                    where('user.uid', '==', uid) // Filter data reimbursement berdasarkan UID user
                )

                const querySnapshot = await getDocs(q)
                const bonSementara = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    displayId: doc.data().displayId,
                    ...doc.data()
                }))

                setData({ bonSementara })
            } catch (error) {
                console.error('Error fetching user or bon sementara data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndBonSementara()
    }, [])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A' // Handle null/undefined
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date)
    }

    // Menghitung total halaman
    const totalPages = Math.ceil(data.bonSementara.length / itemsPerPage)

    // Mendapatkan data pengguna untuk halaman saat ini
    const currentBonSementara = data.bonSementara.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    // currentBonSementara.forEach((item, index) => console.log(item.bonSementara[0].jumlahBS))
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

    if (loading) {
        return <p>Loading...</p>
    }

    return (
        <div>
            {data.bonSementara.length === 0 ? (
                // Jika belum ada data bon sementara
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Bon Sementara Diajukan</h3>
                    <div className="flex justify-center">
                        <figure className="w-44 h-44">
                            <img src={EmptyState} alt="bon sementara icon" className="w-full h-full object-contain" />
                        </figure>
                    </div>
                </div>
            ) : (
                // Jika ada data bon sementara
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Bon Sementara Diajukan</h3>
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-2 py-2 border text-center w-auto">No.</th>
                                <th className="px-4 py-2 border">Nomor BS</th>
                                <th className="px-4 py-2 border">Kategori BS</th>
                                <th className="px-4 py-2 border">Jumlah BS</th>
                                <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                <th className="py-2 border text-center">Status</th>
                                <th className="py-2 border text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBonSementara.map((item, index) => (
                                
                                <tr key={index}>
                                    <td className="px-2 py-2 border text-center w-auto">
                                        {index + 1 + (currentPage - 1) * itemsPerPage}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <Link
                                            to={`/create-bs/${item.id}`}
                                            className="text-black hover:text-gray-700 hover:underline cursor-pointer"
                                        >
                                            {item.displayId}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2 border">{item.bonSementara[0].kategori}</td>
                                    <td className="px-4 py-2 border">{item.bonSementara[0].jumlahBS}</td>
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
                                    <button 
                                            className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed hover"
                                            onClick={() => onCancel(item)} 
                                            disabled={item.status !== 'Diajukan'}
                                        >
                                            Batalkan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-xs">
                        {/* Tombol Previous */}
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 p-2 rounded-full ${
                                currentPage === 1
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'border border-red-600 text-red-600 hover:bg-red-100'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>

                        {/* Tombol Halaman */}
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-full ${
                                    currentPage === page
                                        ? 'bg-red-600 text-white'
                                        : 'border border-red-600 text-red-600 hover:bg-red-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Tombol Next */}
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-2 py-2 rounded-full ${
                                currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'border border-red-600 text-red-600 hover:bg-red-100'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateBsTable
