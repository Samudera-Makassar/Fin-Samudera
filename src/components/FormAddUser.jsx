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
        posisi: 'staff',
        reviewer1: [],
        reviewer2: [],
        unit: 'MJS',
        role: 'employee',
        department: '',
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
                department: '',
                bankName: '',
                accountNumber: ''
            })
            navigate(-1) // Kembali ke halaman sebelumnya
        } catch (error) {
            console.error('Error adding user:', error)
            alert('Gagal menambahkan user. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

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
    const department = [
        { value: 'operation', label: 'Operation' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'finance', label: 'Finance' },
        { value: 'umum', label: 'GA/Umum' }
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Role</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md bg-white p-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="reviewer">Reviewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Unit Bisnis</label>
                            <div className="relative">
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md bg-white p-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    <option value="MJS">PT Makassar Jaya Samudera</option>
                                    <option value="SML">PT Samudera Makassar Logistik</option>
                                    <option value="KJS">PT Kendari Jaya Samudera</option>
                                    <option value="SKL">PT Samudera Kendari Logistik</option>
                                    <option value="SAI">PT Samudera Agencies Indonesia</option>
                                    <option value="SKI">PT Silkargo Indonesia</option>
                                    <option value="SP">PT PAD Samudera Perdana</option>
                                    <option value="MKT">PT Masaji Kargosentra Tama</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Department</label>
                            <Select
                                isMulti
                                name="department"
                                options={department}
                                className="basic-multi-select"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={handleReviewer1Change}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Posisi</label>
                            <div className="relative">
                                <select
                                    name="posisi"
                                    value={formData.posisi}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md bg-white p-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="sectionHead">Section Head</option>
                                    <option value="deptHead">Dept Head</option>
                                    <option value="GM">General Manager</option>
                                    <option value="Direktur">Direktur</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
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
                                className="basic-multi-select"
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
