import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore'
import Select from 'react-select'

const AddUserForm = () => {
    const navigate = useNavigate()

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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleRoleChange = (selectedOptions) => {
        setFormData({
            ...formData,
            role: Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value) // Jika array
                : selectedOptions?.value || '' // Jika objek tunggal
        })
    }

    const handleUnitChange = (selectedOptions) => {
        setFormData({
            ...formData,
            unit: Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value) // Jika array
                : selectedOptions?.value || '' // Jika objek tunggal
        })
    }

    const handleReviewer1Change = (selectedOptions) => {
        setFormData({
            ...formData,
            reviewer1: selectedOptions.map((option) => option.value) // Simpan hanya value
        })
    }

    const handleReviewer2Change = (selectedOptions) => {
        setFormData({
            ...formData,
            reviewer2: selectedOptions.map((option) => option.value) // Simpan hanya value
        })
    }

    // Handle change for React Select
    const handleDepartmentChange = (selectedOptions) => {
        setFormData({
            ...formData,
            department: selectedOptions.map((option) => option.value) // Simpan hanya value
        })
    }

    const handlePosisiChange = (selectedOptions) => {
        setFormData({
            ...formData,
            posisi: Array.isArray(selectedOptions)
                ? selectedOptions.map((option) => option.value) // Jika array
                : selectedOptions?.value || '' // Jika objek tunggal
        })
    }

    const checkEmailExists = async (email) => {
        const q = query(collection(db, 'users'), where('email', '==', email))
        const querySnapshot = await getDocs(q)
        return !querySnapshot.empty
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const emailExists = await checkEmailExists(formData.email)
            if (emailExists) {
                alert('Email sudah terdaftar. Gunakan email lain.')
                setIsSubmitting(false)
                return
            }

            // Menyimpan data pengguna ke Firestore tanpa menambahkan user ke Firebase Auth
            await setDoc(doc(db, 'users', formData.email), {
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                posisi: formData.posisi,
                unit: formData.unit,
                role: formData.role,
                department: formData.department,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                reviewer1: formData.reviewer1,
                reviewer2: formData.reviewer2
            })

            alert('User berhasil ditambahkan.')

            // Reset form setelah submit
            setFormData({
                nama: '',
                email: '',
                password: '',
                posisi: '',
                unit: '',
                role: '',
                department: [],
                bankName: '',
                accountNumber: '',
                reviewer1: [],
                reviewer2: []
            })
            navigate(-1) // Kembali ke halaman sebelumnya
        } catch (error) {
            console.error('Error adding user:', error)
            alert('Gagal menambahkan user. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

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

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-medium mb-4">Tambah Pengguna</h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Role</label>
                            <Select
                                name="role"
                                options={roleOptions}
                                className="basic-single-select mt-1"
                                classNamePrefix="select"
                                onChange={handleRoleChange}
                                isMulti={false}
                                isClearable
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Unit Bisnis</label>
                            <div className="relative">
                                <Select
                                    name="unit"
                                    options={unitOptions}
                                    className="basic-single-select mt-1"
                                    classNamePrefix="select"
                                    onChange={handleUnitChange}
                                    isMulti={false}
                                    isClearable
                                />
                            </div>
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Department</label>
                            <Select
                                isMulti
                                name="department"
                                options={departmentOptions}
                                className="basic-multi-select mt-1"
                                classNamePrefix="select"
                                onChange={handleDepartmentChange}
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Reviewer 1</label>
                            <Select
                                isMulti
                                name="unit"
                                options={reviewer1Options}
                                className="basic-multi-select mt-1"
                                classNamePrefix="select"
                                onChange={handleReviewer1Change}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Posisi</label>
                            <div className="relative">
                                <Select
                                    name="posisi"
                                    options={posisiOptions}
                                    className="basic-single-select mt-1"
                                    classNamePrefix="select"
                                    onChange={handlePosisiChange}
                                    isMulti={false}
                                    isClearable
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Reviewer 2</label>
                            <Select
                                isMulti
                                name="unit"
                                options={reviewer2Options}
                                className="basic-multi-select mt-1"
                                classNamePrefix="select"
                                onChange={handleReviewer2Change}
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
                            type="submit"
                            className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUserForm
