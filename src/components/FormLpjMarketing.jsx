import React, { useState, useEffect } from 'react'

const FormLpjMarketing = () => {
    const [todayDate, setTodayDate] = useState('')

    useEffect(() => {
        const today = new Date()
        const formattedDate = today.toISOString().split('T')[0]
        setTodayDate(formattedDate)
    }, [])

    const [items, setItems] = useState([
        { date: '10-Okt-2024', name: 'Item A', cost: 100000, quantity: 10, total: 1000000 },
        { date: '10-Okt-2024', name: 'Item B', cost: 1000000, quantity: 2, total: 2000000 }
    ])

    const handleAddItem = () => {
        setItems([...items, { date: '', name: '', cost: 0, quantity: 0, total: 0 }])
    }

    const formatRupiah = (value) => {
        // Memastikan bahwa value adalah string
        let numberString = (value || '').toString().replace(/[^,\d]/g, '')
        let split = numberString.split(',')
        let sisa = split[0].length % 3
        let rupiah = split[0].substr(0, sisa)
        let ribuan = split[0].substr(sisa).match(/\d{3}/gi)

        if (ribuan) {
            let separator = sisa ? '.' : ''
            rupiah += separator + ribuan.join('.')
        }

        rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
        return 'Rp' + rupiah
    }

    const handleInputChange = (index, field, value) => {
        const updatedItems = items.map((item, i) => {
            if (i === index) {
                if (field === 'cost') {
                    const cleanValue = value.replace(/\D/g, '')
                    return {
                        ...item,
                        [field]: cleanValue,
                        total: item.quantity * cleanValue // Menghitung total saat cost diubah
                    }
                } else if (field === 'quantity') {
                    return {
                        ...item,
                        [field]: value,
                        total: value * item.cost // Menghitung total saat quantity diubah
                    }
                }
                return { ...item, [field]: value }
            }
            return item
        })
        setItems(updatedItems)
    }

    const handleDelete = (index) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        setItems(newItems)
    }

    const totalCost = items.reduce((acc, item) => acc + item.total, 0)
    const bonSementara = 2000000
    const sisaKurang = totalCost > bonSementara ? totalCost - bonSementara : 0

    return (
        <div className="container mx-auto py-8 relative">
            <h2 className="text-xl font-medium mb-4">
                Tambah <span className="font-bold">LPJ Bon Sementara Marketing/Operasional</span>
            </h2>

            <div className="mx-auto bg-white shadow-lg rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed bg-[#D5D5D5]"
                            type="text"
                            value="Andi Ichwan"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Unit Bisnis</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed bg-[#D5D5D5]"
                            type="text"
                            value="PT Samudera Makassar Logistik"
                            disabled
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Nomor Bon Sementara <span className="text-red-500">*</span>
                        </label>

                        <input className="w-full px-4 py-2 border rounded-md text-gray-500" type="text" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Jumlah Bon Sementara <span className="text-red-500">*</span>
                        </label>
                        <input className="w-full px-4 py-2 border rounded-md text-gray-500" type="text" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Tanggal Pengajuan</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed bg-[#D5D5D5]"
                            type="date"
                            value={todayDate}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Lampiran</label>
                        <div className="flex items-center">
                            <input className="hidden" type="file" name="resume" id="file-upload" />
                            <label
                                htmlFor="file-upload"
                                className="px-4 py-2 bg-gray-200 border rounded cursor-pointer hover:bg-gray-300 hover:border-gray-400 transition duration-300 ease-in-out"
                            >
                                Upload File
                            </label>

                            <span className="ml-4 text-gray-500">Format .pdf Max Size: 250MB</span>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-300 my-6" />

                {items.map((item, index) => (
                    <div className="grid grid-cols-6 gap-2 mb-4" key={index}>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tanggal Kegiatan</label>
                            <input
                                type="date"
                                value={item.date}
                                onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Item</label>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Biaya</label>
                            <input
                                type="text"
                                value={formatRupiah(item.cost)}
                                onChange={(e) => handleInputChange(index, 'cost', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Jumlah</label>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Jumlah Biaya</label>
                            <input
                                type="text"
                                value={`Rp${item.total.toLocaleString()}`}
                                className="w-full border border-gray-300 rounded-md px-4 py-2"
                                disabled
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => handleDelete(index)}
                                className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded hover:bg-red-100"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={handleAddItem} className="mt-4 text-red-600 font-bold underline cursor-pointer">
                    Tambah
                </button>

                {/* Bagian Total Biaya */}
                <div className="grid grid-cols-2 gap-6 my-6 ml-96 mr-60">
                    <div className="text-left">
                        <span>Total Biaya</span>
                        <br />
                        <span>Sisa Lebih Bon Sementara</span>
                        <br />
                        <span>Sisa Kurang Dibayarkan ke Pegawai</span>
                    </div>
                    <div className="text-right">
                        <span>Rp{totalCost.toLocaleString()}</span>
                        <br />
                        <span>Rp{Math.max(0, bonSementara - totalCost).toLocaleString()}</span>
                        <br />
                        <span>Rp{sisaKurang.toLocaleString()}</span>
                    </div>
                </div>

                <hr className="border-gray-300 my-6" />

                <div className="flex justify-end mt-6">
                    <button className="px-16 py-3 mr-4 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 hover:text-gray-700">
                        Cancel
                    </button>
                    <button className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FormLpjMarketing
