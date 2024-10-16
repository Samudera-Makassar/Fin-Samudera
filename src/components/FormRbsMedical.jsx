import React, { useState, useEffect } from 'react'

const RbsMedicalForm = () => {
    const [todayDate, setTodayDate] = useState('')
    const [reimbursements, setReimbursements] = useState([
        { jenis: '', biaya: '', dokter: '', klinik: '', tanggal: '' }
    ])

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
        setReimbursements([...reimbursements, { jenis: '', biaya: '', dokter: '', klinik: '', tanggal: '' }])
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
                Tambah <span className="font-bold">Reimbursement Medical</span>
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
                                className="px-4 py-2 bg-gray-200 border rounded cursor-pointer hover:bg-gray-300 hover:border-gray-400 transition duration-300 ease-in-out"
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
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Jenis Reimbursement</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.jenis}
                                onChange={(e) => handleInputChange(index, 'jenis', e.target.value)}
                            />
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
                            <label className="block text-gray-700 font-medium mb-2">Nama Dokter</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.dokter}
                                onChange={(e) => handleInputChange(index, 'dokter', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nama Klinik/RS</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.klinik}
                                onChange={(e) => handleInputChange(index, 'klinik', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tanggal Aktivitas</label>
                            <input
                                className="w-full px-4 py-2 border rounded-md"
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

export default RbsMedicalForm
