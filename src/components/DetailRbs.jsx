import React from 'react'

const DetailRbs = () => {
    const reimbursementDetail = {
        id: 'RBS-BBM-01',
        name: 'Andi Ichwan',
        department: 'Finance',
        unitBusiness: 'PT Samudera Makassar Logistik',
        submissionDate: '10 Oktober 2024',
        status: 'Disetujui',
        approver: 'Pak Budi',
        accountNumber: '1234567890',
        bankName: 'Bank Rakyat Indonesia',
        reimbursementCategory: 'BBM',
        items: [
            {
                jenis: 'Top Up E-Toll',
                tanggal: '10-Okt-2024',
                lokasi: 'Jalan Sungai Saddang Lama',
                platNomor: 'DD 1234 AB',
                biaya: 52500,
            },
            {
                jenis: 'BBM Pertamax',
                tanggal: '10-Okt-2024',
                lokasi: 'Jalan Sungai Saddang Lama',
                platNomor: 'DD 1234 AB',
                biaya: 50000,
            },
        ],
    }

    // Menghitung total biaya
    const totalBiaya = reimbursementDetail.items.reduce((total, item) => total + item.biaya, 0);

    // Fungsi untuk memformat angka menjadi format rupiah
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Detail <span className="font-bold">Reimbursement</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-48 mb-6 font-medium">
                    <div className='grid grid-cols-2'>
                        <div>
                            <p>ID </p>
                            <p>Nama Lengkap </p>
                            <p>Department </p>
                            <p>Unit Bisnis </p>
                            <p>Tanggal Pengajuan </p>
                        </div>
                        <div>
                            <p>: {reimbursementDetail.id}</p>
                            <p>: {reimbursementDetail.name}</p>
                            <p>: {reimbursementDetail.department}</p>
                            <p>: {reimbursementDetail.unitBusiness}</p>
                            <p>: {reimbursementDetail.submissionDate}</p>
                        </div>
                    </div>
                    <div className='grid grid-cols-2'>
                        <div>
                            <p>Kategori Reimbursement </p>
                            <p>Nomor Rekening </p>
                            <p>Nama Bank </p>
                            <p>Status </p>
                            <p>Disetujui Oleh </p>
                        </div>
                        <div>
                            <p>: {reimbursementDetail.reimbursementCategory}</p>
                            <p>: {reimbursementDetail.accountNumber}</p>
                            <p>: {reimbursementDetail.bankName}</p>
                            <p>: {reimbursementDetail.status}</p>
                            <p>: {reimbursementDetail.approver}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border">No.</th>
                                <th className="px-4 py-2 border">Jenis Reimbursement</th>
                                <th className="px-4 py-2 border">Tanggal Aktivitas</th>
                                <th className="px-4 py-2 border">Lokasi Pertamina</th>
                                <th className="px-4 py-2 border">Plat Nomor</th>
                                <th className="px-4 py-2 border">Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reimbursementDetail.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{index + 1}</td>
                                    <td className="px-4 py-2 border">{item.jenis}</td>
                                    <td className="px-4 py-2 border">{item.tanggal}</td>
                                    <td className="px-4 py-2 border">{item.lokasi}</td>
                                    <td className="px-4 py-2 border">{item.platNomor}</td>
                                    <td className="px-4 py-2 border">{formatRupiah(item.biaya)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="px-4 py-4"></td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">Total Biaya :</td>
                                <td className="px-4 py-2 border">{formatRupiah(totalBiaya)}</td>
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

export default DetailRbs
