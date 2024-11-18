import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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

    // Options role
    const roleOptions = [
        { value: 'employee', label: 'Employee' },
        { value: 'reviewer', label: 'Reviewer' },
        { value: 'admin', label: 'Admin' }
    ]

    // Options unit
    const unitOptions = [
        { value: 'MJS', label: 'PT Makassar Jaya Samudera' },
        { value: 'SML', label: 'PT Samudera Makassar Logistik' },
        { value: 'KJS', label: 'PT Kendari Jaya Samudera' },
        { value: 'SKL', label: 'PT Samudera Kendari Logistik' },
        { value: 'SAI', label: 'PT Samudera Agencies Indonesia' },
        { value: 'SKI', label: 'PT Silkargo Indonesia' },
        { value: 'SP', label: 'PT PAD Samudera Perdana' },
        { value: 'MKT', label: 'PT Masaji Kargosentra Tama' }
    ]

    // Options department
    const departmentOptions = [
        { value: 'operation', label: 'Operation' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
        { value: 'umum', label: 'GA/Umum' }
    ]

    // Options posisi
    const posisiOptions = [
        { value: 'staff', label: 'Staff' },
        { value: 'sectionHead', label: 'Section Head' },
        { value: 'deptHead', label: 'Dept Head' },
        { value: 'GM', label: 'General Manager' },
        { value: 'Direktur', label: 'Direktur' }
    ]

    // Options reviewer 1
    const reviewer1Options = [
        { value: 'wahyu', label: 'Wahyu Hermawan' },
        { value: 'joko', label: 'Joko Susilo' },
        { value: 'bernard', label: 'Bernard Hutagaol' },
        { value: 'yusuf', label: 'Muh Yusuf' },
        { value: 'agus', label: 'Agussalim' },
        { value: 'fitri', label: 'Fitrityanti Jufri' },
        { value: 'siti', label: 'Siti Muliana' },
        { value: 'arham', label: 'Arham Jailani' },
        { value: 'utami', label: 'Utami Warastiti' },
        { value: 'saipul', label: 'Saipul Miraj' },
        { value: 'iswan', label: 'Iswan Afandi' },
        { value: 'agusri', label: 'Agusri' },
        { value: 'erlangga', label: 'Erlangga Putra' },
        { value: 'halim', label: 'Muhammad Halim' },
        { value: 'irwansyah', label: 'Irwansyah Dahlan' },
        { value: 'milda', label: 'Mildawaty Kahar' }
    ]

    // Options reviewer 2
    const reviewer2Options = [
        { value: 'wahyu', label: 'Wahyu Hermawan' },
        { value: 'joko', label: 'Joko Susilo' },
        { value: 'bernard', label: 'Bernard Hutagaol' }
    ]

    const getEmailFromParams = () => {
        const params = new URLSearchParams(location.search)
        return atob(params.get('email')) // Dekripsi email dengan atob
    }

    useEffect(() => {
        const fetchUserData = async () => {
            const email = getEmailFromParams()
            const docRef = doc(db, 'users', email)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const userData = docSnap.data()
                setFormData({
                    ...userData,
                    reviewer1: userData.reviewer1 || [], 
                    reviewer2: userData.reviewer2 || [], 
                    department: userData.department || [] 
                })
            } else {
                console.error('User not found')
            }
        }
        fetchUserData()
    }, [location])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSelectChange = (selectedOption, field) => {
        setFormData({
            ...formData,
            [field]: Array.isArray(selectedOption)
                ? selectedOption.map(option => option.value)
                : selectedOption?.value || ''
        });
    }    
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const email = getEmailFromParams()
        try {    
            const userRef = doc(db, 'users', email)
            await updateDoc(userRef, formData)
            alert('User berhasil diupdate.')
            navigate(-1)
        } catch (error) {
            console.error('Error updating user data:', error)
            alert('Gagal memperbarui user.')
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-medium mb-4">Ubah Data Pengguna</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Nama Lengkap</label>
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
                        <label className="block font-medium text-gray-700">Role</label>
                        <Select
                            name="role"
                            value={roleOptions.find(option => option.value === formData.role)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'role')}
                            options={roleOptions}
                            required
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Email</label>
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
                        <label className="block font-medium text-gray-700">Unit Bisnis</label>
                        <Select
                            name="unit"
                            value={unitOptions.find(option => option.value === formData.unit)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'unit')}
                            options={unitOptions}
                            required
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Password</label>
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
                        <label className="block font-medium text-gray-700">Nama Bank</label>
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
                        <label className="block font-medium text-gray-700">Department</label>
                        <Select
                            isMulti
                            name="department"
                            value={departmentOptions.filter(option => formData.department?.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'department')}
                            options={departmentOptions}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Nomor Rekening</label>
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
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Reviewer 1</label>
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
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Posisi</label>
                        <Select
                            name="posisi"
                            value={posisiOptions.find(option => option.value === formData.posisi)}
                            onChange={(selectedOption) => handleSelectChange(selectedOption, 'posisi')}
                            options={posisiOptions}
                            required
                            className="mt-1"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="mb-2">
                        <label className="block font-medium text-gray-700">Reviewer 2</label>
                        <Select
                            isMulti
                            name="reviewer2"
                            value={reviewer2Options.filter(option => formData.reviewer2?.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'reviewer2')}
                            options={reviewer2Options}
                            required
                            className="mt-1"
                        />
                    </div>
                </div>
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
