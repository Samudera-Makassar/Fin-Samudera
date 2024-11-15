import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore'

const AddUserForm = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
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
                accountNumber: formData.accountNumber
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
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div className="mb-2">
                            <label className="block font-medium text-gray-700">Unit Bisnis</label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
                            <label className="block font-medium text-gray-700">Posisi</label>
                            <input
                                type="text"
                                name="posisi"
                                value={formData.posisi}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
