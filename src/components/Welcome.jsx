import React, { useState } from 'react';
import EmptyState from '../assets/images/EmptyState.png'

const Dashboard = () => {
        const [data, setData] = useState({
        reimbursements: [
            // Contoh data reimbursement
            { id: 'RBS-BBM-01', jenis: 'BBM', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Disetujui' },
            { id: 'RBS-MED-02', jenis: 'Medical', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Ditolak' },
        ],
        lpjBs: [
            // { id: 'LPJ-01', jenis: 'BBM', noBs: 'BS0001', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Diproses' },
        ] 
    });

    // State untuk mengelola modal
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Fungsi untuk membuka modal dan menyimpan laporan yang akan dibatalkan
    const handleCancel = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
        setCancelReason('');
        setSelectedReport(null);
    };

    // Fungsi untuk mengirim alasan pembatalan
    const handleSubmitCancel = () => {
        console.log(`Alasan pembatalan laporan ${selectedReport.id}: ${cancelReason}`);
        // Logika untuk membatalkan laporan dapat ditambahkan di sini
        handleCloseModal();
    };


    return (
        <div className="container mx-auto py-8">
            <div className="w-full">
                <h2 className="text-xl font-medium mb-4">
                    Welcome, <span className='font-bold'>Andi Ichwan</span>
                </h2>

                {/* Reimbursement Section */}
                {data.reimbursements.length === 0 ? (
                    // Jika belum ada data reimbursement kosong
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Reimbursement Terakhir</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                            </figure>
                        </div>
                    </div>
                ) : (
                    // Jika ada data reimbursement
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Reimbursement Terakhir</h3>
                        <table className="min-w-full bg-white border rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Jenis Reimbursement</th>
                                    <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                    <th className="px-4 py-2 border">Jumlah</th>
                                    <th className="py-2 border text-center">Status</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.reimbursements.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border">{item.id}</td>
                                        <td className="px-4 py-2 border">{item.jenis}</td>
                                        <td className="px-4 py-2 border">{item.tanggal}</td>
                                        <td className="px-4 py-2 border">{item.jumlah}</td>
                                        <td className="py-2 border text-center">
                                            <span className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === 'Disetujui' ? 'bg-green-200 text-green-800 border-[1px] border-green-600' : item.status === 'Diproses' ? 'bg-yellow-200 text-yellow-800 border-[1px] border-yellow-600' : 'bg-red-200 text-red-800 border-[1px] border-red-600'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2 border text-center">
                                            <button 
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleCancel(item)}
                                            >
                                                Batalkan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal untuk memasukkan alasan pembatalan */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-50"></div>
                        <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md mx-auto">
                            <h3 className="text-lg font-bold mb-4">Batalkan Laporan {selectedReport?.id}</h3>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Alasan Pembatalan:
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end">
                                <button
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 hover:text-gray-700 mr-2"
                                    onClick={handleCloseModal}
                                >
                                    Batal
                                </button>
                                <button
                                    className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 hover:text-gray-200"
                                    onClick={handleSubmitCancel}
                                >
                                    Kirim Alasan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LPJ Bon Section */}
                {data.lpjBs.length === 0 ? (
                    // Jika belum ada data LPJ BS
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">LPJ Bon Sementara Terakhir</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="lpj bon icon" className="w-full h-full object-contain" />
                            </figure>
                        </div>
                    </div>
                ) : (
                    // Jika ada data LPJ BS
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">LPJ Bon Sementara Terakhir</h3>
                        <table className="min-w-full bg-white border rounded-lg text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2 border">ID</th>
                                    <th className="px-4 py-2 border">Jenis LPJ BS</th>
                                    <th className="px-4 py-2 border">Nomor BS</th>
                                    <th className="px-4 py-2 border">Tanggal BS</th>
                                    <th className="px-4 py-2 border">Jumlah BS</th>
                                    <th className="py-2 border text-center">Status</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lpjBs.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border">{item.id}</td>
                                        <td className="px-4 py-2 border">{item.jenis}</td>
                                        <td className="px-4 py-2 border">{item.noBs}</td>
                                        <td className="px-4 py-2 border">{item.tanggal}</td>
                                        <td className="px-4 py-2 border">{item.jumlah}</td>
                                        <td className="py-2 border text-center">
                                            <span className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === 'Disetujui' ? 'bg-green-200 text-green-800 border-[1px] border-green-600' : item.status === 'Diproses' ? 'bg-yellow-200 text-yellow-800 border-[1px] border-yellow-600' : 'bg-red-200 text-red-800 border-[1px] border-red-600'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2 border text-center">
                                            <button 
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleCancel(item)}
                                            >
                                                Batalkan
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal untuk memasukkan alasan pembatalan */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-black opacity-50"></div>
                        <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md mx-auto">
                            <h3 className="text-lg font-bold mb-4">Batalkan Laporan {selectedReport?.id}</h3>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Alasan Pembatalan:
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end">
                                <button
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 hover:text-gray-700 mr-2"
                                    onClick={handleCloseModal}
                                >
                                    Batal
                                </button>
                                <button
                                    className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 hover:text-gray-200"
                                    onClick={handleSubmitCancel}
                                >
                                    Kirim Alasan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard;