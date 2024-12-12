import React, { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebaseConfig'
import Select from 'react-select'
import { useLocation } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const FormLpjMarketing = () => {
    const [todayDate, setTodayDate] = useState('')
    const [userData, setUserData] = useState({
        uid: '',
        nama: '',
        unit: '',
        reviewer1: [],
        reviewer2: []
    })

    const initialLpjState = {
        nomorBS: '',
        jumlahBS: '',
        project: '',
        nomorJO: '',
        customer: '',
        lokasi: '',
        lampiran: '',
        tanggal: '',
        lampiran: null,
        lampiranFile: null,
        namaItem: '',
        biaya: '',
        jumlah: '',
        keterangan: '',
        jumlahBiaya: 0,
        totalBiaya: '',
        sisaLebih: '',
        sisaKurang: '',
        tanggalPengajuan: todayDate
    }

    const location = useLocation()
    const [lpj, setLpj] = useState([initialLpjState])
    const [nomorBS, setNomorBS] = useState(location.state?.nomorBS || '')    
    const [jumlahBS, setJumlahBS] = useState(location.state?.jumlahBS || '')
    const [project, setProject] = useState(location.state?.project || '')
    const [nomorJO, setNomorJO] = useState(location.state?.nomorJO || '')
    const [customer, setCustomer] = useState(location.state?.customer || '')
    const [lokasi, setLokasi] = useState(location.state?.lokasi || '')

    const [calculatedCosts, setCalculatedCosts] = useState({
        totalBiaya: 0,
        sisaLebih: 0,
        sisaKurang: 0
    })

    useEffect(() => {
        if (todayDate) {
            setLpj((prevLpj) =>
                prevLpj.map((item) => ({ ...item, tanggalPengajuan: todayDate }))
            )
        }
    }, [todayDate])

    const [selectedUnit, setSelectedUnit] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

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

    useEffect(() => {
        const today = new Date()
        const formattedDate = today.toISOString().split('T')[0]
        
        setTodayDate(formattedDate)

        const uid = localStorage.getItem('userUid')

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date)
    }

    const calculateCosts = (lpjItems, jumlahBS) => {
        // Calculate total biaya
        const totalBiaya = lpjItems.reduce((acc, item) => {
            const biaya = Number(item.biaya) || 0
            const jumlah = Number(item.jumlah) || 0
            return acc + (biaya * jumlah)
        }, 0)

        // Calculate sisa lebih atau kurang
        const sisaLebih = Math.max(0, jumlahBS - totalBiaya)
        const sisaKurang = Math.max(0, totalBiaya - jumlahBS)

        return {
            totalBiaya,
            sisaLebih,
            sisaKurang
        }
    }

    useEffect(() => {
        const costs = calculateCosts(lpj, jumlahBS)
        setCalculatedCosts(costs)
    }, [lpj, jumlahBS])

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
        const updatedLpj = lpj.map((item, i) => {
            if (i === index) {
                const cleanValue = value.replace(/\D/g, '')
                const numValue = Number(cleanValue)
                
                if (field === 'biaya') {
                    return { 
                        ...item, 
                        biaya: numValue,
                        jumlahBiaya: numValue * Number(item.jumlah || 0)
                    }
                } else if (field === 'jumlah') {
                    return { 
                        ...item, 
                        jumlah: numValue,
                        jumlahBiaya: Number(item.biaya || 0) * numValue
                    }
                }
                return { ...item, [field]: value }
            }
            return item
        })
        setLpj(updatedLpj)
    }

    const handleAddForm = () => {
        setLpj([
            ...lpj, 
            { ...initialLpjState }])
    }

    const handleRemoveForm = (index) => {
        const updatedLpj = lpj.filter((_, i) => i !== index)
        setLpj(updatedLpj)
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
        const unitCode = getUnitCode(selectedUnit.value)
                
        return `LPJ/MRO/${unitCode}/${year}${month}${day}/${sequence}`
    }

    const handleFileUpload = (index, event) => {
        const file = event.target.files[0]
        if (!file) return

        // Validate file size (250MB limit)
        if (file.size > 250 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 250MB')
            event.target.value = '' // Clear the file input
            return
        }

        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
            toast.error('Hanya file PDF yang diperbolehkan')
            event.target.value = '' // Clear the file input
            return
        }

        const updatedLpj = lpj.map((item, i) =>
            i === index 
                ? { 
                    ...item, 
                    lampiran: file.name, 
                    lampiranFile: file 
                } 
                : item
        )
        setLpj(updatedLpj)
    }

    const uploadAttachment = async (file, displayId) => {
        if (!file) return null

        try {
            // Create a reference to the storage location
            const storageRef = ref(
                storage, 
                `Lampiran_LPJ/MarketingOperasional/${displayId}/${file.name}`
            )

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file)
            
            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref)
            
            return downloadURL
        } catch (error) {
            console.error('Error uploading file:', error)
            toast.error('Gagal mengunggah lampiran')
            return null
        }
    }

    const handleSubmit = async () => {
        try {
            // Validasi form
            if (
                !userData.nama || !selectedUnit?.value || !nomorBS || !jumlahBS || !project || !nomorJO || !customer || !lokasi ||
                lpj.some((r) => !r.tanggal || !r.namaItem || !r.biaya || !r.jumlah || !r.lampiranFile)
            ) {
                toast.warning('Mohon lengkapi semua field yang wajib diisi!')
                return
            }

            // Generate display ID untuk user
            const displayId = generateDisplayId(userData.unit)
            
            // Upload attachments and collect download URLs
            const lpjWithUrls = await Promise.all(
                lpj.map(async (item) => {
                    const lampiranUrl = await uploadAttachment(item.lampiranFile, displayId)
                    return {
                        ...item,
                        lampiranUrl: lampiranUrl || '', 
                        lampiran: item.lampiran || '' 
                    }
                })
            )

            const lpjData = {
                user: {
                    uid: userData.uid,
                    nama: userData.nama,
                    bankName: userData.bankName,
                    accountNumber: userData.accountNumber,
                    unit: selectedUnit.value,
                    unitCode: getUnitCode(selectedUnit.value),
                    department: userData.department,
                    reviewer1: userData.reviewer1,
                    reviewer2: userData.reviewer2
                },
                lpj: lpjWithUrls.map((item) => ({
                    tanggal: item.tanggal,                    
                    namaItem: item.namaItem,
                    biaya: item.biaya,
                    jumlah: item.jumlah,
                    jumlahBiaya: Number(item.biaya) * Number(item.jumlah),
                    keterangan: item.keterangan,
                    lampiran: item.lampiran,
                    lampiranUrl: item.lampiranUrl
                })),
                displayId: displayId,
                kategori: 'Marketing/Operasional',
                status: 'Diajukan',
                approvedByReviewer1: false,
                approvedByReviewer2: false,
                approvedBySuperAdmin: false,
                rejectedBySuperAdmin: false,
                nomorBS: nomorBS,
                jumlahBS: jumlahBS,                                             
                project: project,                                             
                nomorJO: nomorJO,                                             
                customer: customer,                                             
                lokasi: lokasi,                                             
                ...calculatedCosts,
                tanggalPengajuan: todayDate,            
                statusHistory: [
                    {
                        status: 'Diajukan',
                        timestamp: new Date().toISOString(),
                        actor: userData.uid
                    }
                ]
            }

            // Simpan ke Firestore
            const docRef = await addDoc(collection(db, 'lpj'), lpjData)

            // Update dengan ID dokumen
            await setDoc(doc(db, 'lpj', docRef.id), { ...lpjData, id: docRef.id })

            // Reset unit bisnis ke unit awal untuk admin
            if (isAdmin) {
                setSelectedUnit({ value: userData.unit, label: userData.unit })
            }

            console.log('LPJ berhasil dibuat:', {
                firestoreId: docRef.id,
                displayId: displayId
            })
            toast.success('LPJ Marketing berhasil dibuat')

            // Reset form setelah berhasil submit
            resetForm()
        } catch (error) {
            console.error('Error submitting lpj:', error)
            toast.error('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.')
        }
    }

    const resetForm = () => {
        setLpj([initialLpjState])
        setNomorBS('')
        setJumlahBS(0)
        setProject('')
        setNomorJO('')
        setCustomer('')
        setLokasi('')
        setCalculatedCosts({
            totalBiaya: 0,
            sisaLebih: 0,
            sisaKurang: 0
        })
    }

    // Render file upload section for each lpj form
    const renderFileUpload = (index) => {
        const currentLpj = lpj[index]
        return (
            <div className="flex items-center">
                <input 
                    type="file" 
                    id={`file-upload-${index}`}
                    className="hidden" 
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(index, e)}
                />
                <label
                    htmlFor={`file-upload-${index}`}
                    className="h-10 px-4 py-2 bg-gray-200 border rounded-md cursor-pointer hover:bg-gray-300 hover:border-gray-400 transition duration-300 ease-in-out"
                >
                    Upload File
                </label>
                <span className="ml-4 text-gray-500">
                    {currentLpj.lampiran 
                        ? `File: ${currentLpj.lampiran}` 
                        : 'Format .pdf Max Size: 250MB'}
                </span>
            </div>
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

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">
                Tambah <span className="font-bold">LPJ Bon Sementara Marketing/Operasional</span>
            </h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-2 gap-6 mb-3">
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

                <div className="grid grid-cols-2 gap-6 mb-3">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Nomor Bon Sementara <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={nomorBS}
                            onChange={(e) => setNomorBS(e.target.value)}
                            placeholder="Masukkan nomor bon sementara"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Jumlah Bon Sementara <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={jumlahBS ? formatRupiah(jumlahBS) : ''}
                            onChange={(e) => {
                                const cleanValue = e.target.value.replace(/\D/g, '')
                                const value = Number(cleanValue)
                                if (value >= 0) {
                                    setJumlahBS(value)
                                }
                            }}
                            placeholder="Masukkan jumlah bon sementara tanpa Rp"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-3">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Project <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            placeholder="Masukkan nama project"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Nomor Job Order <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={nomorJO}
                            onChange={(e) => setNomorJO(e.target.value)}
                            placeholder="Masukkan nomor job order"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-3">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                            placeholder="Masukkan nama customer"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Lokasi <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="w-full h-10 px-4 py-2 border text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            type="text"
                            value={lokasi}
                            onChange={(e) => setLokasi(e.target.value)}
                            placeholder="Masukkan lokasi"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-3">
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
                        {lpj.map((lpj, index) => (
                            <div key={index} className="flex justify-stretch gap-2 mb-2">
                                <div className="flex-1">
                                    {index === 0 && (
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Lampiran <span className="text-red-500">*</span>
                                        </label>
                                    )}
                                    {renderFileUpload(index)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-300 my-6" />

                {lpj.map((item, index) => (
                    <div className="flex justify-stretch gap-2 mb-2" key={index}>
                        <div>
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Tanggal Kegiatan <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="date"
                                value={item.tanggal}
                                onChange={(e) => handleInputChange(index, 'tanggal', e.target.value)}
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                            />
                        </div>

                        <div className="flex-grow">
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Item <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="text"
                                value={item.namaItem}
                                onChange={(e) => handleInputChange(index, 'namaItem', e.target.value)}
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                            />
                        </div>

                        <div>
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Biaya <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="text"
                                value={formatRupiah(item.biaya)}
                                onChange={(e) => handleInputChange(index, 'biaya', e.target.value)}
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                            />
                        </div>

                        <div className='max-w-24'>
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">
                                    Jumlah <span className="text-red-500">*</span>
                                </label>
                            )}
                            <input
                                type="number"
                                value={item.jumlah}
                                onChange={(e) => {
                                    const inputValue = e.target.value
                                    const formattedValue = inputValue.replace(/^0+/, '') //Menghapus angka nol di depan
                                    const value = Number(formattedValue) // Mengonversi ke angka dan memeriksa apakah nilainya positif
                                    if (formattedValue === '' || value >= 0) {
                                        handleInputChange(index, 'jumlah', formattedValue)
                                    }
                                }}
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                            />
                        </div>

                        <div>
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">Keterangan</label>
                            )}
                            <input
                                type="text"
                                value={item.keterangan}
                                className="w-full border border-gray-300 text-gray-900 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none h-10 px-4 py-2"
                            />
                        </div>

                        <div>
                            {index === 0 && (
                                <label className="block text-gray-700 font-medium mb-2">Jumlah Biaya</label>
                            )}
                            <input
                                type="text"
                                value={formatRupiah(item.jumlahBiaya)}
                                className="w-full border border-gray-300 text-gray-900 rounded-md h-10 px-4 py-2 cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => handleRemoveForm(index)}
                                className="h-10 px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-md hover:bg-red-100"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={handleAddForm} className="text-red-600 font-bold underline cursor-pointer hover:text-red-700">
                    Tambah
                </button>

                {/* Bagian Total Biaya */}
                <div className="grid grid-cols-4 my-6">
                    <div></div>
                    <div></div>
                    <div className="text-left ">
                        <span>Total Biaya</span>
                        <br />
                        <span>Sisa Lebih Bon Sementara</span>
                        <br />
                        <span>Sisa Kurang Dibayarkan ke Pegawai</span>
                    </div>
                    <div className="text-left ">
                        <span>: {formatRupiah(calculatedCosts.totalBiaya || 0)}</span>
                        <br />
                        <span>: {formatRupiah(calculatedCosts.sisaLebih || 0)}</span>
                        <br />
                        <span>: {formatRupiah(calculatedCosts.sisaKurang || 0)}</span>
                    </div>
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

export default FormLpjMarketing
