import React, { useState } from 'react'

const ManageUser = ({
    data = {
        user: [
            {
                nama: 'Andi Ichwan Farmawan',
                email: 'ichwanfarmawan@gmail.com',
                posisi: 'Magang',
                unit: 'MJS',
                akses: 'Submit',
                departemen: 'Operation'
            },
            {
                nama: 'Rachmat Maulana',
                email: 'rachmatmaulana81669@gmail.com',
                posisi: 'Magang',
                unit: 'MJS',
                akses: 'Submit',
                departemen: 'GA/Umum'
            }
        ]
    },
    onEdit,
    onDelete
}) => {
    const [user, setUser] = useState(data.user)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const openModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleDelete = () => {
        if (selectedItem) {
            // Hapus item yang dipilih dari array user
        const updatedUserList = user.filter((item) => item !== selectedItem);
        
        // Update state user dengan data yang sudah dihapus
        setUser(updatedUserList);

        // Tutup modal setelah penghapusan
        closeModal();
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-medium mb-4">Manage user</h2>

            <div>
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Daftar Pengguna</h3>
                    <button className="px-8 py-2 mb-4 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200">
                        Tambah Data
                    </button>
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border w-14">No.</th>
                                <th className="px-4 py-2 border break-words">Nama</th>
                                <th className="px-4 py-2 border break-words">Email</th>
                                <th className="px-4 py-2 border break-words">Posisi</th>
                                <th className="px-4 py-2 border break-words">Unit Bisnis</th>
                                <th className="px-4 py-2 border break-words">User Akses</th>
                                <th className="px-4 py-2 border break-words">Departemen</th>
                                <th className="py-2 border text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border text-center">{index + 1}</td>
                                    <td className="px-4 py-2 border break-words">{item.nama}</td>
                                    <td className="px-4 py-2 border break-words">{item.email}</td>
                                    <td className="px-4 py-2 border break-words">{item.posisi}</td>
                                    <td className="px-4 py-2 border break-words">{item.unit}</td>
                                    <td className="px-4 py-2 border break-words">{item.akses}</td>
                                    <td className="px-4 py-2 border break-words">{item.departemen}</td>
                                    <td className="py-2 border text-center">
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                className="rounded-full p-1 bg-green-200 hover:bg-green-300 text-green-600 border-[1px] border-green-600"
                                                onClick={() => onEdit(item)}
                                                title="Edit"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    class="size-6"
                                                >
                                                    <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                                                </svg>
                                            </button>

                                            <button
                                                className="rounded-full p-1 bg-red-200 hover:bg-red-300 text-red-600 border-[1px] border-red-600"
                                                onClick={() => openModal(item)}
                                            title="Hapus"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="size-6"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Modal untuk konfirmasi hapus */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-medium">Konfirmasi Hapus</h3>
                        <p className="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus data ini?</p>

                        <div className="mt-4 flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                onClick={closeModal}
                            >
                                Batal
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={handleDelete}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageUser
