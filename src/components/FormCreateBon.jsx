import React, { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import Select from 'react-select'

const CreateBonForm = () => {
    const [todayDate, setTodayDate] = useState('')
    const [userData, setUserData] = useState({
        uid: '',
        nama: '',
        bankName: '',
        accountNumber: '',
        unit: '',
        posisi: '',
        reviewer1: [],
        reviewer2: []
    })

    const initialBonSementaraState = {
        nomorBS: '',
        aktivitas: '',
        jumlahBS: '',
        kategori: '',
        tanggalPengajuan: todayDate
    }

    const [bonSementara, setBonSementara] = useState([initialBonSementaraState])

    useEffect(() => {
        if (todayDate) {
            setBonSementara((prevBonSementara) =>
                prevBonSementara.map((item) => ({ ...item, tanggalPengajuan: todayDate }))
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
                        posisi: data.posisi || '',
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

    const kategoriOptions = [
        { value: 'GA/Umum', label: 'GA/Umum' },
        { value: 'Marketing/Operasional', label: 'Marketing/Operasional' }
    ]

    const [selectedKategori, setSelectedKategori] = useState(null)

    const handleKategoriChange = (selectedOption) => {
        setSelectedKategori(selectedOption)
        setBonSementara((prevBonSementara) =>
            prevBonSementara.map((item, index) => (index === 0 ? { ...item, kategori: selectedOption.value } : item))
        )
    }

    const customStyles = {
        control: (base) => ({
            ...base,
            padding: '0 7px',
            height: '40px',
            minHeight: '40px',
            borderColor: '#e5e7eb',
            '&:hover': {
                borderColor: '#3b82f6'
            }
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 7px',
            height: '40px',
            minHeight: '40px'
        })
    }

    const resetForm = () => {
        // Reset bonSementara to initial state with one empty form
        setBonSementara([
            {
                ...initialBonSementaraState,
                tanggalPengajuan: todayDate
            }
        ])
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

    const handleInputChange = (index, field, value) => {
        if (field === 'nomorBS') return // Hindari perubahan manual

        let formattedValue = value

        if (field === 'jumlahBS') {
            formattedValue = formatRupiah(value)
        }

        const updatedBonSementara = bonSementara.map((item, i) =>
            i === index ? { ...item, [field]: formattedValue } : item
        )
        setBonSementara(updatedBonSementara)
    }

    const generateNomorBS = async () => {
        try {
            const today = new Date()
            const day = today.getDate().toString().padStart(2, '0')
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const year = today.getFullYear().toString().slice(-2)
            const tanggalKode = `${year}${month}${day}` // Format tanggal: 241126
            const kodeFormat = '9'

            // Mendapatkan jumlah dokumen di koleksi
            const collectionRef = collection(db, 'bonSementara')
            const snapshot = await getDocs(collectionRef)

            // Urutan berikutnya berdasarkan jumlah dokumen + 1
            const nextSequence = (snapshot.size + 1).toString().padStart(7, '0') // Format: 0000001

            // Menggabungkan kode BS
            const nomorBS = `BS${tanggalKode}${kodeFormat}${nextSequence}`
            return nomorBS
        } catch (error) {
            console.error('Error generating nomor BS:', error)
            return null
        }
    }

    useEffect(() => {
        const fetchNomorBS = async () => {
            const nomorBS = await generateNomorBS()
            if (nomorBS) {
                setBonSementara((prevBonSementara) =>
                    prevBonSementara.map((item, index) => (index === 0 ? { ...item, nomorBS: nomorBS } : item))
                )
            }
        }

        fetchNomorBS()
    }, [todayDate])

    const handleSubmit = async () => {
        try {
            if (
                !userData.nama ||
                bonSementara.some((r) => !r.nomorBS || !r.jumlahBS || !r.kategori || !r.aktivitas) ||
                !selectedKategori
            ) {
                alert('Mohon lengkapi semua field yang wajib diisi!')
                return
            }

            // Gunakan nomorBS pertama sebagai   Id
            const displayId = bonSementara[0]?.nomorBS

            // Map data bon sementara langsung saat akan disimpan
            const bonSementaraData = {
                user: {
                    uid: userData.uid,
                    nama: userData.nama,
                    bankName: userData.bankName,
                    accountNumber: userData.accountNumber,
                    unit: userData.unit,
                    posisi: userData.posisi,
                    department: userData.department,
                    reviewer1: userData.reviewer1,
                    reviewer2: userData.reviewer2
                },
                bonSementara: bonSementara.map((item) => ({
                    nomorBS: item.nomorBS,
                    jumlahBS: item.jumlahBS,
                    aktivitas: item.aktivitas,
                    kategori: item.kategori
                })),
                displayId: displayId,
                tanggalPengajuan: todayDate,
                status: 'Diproses',
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
            const docRef = await addDoc(collection(db, 'bonSementara'), bonSementaraData)

            // Update dengan ID dokumen
            await setDoc(doc(db, 'bonSementara', docRef.id), { ...bonSementaraData, id: docRef.id })

            console.log('Bon Sementara berhasil dibuat:', {
                firestoreId: docRef.id,
                displayId: displayId
            })
            alert('Bon Sementara berhasil diajukan!')

            // Reset form setelah berhasil submit
            resetForm()
        } catch (error) {
            console.error('Error submitting bon sementara:', error)
            alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.')
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Ajukan <span className="font-bold">Bon Sementra</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                        <input
                            className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={userData.nama}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Unit Bisnis</label>
                        <input
                            className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
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
                            className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={userData.accountNumber}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Nama Bank</label>
                        <input
                            className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
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
                            className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                            type="text"
                            value={todayDate}
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Kategori BS <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={kategoriOptions}
                            value={selectedKategori}
                            onChange={handleKategoriChange}
                            placeholder="Pilih Kategori..."
                            className="w-full "
                            styles={customStyles}
                            isSearchable={true}
                        />
                    </div>
                </div>

                <hr className="border-gray-300 my-6" />

                {bonSementara.map((bonSementara, index) => (
                    <div key={index} className="flex justify-stretch gap-4 mb-2">
                        <div className="flex-1">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Nomor BS <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                                type="text"
                                value={bonSementara.nomorBS}
                                onChange={(e) => handleInputChange(index, 'nomorBS', e.target.value)}
                            />
                        </div>

                        <div className="flex-1">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Aktivitas (Keterangan) <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                                type="text"
                                value={bonSementara.aktivitas}
                                onChange={(e) => handleInputChange(index, 'aktivitas', e.target.value)}
                            />
                        </div>

                        <div className="flex-1">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Jumlah BS <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                                type="text"
                                value={formatRupiah(bonSementara.jumlahBS)}
                                onChange={(e) => handleInputChange(index, 'jumlahBS', e.target.value)}
                            />
                        </div>
                    </div>
                ))}

                <hr className="border-gray-300 my-6" />

                <div className="flex justify-end mt-6">
                    <button
                        className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                        onClick={handleSubmit}
                    >
                        Ajukan
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateBonForm
