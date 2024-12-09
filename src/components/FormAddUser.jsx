import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { collection, doc, setDoc, getDocs, query, where, or } from 'firebase/firestore'
import Select from 'react-select'
import { v4 as uuidv4 } from 'uuid'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
    const [reviewerOptions, setReviewerOptions] = useState([])

    // Fetch reviewers from Firestore
    const fetchReviewers = async () => {
        try {
            const q = query(collection(db, 'users'), where('role', '==', 'Reviewer'))
            // const q = query(
            //     collection(db, 'reimbursement'),
            //     or(where('reviewer1', "array-contains", uid),
            //     where('reviewer2', 'array-contains', uid)
            //     ))
            // const q = query(collection(db, 'medical'), where('reviewer1', "array-contains", uid))

            const querySnapshot = await getDocs(q)

            const reviewers = querySnapshot.docs.map((doc) => ({
                value: doc.data().nama,
                label: doc.data().nama,
                uid: doc.data().uid
            }))

            setReviewerOptions(reviewers)
        } catch (error) {
            console.error('Error fetching reviewer options:', error)
        }
    }

    useEffect(() => {
        fetchReviewers()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSelectChange = (selectedOption, field) => {
        if (field === 'role' && selectedOption?.value === 'Super Admin') {
            setFormData({
                ...formData,
                role: 'Super Admin',
                unit: '', 
                posisi: '', 
                department: [], 
                bankName: '', 
                accountNumber: '', 
                reviewer1: [],
                reviewer2: [],
                [field]: selectedOption.value
            })
        } else if (field === 'department') {
            setFormData({
                ...formData,
                [field]: Array.isArray(selectedOption)
                    ? selectedOption.map((option) => option.value)
                    : selectedOption?.value || ''
            })
        } else {
            setFormData({
                ...formData,
                [field]: Array.isArray(selectedOption)
                    ? selectedOption.map((option) => option.uid)
                    : selectedOption?.value || ''
            })
        }
    }

    const checkEmailExists = async (email) => {
        const q = query(collection(db, 'users'), where('email', '==', email))
        const querySnapshot = await getDocs(q)
        return !querySnapshot.empty
    }

    const uid = uuidv4()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validasi untuk memastikan tidak ada field yang kosong selain reviewer2
            let fieldsToValidate = []
            if (formData.role === 'Super Admin') {
                // For Super Admin, only validate these fields
                fieldsToValidate = [
                    { name: 'nama', label: 'Nama' },
                    { name: 'email', label: 'Email' },
                    { name: 'password', label: 'Password' },
                    { name: 'role', label: 'Role' }
                ]
            } else {
                // For other roles, validate all fields
                fieldsToValidate = [
                    { name: 'nama', label: 'Nama' },
                    { name: 'email', label: 'Email' },
                    { name: 'password', label: 'Password' },
                    { name: 'posisi', label: 'Posisi' },
                    { name: 'unit', label: 'Unit Bisnis' },
                    { name: 'role', label: 'Role' },
                    { name: 'department', label: 'Department' },
                    { name: 'bankName', label: 'Nama Bank' },
                    { name: 'accountNumber', label: 'Nomor Rekening' },
                    { name: 'reviewer1', label: 'Reviewer 1' }
                ]
            }

            for (let field of fieldsToValidate) {
                if (!formData[field.name] || (Array.isArray(formData[field.name]) && formData[field.name].length === 0)) {
                    toast.warning(`${field.label} tidak boleh kosong`)
                    setIsSubmitting(false)
                    return
                }
            }

            // Validasi untuk memastikan reviewer1 dan reviewer2 tidak sama
            if (formData.reviewer1.some((r) => formData.reviewer2.includes(r))) {
                toast.warning('Reviewer 1 dan Reviewer 2 tidak boleh sama')
                setIsSubmitting(false)
                return
            }

            const emailExists = await checkEmailExists(formData.email)
            if (emailExists) {
                toast.warning('Email sudah terdaftar. Gunakan email lain')
                setIsSubmitting(false)
                return
            }            

            // Menyimpan data pengguna ke Firestore tanpa menambahkan user ke Firebase Auth
            await setDoc(doc(db, 'users', uid), {
                uid,
                nama: formData.nama,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                posisi: formData.role === 'Super Admin' ? '' : formData.posisi,
                unit: formData.role === 'Super Admin' ? '' : formData.unit,
                department: formData.role === 'Super Admin' ? [] : formData.department,
                bankName: formData.role === 'Super Admin' ? '' : formData.bankName,
                accountNumber: formData.role === 'Super Admin' ? '' : formData.accountNumber,
                reviewer1: formData.role === 'Super Admin' ? [] : formData.reviewer1,
                reviewer2: formData.role === 'Super Admin' ? [] : formData.reviewer2,
            })

            toast.success('Pengguna berhasil ditambahkan')

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
            toast.error('Gagal menambahkan pengguna. Silakan coba lagi')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Options role
    const roleOptions = [
        { value: 'Employee', label: 'Employee' },
        { value: 'Reviewer', label: 'Reviewer' },
        { value: 'Admin', label: 'Admin' },
        { value: 'Super Admin', label: 'Super Admin' }
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

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-medium mb-4">Tambah Pengguna</h3>
                <form onSubmit={handleSubmit}>
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="role"
                                options={roleOptions}
                                className="basic-single-select mt-1"
                                classNamePrefix="select"
                                onChange={(selectedOption) => handleSelectChange(selectedOption, 'role')}
                                isMulti={false}
                                isClearable                                
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
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}                                
                                className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Unit Bisnis <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Select
                                        name="unit"
                                        options={unitOptions}
                                        className="basic-single-select mt-1"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'unit')}
                                        isMulti={false}
                                        isClearable                                    
                                    />
                                </div>
                            </div>
                        )}
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Nama Bank <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}                                
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    name="department"
                                    options={departmentOptions}
                                    className="basic-multi-select mt-1"
                                    classNamePrefix="select"
                                    onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'department')}                                
                                />
                            </div>
                        )}
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Nomor Rekening <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}                                
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Reviewer 1 <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    isMulti
                                    name="reviewer1"
                                    options={reviewerOptions}
                                    className="basic-multi-select mt-1"
                                    classNamePrefix="select"
                                    onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'reviewer1')}                                    
                                />
                            </div>
                        )}
                        {formData.role !== 'Super Admin' && (
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Posisi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Select
                                        name="posisi"
                                        options={posisiOptions}
                                        className="basic-single-select mt-1"
                                        classNamePrefix="select"
                                        onChange={(selectedOption) => handleSelectChange(selectedOption, 'posisi')}
                                        isMulti={false}
                                        isClearable                                    
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {formData.role !== 'Super Admin' && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="mb-2">
                                <label className="block font-medium text-gray-700">
                                    Reviewer 2 (Kosongkan jika pengguna hanya memiliki 1 Reviewer)
                                </label>
                                <Select
                                    isMulti
                                    name="reviewer2"
                                    options={reviewerOptions}
                                    className="basic-multi-select mt-1"
                                    classNamePrefix="select"
                                    onChange={(selectedOptions) => handleSelectChange(selectedOptions, 'reviewer2')}
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
                            type="submit"
                            className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
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

export default AddUserForm
