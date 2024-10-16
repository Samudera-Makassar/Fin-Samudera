import React, { useState, useEffect } from 'react'

const RbsBbmForm = () => {
    const [todayDate, setTodayDate] = useState('')
    const [reimbursements, setReimbursements] = useState([{ jenis: '', biaya: '', lokasi: '', plat: '', tanggal: '' }])

    useEffect(() => {
        const today = new Date()
        const formattedDate = today.toISOString().split('T')[0]
        setTodayDate(formattedDate)
    }, [])

    const formatRupiah = (number) => {
        const strNumber = number.replace(/[^,\d]/g, '').toString() // Menghilangkan karakter non-numerik
        const split = strNumber.split(',')
        const sisa = split[0].length % 3
        let rupiah = split[0].substr(0, sisa)
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

        if (ribuan) {
            const separator = sisa ? '.' : ''
            rupiah += separator + ribuan.join('.')
        }

        rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
        return 'Rp' + rupiah
    }

    const handleAddForm = () => {
        setReimbursements([...reimbursements, { jenis: '', biaya: '', lokasi: '', plat: '', tanggal: '' }])
    }

    const handleRemoveForm = (index) => {
        const updatedReimbursements = reimbursements.filter((_, i) => i !== index)
        setReimbursements(updatedReimbursements)
    }

    const handleInputChange = (index, field, value) => {
        let formattedValue = value

        if (field === 'biaya') {
            // Format biaya menjadi rupiah
            formattedValue = formatRupiah(value)
        }

        const updatedReimbursements = reimbursements.map((item, i) =>
            i === index ? { ...item, [field]: formattedValue } : item
        )
        setReimbursements(updatedReimbursements)
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Tambah <span className="font-bold">Reimbursement BBM</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value="Andi Ichwan"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Unit Bisnis</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value="PT Samudera Makassar Logistik"
                            disabled
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nomor Rekening</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value="1234567890"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Bank</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value="Bank Rakyat Indonesia"
                            disabled
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Tanggal Pengajuan</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
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
                                className="px-4 py-2 bg-gray-200 border rounded cursor-pointer"
                            >
                                Upload File
                            </label>
                            <span className="ml-4 text-gray-500">Format .pdf Max Size: 250MB</span>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-300 my-6" />

                {reimbursements.map((reimbursement, index) => (
                    <div className="grid grid-cols-6 gap-2 mb-4" key={index}>
                        <div className="w-full">
                            <label className="block text-gray-700 font-medium mb-2">Jenis Reimbursement</label>
                            <div className="relative">
                                <select
                                    className="block w-full px-4 py-2 pr-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={reimbursement.jenis}
                                    onChange={(e) => handleInputChange(index, 'jenis', e.target.value)}
                                >
                                    <option value="BBM Pertalite">BBM Pertalite</option>
                                    <option value="BBM Pertamax">BBM Pertamax</option>
                                    <option value="BBM Solar">BBM Solar</option>
                                    <option value="Top Up E-Toll">Top Up E-Toll</option>
                                    <option value="Parkir">Parkir</option>
                                    <option value="Others">Others</option>
                                </select>

                                {/* Icon Dropdown */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        ></path>
                                    </svg>
                                </div>

                                {reimbursement.jenis === 'Others' && (
                                    <div className="mt-4">
                                        <label className="block text-gray-700 font-medium mb-2">Keterangan</label>
                                        <input
                                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            type="text"
                                            placeholder="Jenis Lain"
                                            value={reimbursement.jenisLain}
                                            onChange={(e) => handleInputChange(index, 'jenisLain', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Biaya</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.biaya}
                                onChange={(e) => handleInputChange(index, 'biaya', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Lokasi Pertamina</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.lokasi}
                                onChange={(e) => handleInputChange(index, 'lokasi', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Plat Nomor</label>
                            <input
                                className="w-4/6 px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.plat}
                                onChange={(e) => handleInputChange(index, 'plat', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tanggal Aktivitas</label>
                            <input
                                className="w-auto px-4 py-2 border rounded-md"
                                type="date"
                                value={reimbursement.tanggal}
                                onChange={(e) => handleInputChange(index, 'tanggal', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded hover:bg-red-100"
                                onClick={() => handleRemoveForm(index)}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}

                <div className="mb-4">
                    <span className="text-red-500 font-bold underline cursor-pointer" onClick={handleAddForm}>
                        Tambah
                    </span>
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

export default RbsBbmForm
