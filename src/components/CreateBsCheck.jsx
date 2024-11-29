import React from 'react';
import EmptyState from '../assets/images/EmptyState.png';

const CreateBsCheck = ({ data = { 
    lpjBs: [
            { id: 'LPJ-01', nama: 'Andi Ichwan', noBs: 'BS0001', jenis: 'BBM', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000' },
        ] 
    }, onApprove, onReject }) => {
    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Cek <span className="font-bold">Pengajuan Bon Sementara</span>
            </h2>
        
            <div>
                {data.lpjBs.length === 0 ? (
                    // Jika belum ada data LPJ BS 
                    <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                        <h3 className="text-xl font-medium mb-4">Daftar Laporan Menunggu Review/Approve</h3>
                        <div className="flex justify-center">
                            <figure className="w-44 h-44">
                                <img src={EmptyState} alt="lpj bs icon" className="w-full h-full object-contain" />
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
                                    <th className="px-4 py-2 border">Nama</th>
                                    <th className="px-4 py-2 border">Nomor BS</th>
                                    <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                    <th className="px-4 py-2 border">Jumlah</th>
                                    <th className="py-2 border text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.lpjBs.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 border">{item.nama}</td>
                                        <td className="px-4 py-2 border">{item.noBs}</td>
                                        <td className="px-4 py-2 border">{item.tanggal}</td>
                                        <td className="px-4 py-2 border">{item.jumlah}</td>                            
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

export default CreateBsCheck;
