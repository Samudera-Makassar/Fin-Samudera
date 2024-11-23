import React, { useState, useEffect } from 'react'
import { doc, getDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import Select from 'react-select'

const RbsBbmForm = () => {
    const [todayDate, setTodayDate] = useState('')
    const [userData, setUserData] = useState({
        uid: '',
        nama: '',
        bankName: '',
        accountNumber: '',
        unit: '',
        reviewer1: [],
        reviewer2: []
    })

    const initialReimbursementState = {
        jenis: '',
        biaya: '',
        lokasi: '',
        plat: '',
        tanggal: '',
        isLainnya: false,
        jenisLain: '',
        tanggalPengajuan: todayDate
    }

    const [reimbursements, setReimbursements] = useState([initialReimbursementState])

    useEffect(() => {
        if (todayDate) {
            setReimbursements((prevReimbursements) =>
                prevReimbursements.map((item) => ({ ...item, tanggalPengajuan: todayDate }))
            )
        }
    }, [todayDate])

    const jenisOptions = [
        { value: 'BBM Pertalite', label: 'BBM Pertalite' },
        { value: 'BBM Pertamax', label: 'BBM Pertamax' },
        { value: 'BBM Solar', label: 'BBM Solar' },
        { value: 'Top Up E-Toll', label: 'Top Up E-Toll' },
        { value: 'Parkir', label: 'Parkir' },
        { value: 'Lainnya', label: 'Lainnya' }
    ]

    useEffect(() => {
        const today = new Date()
        const day = today.getDate()
        const month = today.getMonth()
        const year = today.getFullYear()

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
        const formattedDate = `${day}-${monthNames[month]}-${year}`

        const uid = localStorage.getItem('userUid')

        setTodayDate(formattedDate)

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, 'users', uid)
                const userDoc = await getDoc(userDocRef)

                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setUserData({
                        uid: data.uid || '',
                        nama: data.nama || '',
                        bankName: data.bankName || '',
                        accountNumber: data.accountNumber || '',
                        unit: data.unit || '',
                        reviewer1: data.reviewer1 || [],
                        reviewer2: data.reviewer2 || []
                    })
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUserData()
    }, [])

    const resetForm = () => {
        // Reset reimbursements to initial state with one empty form
        setReimbursements([{
            ...initialReimbursementState,
            tanggalPengajuan: todayDate
        }])

        // // Reset file input if you have one
        // const fileInput = document.getElementById('file-upload')
        // if (fileInput) {
        //     fileInput.value = ''
        // }
    }

    const formatRupiah = (number) => {
        const strNumber = number.replace(/[^,\d]/g, '').toString()
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
        setReimbursements([
            ...reimbursements,
            { ...initialReimbursementState, tanggalPengajuan: todayDate }
        ])
    }

    const handleRemoveForm = (index) => {
        const updatedReimbursements = reimbursements.filter((_, i) => i !== index)
        setReimbursements(updatedReimbursements)
    }

    const handleInputChange = (index, field, value) => {
        let formattedValue = value

        if (field === 'biaya') {
            formattedValue = formatRupiah(value)
        }

        const updatedReimbursements = reimbursements.map((item, i) =>
            i === index ? { ...item, [field]: formattedValue } : item
        )
        setReimbursements(updatedReimbursements)
    }

    const handleJenisChange = (index, selectedOption) => {
        const updatedReimbursements = [...reimbursements]

        if (selectedOption && selectedOption.value === 'Lainnya') {
            updatedReimbursements[index] = {
                ...updatedReimbursements[index],
                jenis: null,
                isLainnya: true,
                jenisLain: ''
            }
        } else {
            updatedReimbursements[index] = {
                ...updatedReimbursements[index],
                jenis: selectedOption,
                isLainnya: false,
                jenisLain: ''
            }
        }

        setReimbursements(updatedReimbursements)
    }

    const handleJenisLainChange = (index, value) => {
        const updatedReimbursements = [...reimbursements]
        updatedReimbursements[index].jenisLain = value
        setReimbursements(updatedReimbursements)
    }

    const handleSubmit = async () => {
        try {
            // Validasi form
            if (
                !userData.nama ||
                reimbursements.some((r) => {
                    if (r.isLainnya) {
                        return !r.jenisLain || !r.biaya || !r.lokasi || !r.plat || !r.tanggal 
                    }
                    return !r.jenis || !r.biaya || !r.lokasi || !r.plat || !r.tanggal
                })
            ) {
                alert('Mohon lengkapi semua field yang wajib diisi!')
                return
            }

            // Hitung total biaya
            const totalBiaya = reimbursements.reduce((total, item) => {
                const biayaNumber = parseInt(item.biaya.replace(/[^0-9]/g, ''))
                return total + biayaNumber
            }, 0)

            // Map data reimbursement langsung saat akan disimpan
            const reimbursementData = {
                user: {
                    uid: userData.uid,
                    nama: userData.nama,
                    bankName: userData.bankName,
                    accountNumber: userData.accountNumber,
                    unit: userData.unit,
                    reviewer1: userData.reviewer1,
                    reviewer2: userData.reviewer2
                },
                reimbursements: reimbursements.map((item) => ({
                    biaya: item.biaya,
                    lokasi: item.lokasi,
                    plat: item.plat,
                    tanggal: item.tanggal,                    
                    isLainnya: item.isLainnya,
                    jenis: item.isLainnya ? item.jenisLain : item.jenis.value,                    
                })),
                kategori: 'BBM',
                status: 'Diproses',
                tanggalPengajuan: todayDate,
                totalBiaya: totalBiaya,
                statusHistory: [
                    {
                        status: 'Diproses',
                        timestamp: new Date().toISOString()
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // Simpan ke Firestore
            const docRef = await addDoc(collection(db, 'reimbursement'), reimbursementData)

            console.log('Data berhasil disimpan dengan ID:', docRef.id)
            alert('Reimbursement BBM berhasil diajukan!')
            
            // Reset form setelah berhasil submit
            resetForm()
        } catch (error) {
            console.error('Error submitting reimbursement:', error)
            alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.')
        }
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
                            value={userData.nama}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Unit Bisnis</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={userData.unit}
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
                            value={userData.accountNumber}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Bank</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={userData.bankName}
                            disabled
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Tanggal Pengajuan</label>
                        <input
                            className="w-full px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={todayDate}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Lampiran <span className="text-red-500">*</span>
                        </label>
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
                    <div key={index} className="flex justify-stretch gap-2 mb-2">
                        <div className="flex-1 max-w-44">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Jenis Reimbursement <span className="text-red-500">*</span>
                                </label>
                            )}
                            <div key={index}>
                                {reimbursement.isLainnya ? (
                                    <input
                                        type="text"
                                        placeholder="Jenis lain"
                                        value={reimbursement.jenisLain}
                                        onChange={(e) => handleJenisLainChange(index, e.target.value)}
                                        className="w-full px-4 py-2 border rounded"
                                    />
                                ) : (
                                    <Select
                                        options={jenisOptions}
                                        value={reimbursement.jenis}
                                        onChange={(selectedOption) => handleJenisChange(index, selectedOption)}
                                        placeholder="Pilih jenis..."
                                        className="w-full"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 max-w-36">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Biaya <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={formatRupiah(reimbursement.biaya)}
                                onChange={(e) => handleInputChange(index, 'biaya', e.target.value)}
                            />
                        </div>

                        <div className="flex-1 min-w-36">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Lokasi Pertamina <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.lokasi}
                                onChange={(e) => handleInputChange(index, 'lokasi', e.target.value)}
                            />
                        </div>

                        <div className="flex-1 max-w-36">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Plat Nomor <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.plat}
                                onChange={(e) => handleInputChange(index, 'plat', e.target.value)}
                            />
                        </div>

                        <div className="flex-1 max-w-40">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Tanggal Aktivitas <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="date"
                                value={reimbursement.tanggal}
                                onChange={(e) => handleInputChange(index, 'tanggal', e.target.value)}
                            />
                        </div>

                        <div className="flex items-end ">
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
                    <span className="text-red-600 font-bold underline cursor-pointer" onClick={handleAddForm}>
                        Tambah
                    </span>
                </div>

                <hr className="border-gray-300 my-6" />

                <div className="flex justify-end mt-6">
                    <button
                        className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RbsBbmForm
