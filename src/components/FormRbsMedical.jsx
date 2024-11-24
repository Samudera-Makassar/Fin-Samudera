import React, { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore'
import { db } from '../firebaseConfig'

const RbsMedicalForm = () => {
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
        dokter: '',
        klinik: '',
        tanggal: '',
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
                        department: data.department || [],
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
        setReimbursements([
            {
                ...initialReimbursementState,
                tanggalPengajuan: todayDate
            }
        ])

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
        setReimbursements([...reimbursements, { ...initialReimbursementState, tanggalPengajuan: todayDate }])
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

    // Mapping nama unit ke singkatan
    const UNIT_CODES = {
        'PT Makassar Jaya Samudera': 'MJS',
        'PT Samudera Makassar Logistik': 'SML',
        'PT Kendari Jaya Samudera': 'KEJS',
        'PT Samudera Kendari Logistik': 'SKEL',
        'PT Samudera Agencies Indonesia': 'SAI',
        'PT Silkargo Indonesia': 'SKI',
        'PT PAD Samudera Indonesia': 'SP',
        'PT Masaji Kargosentra Tama': 'MKT'
    }

    const getUnitCode = (unitName) => {
        return UNIT_CODES[unitName] || unitName // Fallback ke nama unit jika tidak ada di mapping
    }

    const generateDisplayId = (unit) => {
        const today = new Date()
        const year = today.getFullYear().toString().slice(-2)
        const month = (today.getMonth() + 1).toString().padStart(2, '0')
        const day = today.getDate().toString().padStart(2, '0')
        const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        const unitCode= getUnitCode(unit)
                
        return `RBS/MED/${unitCode}/${year}${month}${day}/${sequence}`
    }
    
    const handleSubmit = async () => {
        try {
            // Validasi form
            if (
                !userData.nama ||
                reimbursements.some((r) => !r.jenis || !r.biaya || !r.dokter || !r.klinik || !r.tanggal)
            ) {
                alert('Mohon lengkapi semua field yang wajib diisi!')
                return
            }

            // Generate display ID untuk user
            const displayId = generateDisplayId(userData.unit)

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
                    unitCode: getUnitCode(userData.unit),
                    department: userData.department,
                    reviewer1: userData.reviewer1,
                    reviewer2: userData.reviewer2
                },
                reimbursements: reimbursements.map((item) => ({
                    jenis: item.jenis,
                    biaya: item.biaya,
                    dokter: item.dokter,
                    klinik: item.klinik,
                    tanggal: item.tanggal
                })),
                displayId: displayId,
                kategori: 'Medical',
                status: 'Diproses',
                tanggalPengajuan: todayDate,
                totalBiaya: totalBiaya,
                statusHistory: [
                    {
                        status: 'Diproses',
                        timestamp: new Date().toISOString(),
                        actor: userData.uid
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // Simpan ke Firestore
            const docRef = await addDoc(collection(db, 'reimbursement'), reimbursementData)

            // Update dengan ID dokumen
            await setDoc(doc(db, 'reimbursement', docRef.id), { ...reimbursementData, id: docRef.id });

            console.log('Reimbursement berhasil dibuat:', {
                firestoreId: docRef.id,
                displayId: displayId
            })
            alert('Reimbursement Medical berhasil diajukan!')

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
                Tambah <span className="font-bold">Reimbursement Medical</span>
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
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.jenis}
                                onChange={(e) => handleInputChange(index, 'jenis', e.target.value)}
                            />
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
                                    Nama Dokter <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.dokter}
                                onChange={(e) => handleInputChange(index, 'dokter', e.target.value)}
                            />
                        </div>

                        <div className="flex-1 min-w-36">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Nama Klinik/Rumah Sakit <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full px-4 py-2 border rounded-md"
                                type="text"
                                value={reimbursement.klinik}
                                onChange={(e) => handleInputChange(index, 'klinik', e.target.value)}
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

export default RbsMedicalForm
