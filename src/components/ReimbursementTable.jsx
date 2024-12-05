import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import EmptyState from '../assets/images/EmptyState.png';
import Modal from '../components/Modal';

const ReimbursementTable = () => {
    const [data, setData] = useState({ reimbursements: [] });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        const fetchUserAndReimbursements = async () => {
            try {
                const uid = localStorage.getItem('userUid');
                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage');
                    setLoading(false);
                    return;
                }

                // Fetch data user berdasarkan UID
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);

                // Query reimbursement berdasarkan UID user
                const q = query(
                    collection(db, 'reimbursement'),
                    where('user.uid', '==', uid)
                );

                const querySnapshot = await getDocs(q);
                const reimbursements = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    displayId: doc.data().displayId,
                    ...doc.data(),
                }));

                setData({ reimbursements });
            } catch (error) {
                console.error('Error fetching user or reimbursements data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndReimbursements();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const totalPages = Math.ceil(data.reimbursements.length / itemsPerPage);
    const currentReimbursements = data.reimbursements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCancel = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCancelReason('');
        setSelectedReport(null);
    };

    const handleSubmitCancel = async () => {
        if (!selectedReport || !cancelReason) return;  // Pastikan cancelReason ada
    
        try {
            const reimbursementDocRef = doc(db, 'reimbursement', selectedReport.id);
            
            // Memperbarui data di Firestore
            await updateDoc(reimbursementDocRef, {
                status: 'Dibatalkan',
                cancelReason: cancelReason || 'Alasan tidak diberikan',
            });
    
            // Menyegarkan data reimbursement setelah pembatalan
            const uid = localStorage.getItem('userUid');
            const q = query(collection(db, 'reimbursement'), where('user.uid', '==', uid));
            const querySnapshot = await getDocs(q);
            const reimbursements = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                displayId: doc.data().displayId,
                ...doc.data(),
            }));
    
            setData({ reimbursements });  // Mengupdate state dengan data baru
    
            // Menutup modal setelah pembatalan
            handleCloseModal();
        } catch (error) {
            console.error('Error cancelling reimbursement:', error);
            alert('Gagal membatalkan reimbursement. Silakan coba lagi.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {data.reimbursements.length === 0 ? (
                // Jika belum ada data reimbursement
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Reimbursement Diajukan</h3>
                    <div className="flex justify-center">
                        <figure className="w-44 h-44">
                            <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                        </figure>
                    </div>
                </div>
            ) : (
                // Jika ada data reimbursement
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Reimbursement Diajukan</h3>
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-2 py-2 border text-center w-auto">No.</th>
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                <th className="px-4 py-2 border">Jumlah</th>
                                <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                <th className="py-2 border text-center">Status</th>
                                <th className="py-2 border text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReimbursements.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-2 py-2 border text-center w-auto">
                                        {index + 1 + (currentPage - 1) * itemsPerPage}
                                    </td>                                
                                    <td className="px-4 py-2 border">
                                        <Link 
                                            to={`/reimbursement/${item.id}`}
                                            className="text-black hover:text-gray-700 hover:underline cursor-pointer"
                                        >
                                            {item.displayId}
                                        </Link>                                                                            
                                    </td>
                                    <td className="px-4 py-2 border">{item.kategori}</td>
                                    <td className="px-4 py-2 border">Rp{item.totalBiaya.toLocaleString('id-ID')}</td>
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
                                            onClick={() => handleCancel(item)} 
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
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5L8.25 12l7.5-7.5"
                                />
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
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <Modal
                    showModal={isModalOpen}
                    selectedReport={selectedReport}
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onClose={handleCloseModal}
                    onConfirm={handleSubmitCancel}
                    title="Konfirmasi Pembatalan"
                    message={`Apakah Anda yakin ingin membatalkan laporan ${selectedReport?.displayId || 'ini'}?`}
                    cancelText="Tidak"
                    confirmText="Ya, Batalkan"
                    showCancelReason={true}
                />
        </div>
    );
};

export default ReimbursementTable;
