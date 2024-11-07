import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditUserForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState(location.state?.user || {});

    useEffect(() => {
        if (!location.state?.user) {
            console.error('No user data found');
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Updated User Data:', formData);
        navigate(-1); // Kembali ke halaman sebelumnya
    };

    // if (!location.state?.user) {
    //     return <div className='py-8'>Pengguna tidak ditemukan atau data tidak tersedia.</div>;
    // }

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
                        className="px-16 py-3 mr-4 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 hover:text-gray-700">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="px-16 py-3 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserForm;
