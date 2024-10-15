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

    const handleAddForm = () => {
        setReimbursements([...reimbursements, { jenis: '', biaya: '', dokter: '', klinik: '', tanggal: '' }])
    }

    const handleRemoveForm = (index) => {
        const updatedReimbursements = reimbursements.filter((_, i) => i !== index)
        setReimbursements(updatedReimbursements)
    }

    const handleInputChange = (index, field, value) => {
        const updatedReimbursements = reimbursements.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        )
        setReimbursements(updatedReimbursements)
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Tambah <span className="font-semibold">Reimbursement Medical</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500"
                            type="text"
                            value="Andi Ichwan"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Unit Bisnis</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500"
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
                            className="w-full px-4 py-2 border rounded-md text-gray-500"
                            type="text"
                            value="1234567890"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Bank</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500"
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
                            className="w-full px-4 py-2 border rounded-md text-gray-500"
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
                            <span className="ml-4 text-gray-500">Format File .pdf</span>
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
                    <button className="px-16 py-3 mr-4 bg-gray-200 text-gray-600 rounded">Cancel</button>
                    <button className="px-16 py-3 bg-red-600 text-white rounded">Submit</button>
                </div>
            </div>
        </div>
    )
}

export default RbsMedicalForm
