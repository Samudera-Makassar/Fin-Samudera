import React from 'react';
import EmptyState from '../assets/images/EmptyState.png';

const ReimbursementTable = ({ data = { 
    reimbursements: [
            { id: 'RBS-BBM-01', jenis: 'BBM', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Disetujui' },
            { id: 'RBS-MED-02', jenis: 'Medical', tanggal: '10-Okt-2024', jumlah: 'Rp.123.000', status: 'Ditolak' },
        ] 
    }, onCancel }) => {
    return (
        <div>
            {data.reimbursements.length === 0 ? (
                // Jika belum ada data reimbursement 
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
                                            onClick={() => onCancel(item)} 
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
        </div>
    );
};

export default ReimbursementTable;
