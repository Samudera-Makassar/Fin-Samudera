import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import Select from 'react-select'

const EditUserForm = () => {
    const navigate = useNavigate()
    const location = useLocation()
    
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        posisi: '',
        reviewer1: [],
        reviewer2: [],
        unit: '',
        role: '',
        department: [],
        bankName: '',
        accountNumber: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [reviewer1Options, setReviewer1Options] = useState([])
    const [reviewer2Options, setReviewer2Options] = useState([])

    // Options role
    const roleOptions = [
        { value: 'Employee', label: 'Employee' },
        { value: 'Reviewer', label: 'Reviewer' },
        { value: 'Admin', label: 'Admin' }
    ]

    // Options unit
    const unitOptions = [
        { value: 'PT Makassar Jaya Samudera', label: 'PT Makassar Jaya Samudera' },
        { value: 'PT Samudera Makassar Logistik', label: 'PT Samudera Makassar Logistik' },
        { value: 'PT Kendari Jaya Samudera', label: 'PT Kendari Jaya Samudera' },
        { value: 'PT Samudera Kendari Logistik', label: 'PT Samudera Kendari Logistik' },
        { value: 'PT Samudera Agencies Indonesia', label: 'PT Samudera Agencies Indonesia' },
        { value: 'PT Silkargo Indonesia', label: 'PT Silkargo Indonesia' },
        { value: 'PT PAD Samudera Indonesia', label: 'PT PAD Samudera Perdana' },
        { value: 'PT Masaji Kargosentra Tama', label: 'PT Masaji Kargosentra Tama' }
    ]

    // Options department
    const departmentOptions = [
        { value: 'Operation', label: 'Operation' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Finance', label: 'Finance' },
        { value: 'GA/Umum', label: 'GA/Umum' }
    ]

    // Options posisi
    const posisiOptions = [
        { value: 'Staff', label: 'Staff' },
        { value: 'Section Head', label: 'Section Head' },
        { value: 'Department Head', label: 'Department Head' },
        { value: 'General Manager', label: 'General Manager' },
        { value: 'Direktur', label: 'Direktur' }
    ]

    const getUidFromParams = () => {
        const params = new URLSearchParams(location.search);
        return params.get('uid'); // Mengambil UID dari parameter id
    };
    
    useEffect(() => {
        const fetchUserData = async () => {
            const uid = getUidFromParams(); // Ambil UID dari parameter
            if (!uid) {
                console.error('UID not found in URL');
                return;
            }
    
            const docRef = doc(db, 'users', uid); // Gunakan UID sebagai referensi
            try {
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const userData = docSnap.data();                    
                    setFormData({
                        ...userData,
                        reviewer1: userData.reviewer1 || [],
                        reviewer2: userData.reviewer2 || [],
                        department: userData.department || []                        
                    })
                } else {
                    console.error('User not found');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
    
        fetchUserData();
    }, [location]);
    

    // Mengambil data reviewer dari Firestore
    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'))
                const reviewerOptions = querySnapshot.docs
                    .map(doc => doc.data())
                    .filter(user => 
                        user.role === 'Reviewer'
                    )
                    .map(user => ({
                        value: user.nama,
                        label: user.nama,
                        uid: user.uid
                    }))                                 

                // Hapus pengguna yang sedang diedit dari opsi reviewer
                const currentUserName = formData.nama
                const filteredReviewerOptions = reviewerOptions.filter(option => option.value !== currentUserName)
                
                setReviewer1Options(filteredReviewerOptions)
                setReviewer2Options(filteredReviewerOptions)
                
                setFormData({
                    ...formData,
                    reviewer1: filteredReviewerOptions.filter((e) => formData.reviewer1.includes(e.uid)).map((e) => e.label) || [],
                    reviewer2: filteredReviewerOptions.filter((e) => formData.reviewer2.includes(e.uid)).map((e) => e.label) || [],
                })
            } catch (error) {
                console.error('Error fetching reviewers:', error)
            }
        }

        if (formData.nama) {
            fetchReviewers();
        }
    }, [formData.nama]);

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSelectChange = (selectedOption, field) => {
        const selectedValues = Array.isArray(selectedOption)
            ? selectedOption.map(option => option.label)
            : selectedOption?.label || '';
    
        if (field === 'role' && selectedOption?.value === 'admin') {
            // Jika role adalah admin, reset reviewer1 dan reviewer2
            setFormData({
                ...formData,
                reviewer1: [],
                reviewer2: [],
                [field]: selectedOption.value,
            });
        } else if (field === 'reviewer1' || field === 'reviewer2') {
            // Validasi untuk reviewer1 dan reviewer2
            const currentUserName = formData.nama;
    
            // Filter untuk memastikan reviewer bukan pengguna yang sedang diedit
            const filteredValues = Array.isArray(selectedValues)
                ? selectedValues.filter(value => value !== currentUserName)
                : selectedValues;
    
            if (field === 'reviewer1') {
                if (!filteredValues.length) {
                    alert('Reviewer 1 tidak boleh kosong.');
                    return; // Batalkan perubahan jika invalid
                }
                if (filteredValues.some(value => formData.reviewer2.includes(value))) {
                    alert('Reviewer 1 tidak boleh sama dengan Reviewer 2.');
                    return; // Batalkan perubahan jika invalid
                }
            }
    
            if (field === 'reviewer2') {
                if (!filteredValues.length) {
                    setFormData({
                        ...formData,
                        [field]: [] // Izinkan reviewer2 kosong
                    });
                    return;
                }
                if (filteredValues.some(value => formData.reviewer1.includes(value))) {
                    alert('Reviewer 2 tidak boleh sama dengan Reviewer 1.');
                    return; // Batalkan perubahan jika invalid
                }
            }
    
            setFormData({
                ...formData,
                [field]: filteredValues,
            });
        } else if (field === "department") {
            // Khusus untuk department
            setFormData({
                ...formData,
                [field]: Array.isArray(selectedOption)
                    ? selectedOption.map(option => option.value)
                    : selectedOption?.value || ''
            });
        } else {
            // Default handling untuk field lainnya
            setFormData({
                ...formData,
                [field]: Array.isArray(selectedOption)
                    ? selectedOption.map(option => option.value)
                    : selectedOption?.value || ''
            });
        }
    };    
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const uid = getUidFromParams()

        // Validasi untuk memastikan field selain reviewer2 tidak kosong
        const requiredFields = [
            'nama', 'email', 'password', 'posisi', 'unit', 'role', 'department', 'bankName', 'accountNumber', 'reviewer1'
        ];
        for (let field of requiredFields) {
            if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
                alert(`Field ${field} tidak boleh kosong.`);
                return;
            }
        }

        if (formData.reviewer1.some(r => formData.reviewer2.includes(r))) {
            alert('Reviewer 1 dan Reviewer 2 tidak boleh sama.')
            return
        }
        
        // Pemetaan reviewer dari nama ke UID
        const reviewer1Uids = formData.reviewer1.map(reviewerName => {
            const reviewer = reviewer1Options.find(option => option.label === reviewerName);
            return reviewer ? reviewer.uid : null;
        }).filter(uid => uid !== null); // Hanya ambil UID yang valid

        const reviewer2Uids = formData.reviewer2.map(reviewerName => {
            const reviewer = reviewer2Options.find(option => option.label === reviewerName);
            return reviewer ? reviewer.uid : null;
        }).filter(uid => uid !== null); // Hanya ambil UID yang valid

        // Update formData dengan UID
        const updatedFormData = {
            ...formData,
            reviewer1: reviewer1Uids,
            reviewer2: reviewer2Uids,
        };

        setIsSubmitting(true)

        try {    
            const userRef = doc(db, 'users', uid)
            await updateDoc(userRef, updatedFormData)
            alert('User berhasil diupdate.')
            navigate(-1)
        } catch (error) {
            console.error('Error updating user data:', error)
            alert('Gagal memperbarui user.')
        } finally {
        setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-medium mb-4">Ubah Data Pengguna</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <Select
                            name="role"
                            value={roleOptions.find(option => option.label === formData.role)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'role')}
                            options={roleOptions}
                            required
                            isClearable
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Unit Bisnis <span className="text-red-500">*</span>
                        </label>
                        <Select
                            name="unit"
                            value={unitOptions.find(option => option.value === formData.unit)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'unit')}
                            options={unitOptions}
                            required
                            isClearable
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Nama Bank <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Department <span className="text-red-500">*</span>
                        </label>
                        <Select
                            isMulti
                            name="department"
                            value={departmentOptions.filter(option => formData.department?.includes(option.label))}
                            onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'department')}
                            options={departmentOptions}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Nomor Rekening <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    {formData.role !== 'admin' && (
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">
                                Reviewer 1 <span className="text-red-500">*</span>
                            </label>
                            <Select
                                isMulti
                                name="reviewer1"
                                value={reviewer1Options.filter(option => formData.reviewer1?.includes(option.value))}
                                onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'reviewer1')}
                                options={reviewer1Options}
                                required
                                className="mt-1"
                            />
                        </div>
                    )}
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">
                            Posisi <span className="text-red-500">*</span>
                        </label>
                        <Select
                            name="posisi"
                            value={posisiOptions.find(option => option.label === formData.posisi)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'posisi')}
                            options={posisiOptions}
                            required
                            isClearable
                            className="mt-1"
                        />
                    </div>
                </div>
                {formData.role !== 'admin' && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Reviewer 2</label>
                            <Select
                                isMulti
                                name="reviewer2"
                                value={reviewer2Options.filter(option => formData.reviewer2?.includes(option.value))}
                                onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'reviewer2')}
                                options={reviewer2Options}                                
                                className="mt-1"
                            />
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-16 py-3 mr-4 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 hover:text-gray-700"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditUserForm
