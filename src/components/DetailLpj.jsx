import React from 'react'

const DetailLpj = () => {
    const lpjDetail = {
        id: 'LPJ-01',
        name: 'Andi Ichwan',
        division: 'Finance',
        businessUnit: 'PT Samudera Makassar Logistik',
        submissionDate: '10 Oktober 2024',
        status: 'Disetujui',
        approver: 'Pak Budi',
        bonNumber: 'BS0001',
        bonAmount: 3000000,
        joNumber: 'JO000123',
        items: [
            {
                namaItem: 'Item A',
                tanggal: '10-Okt-2024',
                biaya: 100000,
                jumlah: 10
            },
            {
                namaItem: 'Item B',
                tanggal: '10-Okt-2024',
                biaya: 1000000,
                jumlah: 2
            }
        ]
    }

    // Hitung total biaya dengan menjumlahkan total dari 'jumlahBiaya'
    const totalCost = lpjDetail.items.reduce((total, item) => total + item.biaya * item.jumlah, 0)

    // Hitung Sisa Lebih Bon Sementara dan Sisa Kurang Dibayarkan ke Pegawai
    const bonSementara = lpjDetail.bonAmount
    const sisaKurang = Math.max(0, totalCost - bonSementara)

    // Memformat angka menjadi format rupiah
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Detail <span className="font-bold">LPJ Bon Sementara</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-48 mb-6 font-medium">
                    <div className="grid grid-cols-2">
                        <div>
                            <p>ID </p>
                            <p>Nama Lengkap </p>
                            <p>Divisi </p>
                            <p>Bisnis Unit </p>
                            <p>Tanggal Pengajuan </p>
                        </div>
                        <div>
                            <p>: {lpjDetail.id}</p>
                            <p>: {lpjDetail.name}</p>
                            <p>: {lpjDetail.division}</p>
                            <p>: {lpjDetail.businessUnit}</p>
                            <p>: {lpjDetail.submissionDate}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <div>
                            <p>Nomor Bon Sementara </p>
                            <p>Jumlah Bon Sementara </p>
                            <p>Nomor Job Order </p>
                            <p>Status </p>
                            <p>Disetujui Oleh </p>
                        </div>
                        <div>
                            <p>: {lpjDetail.bonNumber}</p>
                            <p>: {formatRupiah(lpjDetail.bonAmount)}</p>
                            <p>: {lpjDetail.joNumber}</p>
                            <p>: {lpjDetail.status}</p>
                            <p>: {lpjDetail.approver}</p>
                        </div>
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
                            {lpjDetail.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{index + 1}</td>
                                    <td className="px-4 py-2 border">{item.namaItem}</td>
                                    <td className="px-4 py-2 border">{item.tanggal}</td>
                                    <td className="px-4 py-2 border">{formatRupiah(item.biaya)}</td>
                                    <td className="px-4 py-2 border">{item.jumlah}</td>
                                    <td className="px-4 py-2 border">{formatRupiah(item.biaya * item.jumlah)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="px-4 py-4"></td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">
                                    Total Biaya
                                </td>
                                <td className="px-4 py-2 border">: {formatRupiah(totalCost)}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">
                                    Sisa Lebih Bon Sementara
                                </td>
                                <td className="px-4 py-2 border">: {formatRupiah(Math.max(0, bonSementara - totalCost))}</td>
                            </tr>
                            <tr className="font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right border">
                                    Sisa Kurang Dibayarkan ke Pegawai
                                </td>
                                <td className="px-4 py-2 border">: {formatRupiah(sisaKurang)}</td>
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
