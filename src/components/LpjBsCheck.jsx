import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig' 
import EmptyState from '../assets/images/EmptyState.png'

const LpjBsCheck = ({ onApprove, onReject }) => {
    const [data, setData] = useState({ lpj: [] })

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5 // Jumlah item per halaman

    useEffect(() => {
        const fetchUserAndLpjs = async () => {
            try {
                const uid = localStorage.getItem('userUid') // Ambil UID dari localStorage

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')                    
                    return
                }

                // Fetch data user berdasarkan UID
                const userDocRef = doc(db, 'users', uid)
                const userDoc = await getDoc(userDocRef)               

                // Query lpj berdasarkan UID user
                const q = query(
                    collection(db, 'lpj'),
                    where('status', '==', 'Diproses'),
                    where('user.reviewer1', 'array-contains', uid) || where('user.reviewer2', 'array-contains', uid) // Filter data lpj berdasarkan UID reviewer
                )

                const querySnapshot = await getDocs(q)
                const lpj = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    displayId: doc.data().displayId,
                    ...doc.data(),
                }))

                setData({ lpj })
            } catch (error) {
                console.error('Error fetching user or lpj data:', error)
            }
        }

        fetchUserAndLpjs()
    }, [])

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A' // Handle null/undefined
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
    }

    // Menghitung total halaman
    const totalPages = Math.ceil(data.lpj.length / itemsPerPage)

    // Mendapatkan data pengguna untuk halaman saat ini
    const currentLpj = data.lpj.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Cek <span className="font-bold">Laporan Bon Sementara</span>
            </h2>
        
            <div>
                {data.lpj.length === 0 ? (
                    // Jika belum ada data LPJ BS 
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Laporan Menunggu Review/Approve</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="lpj icon" className="w-full h-full object-contain" />
                            </figure>
                        </div>
                    </div>
                ) : (
                    // Jika ada data LPJ BS
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Laporan Menunggu Review/Approve</h3>
                        <table className="min-w-full bg-white border rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                <th className="px-2 py-2 border text-center w-auto">No.</th>
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Nama</th>
                                    <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                    <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                    <th className="px-4 py-2 border">Jumlah</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lpj.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-2 py-2 border text-center w-auto">
                                            {index + 1 + (currentPage - 1) * itemsPerPage}
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
                                        <td className="px-4 py-2 border">{formatDate(item.tanggalPengajuan)}</td>
                                        <td className="px-4 py-2 border">Rp{item.totalBiaya.toLocaleString('id-ID')}</td>                            
                                        <td className="py-2 border text-center">
                                            <div className="flex justify-center space-x-4">                        
                                                <button 
                                                className="rounded-full p-1 bg-green-200 hover:bg-green-300 text-green-600 border-[1px] border-green-600"
                                                onClick={() => onApprove(item)}
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
                                                onClick={() => onReject(item)}
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
        </div>
    );
};

export default LpjBsCheck;
