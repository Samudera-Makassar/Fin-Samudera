import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import EmptyState from '../assets/images/EmptyState.png';

const ReimbursementTable = ({ onCancel }) => {
    const [data, setData] = useState({ reimbursements: [] });
    const [userData, setUserData] = useState(null); // State untuk menyimpan data user
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndReimbursements = async () => {
            try {
                const uid = localStorage.getItem('userUid'); // Ambil UID dari localStorage

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage');
                    setLoading(false);
                    return;
                }

                // Fetch data user berdasarkan UID
                const userDocRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userDocRef);

                

                // Query reimbursement berdasarkan UID user
                const q = query(
                    collection(db, 'reimbursement'),
                    where('user.uid', '==', uid) // Filter data reimbursement berdasarkan UID user
                );

                const querySnapshot = await getDocs(q);
                const reimbursements = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setData({ reimbursements });
            } catch (error) {
                console.error('Error fetching user or reimbursements data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndReimbursements();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {data.reimbursements.length === 0 ? (
                // Jika belum ada data reimbursement
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Reimbursement Terakhir</h3>
                    <div className="flex justify-center">
                        <figure className="w-44 h-44">
                            <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                        </figure>
                    </div>
                </div>
            ) : (
                // Jika ada data reimbursement
                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Reimbursement Terakhir</h3>
                    <table className="min-w-full bg-white border rounded-lg text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Kategori Reimbursement</th>
                                <th className="px-4 py-2 border">Tanggal Pengajuan</th>
                                <th className="px-4 py-2 border">Jumlah</th>
                                <th className="py-2 border text-center">Status</th>
                                <th className="py-2 border text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.reimbursements.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 border">{item.id}</td>
                                    <td className="px-4 py-2 border">{item.kategori}</td>
                                    <td className="px-4 py-2 border">{item.tanggalPengajuan}</td>
                                    <td className="px-4 py-2 border">Rp. {item.totalBiaya.toLocaleString()}</td>
                                    <td className="py-2 border text-center">
                                        <span className={`px-4 py-1 rounded-full text-xs font-medium ${item.status === 'Disetujui' ? 'bg-green-200 text-green-800 border-[1px] border-green-600' : item.status === 'Diproses' ? 'bg-yellow-200 text-yellow-800 border-[1px] border-yellow-600' : 'bg-red-200 text-red-800 border-[1px] border-red-600'}`}>
                                            {item.status || 'Tidak Diketahui'}
                                        </span>
                                    </td>
                                    <td className="py-2 border text-center">
                                        <button 
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => onCancel(item)} 
                                        >
                                            Batalkan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReimbursementTable;
