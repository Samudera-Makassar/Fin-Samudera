import React, { useState, useEffect, useRef } from 'react'
import { doc, setDoc, getDoc, addDoc, collection, getDocs, runTransaction } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import Select from 'react-select'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CreateBonForm = () => {
    const [todayDate, setTodayDate] = useState('')
    const [alreadyFetchBS, setAlreadyFetchBS] = useState(false)
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

        const formattedDate = today.toISOString().split('T')[0]

        const uid = localStorage.getItem('userUid')

        setTodayDate(formattedDate)

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, 'users', uid)
                const userDoc = await getDoc(userDocRef)

                if (userDoc.exists()) {
                    const data = userDoc.data()

                    const adminStatus = data.role === 'Admin'
                    setIsAdmin(adminStatus)

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

                    setSelectedUnit(
                        isAdmin 
                            ? null 
                            : { value: data.unit, label: data.unit }
                    )
                }
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
        }

        fetchUserData()
    }, [])

    const BUSINESS_UNITS = [
        { value: 'PT Makassar Jaya Samudera', label: 'PT Makassar Jaya Samudera' },
        { value: 'PT Samudera Makassar Logistik', label: 'PT Samudera Makassar Logistik' },
        { value: 'PT Kendari Jaya Samudera', label: 'PT Kendari Jaya Samudera' },
        { value: 'PT Samudera Kendari Logistik', label: 'PT Samudera Kendari Logistik' },
        { value: 'PT Samudera Agencies Indonesia', label: 'PT Samudera Agencies Indonesia' },
        { value: 'PT Silkargo Indonesia', label: 'PT Silkargo Indonesia' },
        { value: 'PT PAD Samudera Indonesia', label: 'PT PAD Samudera Indonesia' },
        { value: 'PT Masaji Kargosentra Tama', label: 'PT Masaji Kargosentra Tama' }
    ]

    const [selectedUnit, setSelectedUnit] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    const kategoriOptions = [
        { value: 'GA/Umum', label: 'GA/Umum' },
        { value: 'Marketing/Operasional', label: 'Marketing/Operasional' }
    ]

    const [selectedKategori, setSelectedKategori] = useState(null)

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date)
    }

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
            if (alreadyFetchBS) return
            setAlreadyFetchBS(true)

            console.log(alreadyFetchBS)

            const today = new Date()
            const day = today.getDate().toString().padStart(2, '0')
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const year = today.getFullYear().toString().slice(-2)
            const tanggalKode = `${year}${month}${day}`
            const kodeFormat = '9'
    
            const counterRef = doc(db, 'counters', 'bonSementaraCounter')

            // Gunakan transaction untuk update nomor secara aman
            const nextSequence = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef)
                
                if (!counterDoc.exists()) {
                    transaction.set(counterRef, { 
                        lastNumber: 0,
                        lastResetMonth: month
                    })
                    return '0000001'
                }
                
                const lastResetMonth = counterDoc.data().lastResetMonth || '00'
                
                // Cek apakah bulan berbeda, jika ya reset nomor
                if (lastResetMonth !== month) {
                    transaction.update(counterRef, { 
                        lastNumber: 0,
                        lastResetMonth: month
                    })
                    return '0000001'
                }
                
                // Jika masih di bulan yang sama, increment nomor
                const newLastNumber = counterDoc.data().lastNumber + 1
                // transaction.update(counterRef, { lastNumber: newLastNumber })
                
                return newLastNumber.toString().padStart(7, '0')
            })
    
            const nomorBS = `BS${tanggalKode}${kodeFormat}${nextSequence}`
            return nomorBS
        } catch (error) {
            console.error('Error generating nomor BS:', error)
            return null
        }
    }

    useEffect(() => {
        const fetchNomorBS = async () => {
            if (alreadyFetchBS) return
            const nomorBS = await generateNomorBS()
            if (nomorBS) {
                setBonSementara((prevBonSementara) =>
                    prevBonSementara.map((item, index) => (index === 0 ? { ...item, nomorBS: nomorBS } : item))
                )
            }
        }
        console.log('tes')

        fetchNomorBS()
    }, [todayDate, alreadyFetchBS])

    const handleSubmit = async () => {
        try {
            if (
                !userData.nama ||
                !selectedKategori ||
                bonSementara.some((r) => !r.nomorBS || !r.jumlahBS || !r.kategori || !r.aktivitas) 
            ) {
                toast.warning('Mohon lengkapi semua field yang wajib diisi!')
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
                    unit: selectedUnit.value,
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
                status: 'Diajukan',
                approvedByReviewer1: false,
                approvedByReviewer2: false,
                approvedBySuperAdmin: false,
                rejectedBySuperAdmin: false,
                statusHistory: [
                    {
                        status: 'Diajukan',
                        timestamp: new Date().toISOString(),
                        actor: userData.uid
                    }
                ]
            }

            // Simpan ke Firestore
            const docRef = await addDoc(collection(db, 'bonSementara'), bonSementaraData)

            // Update dengan ID dokumen
            await setDoc(doc(db, 'bonSementara', docRef.id), { ...bonSementaraData, id: docRef.id })

            // Reset unit bisnis ke unit awal untuk admin
            if (isAdmin) {
                setSelectedUnit({ value: userData.unit, label: userData.unit })
            }

            // update nilai di collection counter
            await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'counters', 'bonSementaraCounter')

                const counterDoc = await transaction.get(counterRef)
                
                const newLastNumber = counterDoc.data().lastNumber + 1
                transaction.update(counterRef, { lastNumber: newLastNumber })
            })
            
            console.log('Bon Sementara berhasil dibuat:', {
                firestoreId: docRef.id,
                displayId: displayId
            })
            toast.success('Bon Sementara berhasil diajukan!')

            // Reset form setelah berhasil submit
            resetForm()
        } catch (error) {
            console.error('Error submitting bon sementara:', error)
            toast.error('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.')
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
                    <label className="block text-gray-700 font-medium mb-2">
                            Unit Bisnis {isAdmin && <span className="text-red-500">*</span>}
                        </label>
                        {isAdmin ? (
                            <Select
                                options={BUSINESS_UNITS}
                                value={selectedUnit}
                                onChange={setSelectedUnit}
                                placeholder="Pilih Unit Bisnis"
                                className="basic-single"
                                classNamePrefix="select"
                                styles={customStyles}
                                isSearchable={true}
                            />
                        ) : (
                            <input
                                className="w-full h-10 px-4 py-2 border rounded-md text-gray-500 cursor-not-allowed"
                                type="text"
                                value={selectedUnit?.label || ''}
                                disabled
                            />
                        )}
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
                            value={formatDate(todayDate)}
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
            
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
            />
        </div>
    )
}

export default CreateBonForm
