import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../firebaseConfig'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore';

const AddUserForm = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        posisi: '',
        unit: '',
        akses: '',
        department: '',
        bankName: '',
        accountNumber: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Membuat user di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;
    
            // Mengupdate nama lengkap di Firebase Auth
            await updateProfile(user, { displayName: formData.nama });
    
            // Menyimpan data pengguna tambahan ke Firestore
            await addDoc(collection(db, "users"), {
                uid: user.uid,  
                nama: formData.nama,
                email: formData.email,
                posisi: formData.posisi,
                unit: formData.unit,
                akses: formData.akses,
                department: formData.department,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber
            });

            // Reset form setelah submit
            setFormData({
                nama: '',
                email: '',
                password: '',
                posisi: '',
                unit: '',
                akses: '',
                department: '',
                bankName: '',
                accountNumber: ''
            })
            navigate(-1) // Kembali ke halaman sebelumnya
        } catch (error) {
            console.error('Error adding user:', error)
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
                            <label className="block font-medium text-gray-700">User Akses</label>
                            <input
                                type="text"
                                name="akses"
                                value={formData.akses}
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
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUserForm
