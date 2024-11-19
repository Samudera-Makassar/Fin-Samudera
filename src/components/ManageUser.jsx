import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'

const ManageUser = () => {
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10 // Jumlah item per halaman
    const navigate = useNavigate()

    // Fungsi untuk mengambil data dari Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            const querySnapshot = await getDocs(collection(db, 'users'))
            const usersData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))

            setUsers(usersData) // Set data yang ada di Firestore
        }

        fetchUsers()
    }, [])
    
    const handleEdit = (uid) => {        
        navigate(`/manage-users/edit?uid=${uid}`)
    }

    // Fungsi untuk menghapus data dari Firestore
    const handleDelete = async (uid) => {
        const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')
        if (confirmDelete) {
            try {
                // Mencari dokumen berdasarkan uid
                const querySnapshot = await getDocs(collection(db, 'users'))
                const userDoc = querySnapshot.docs.find((doc) => doc.data().uid === uid)

                if (userDoc) {
                    // Menghapus dokumen berdasarkan ID dokumen yang ditemukan
                    await deleteDoc(doc(db, 'users', userDoc.id))
                    setUsers(users.filter((user) => user.uid !== uid))
                    alert('Pengguna berhasil dihapus.')
                } else {
                    alert('Pengguna tidak ditemukan.')
                }
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('Gagal menghapus pengguna.')
            }
        }
    }

    // Fungsi untuk menangani input pencarian
    const handleSearch = (event) => {
        setSearchTerm(event.target.value)
        setCurrentPage(1) // Reset ke halaman pertama saat melakukan pencarian
    }

    // Filter data pengguna berdasarkan nilai pencarian
    const filteredUsers = users.filter((user) => {
        const searchTermLower = searchTerm.toLowerCase()
    
        // Filter hanya berdasarkan nama dan email
        return (
            user.nama.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower)
        )
    })

    // Menghitung total halaman
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    // Mendapatkan data pengguna untuk halaman saat ini
    const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Fungsi untuk berpindah ke halaman berikutnya
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    // Fungsi untuk berpindah ke halaman sebelumnya
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                <h3 className="text-xl font-medium mb-4">Daftar Pengguna</h3>

                <div className="flex items-center justify-between mb-4 gap-4">
                    <input
                        type="text"
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />

                    <Link to="/manage-users/add">
                        <button className="px-8 py-2 bg-red-600 text-white rounded hover:bg-red-700 hover:text-gray-200">
                            Tambah Data
                        </button>
                    </Link>
                </div>

                <table className="min-w-full bg-white border rounded-lg text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2 border w-14">No.</th>
                            <th className="px-4 py-2 border break-words">Nama</th>
                            <th className="px-4 py-2 border break-words">Email</th>
                            <th className="px-4 py-2 border break-words">Posisi</th>
                            <th className="px-4 py-2 border break-words">Unit Bisnis</th>
                            <th className="px-4 py-2 border break-words">Role</th>
                            <th className="px-4 py-2 border break-words">Department</th>
                            <th className="py-2 border text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user, index) => (
                            <tr key={user.id}>
                                <td className="px-4 py-2 border text-center">
                                    {index + 1 + (currentPage - 1) * itemsPerPage}
                                </td>
                                <td className="px-4 py-2 border">{user.nama}</td>
                                <td className="px-4 py-2 border">{user.email}</td>
                                <td className="px-4 py-2 border">{user.posisi}</td>
                                <td className="px-4 py-2 border">{user.unit}</td>
                                <td className="px-4 py-2 border">{user.role}</td>
                                <td className="px-4 py-2 border">{Array.isArray(user.department) ? user.department.join(', ') : user.department}</td>
                                <td className="py-2 border text-center">
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            onClick={() => handleEdit(user.uid)}
                                            className="rounded-full p-1 bg-green-200 hover:bg-green-300 text-green-600 border-[1px] border-green-600"
                                            title="Edit"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="size-6"
                                            >
                                                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.uid)}
                                            className="rounded-full p-1 bg-red-200 hover:bg-red-300 text-red-600 border-[1px] border-red-600"
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
                                                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.06V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.309c.827-.035 1.66-.06 2.5-.06Zm2.5 5.25a.75.75 0 0 1 1.5 0v5.25a.75.75 0 0 1-1.5 0V9.25Zm-4.75-.75a.75.75 0 0 0-.75.75v5.25a.75.75 0 0 0 1.5 0V9.25a.75.75 0 0 0-.75-.75Z"
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

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    {/* Tombol Previous */}
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 px-3 py-2 rounded ${
                            currentPage === 1
                                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 hover:text-gray-200'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                        </svg>    
                        Previous
                    </button>

                    {/* Tombol Halaman */}
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-full ${
                                currentPage === page
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Tombol Next */}
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 px-3 py-2 rounded ${
                            currentPage === totalPages
                                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 hover:text-gray-200'
                        }`}
                    >
                        Next
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ManageUser
