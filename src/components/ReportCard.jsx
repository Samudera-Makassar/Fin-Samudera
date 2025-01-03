import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'

const ReportCard = () => {
    const [reimbursementCount, setReimbursementCount] = useState(0)
    const [bonSementaraCount, setBonSementaraCount] = useState(0)
    const [lpjCount, setLpjCount] = useState(0)

    useEffect(() => {
        const fetchReimbursementCount = async () => {
            try {
                const uid = localStorage.getItem('userUid')
                const userRole = localStorage.getItem('userRole')

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return
                }

                let reimbursements = []
                if (userRole === 'Super Admin') {
                    // Jika Super Admin, tampilkan semua reimbursement yang diproses
                    const q = query(collection(db, 'reimbursement'), where('status', 'in', ['Diproses', 'Diajukan']))
                    const querySnapshot = await getDocs(q)
                    reimbursements = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data()
                    }))
                } else {
                    // Untuk reviewer 1: hanya tampilkan reimbursement dengan status 'Diajukan'
                    const q1 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diajukan'),
                        where('user.reviewer1', 'array-contains', uid)
                    )

                    // Untuk reviewer 2: tampilkan reimbursement dengan status 'Diproses'
                    // yang sudah disetujui oleh reviewer 1
                    const q2 = query(
                        collection(db, 'reimbursement'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer2', 'array-contains', uid),
                        where('approvedByReviewer1Status', 'in', ['reviewer', 'superadmin'])
                    )

                    // Gabungkan hasil dari kedua query
                    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

                    reimbursements = [
                        ...snapshot1.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        })),
                        ...snapshot2.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        }))
                    ]

                    // Hapus duplikasi jika ada
                    reimbursements = Array.from(new Map(reimbursements.map((item) => [item.id, item])).values())
                }

                setReimbursementCount(reimbursements.length)
            } catch (error) {
                console.error('Error fetching reimbursement data:', error)
            }
        }

        const fetchBonSementaraCount = async () => {
            try {
                const uid = localStorage.getItem('userUid')
                const userRole = localStorage.getItem('userRole')

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return
                }

                let bonSementara = []
                if (userRole === 'Super Admin') {
                    // Jika Super Admin, tampilkan semua bon sementara yang diproses
                    const q = query(collection(db, 'bonSementara'), where('status', 'in', ['Diproses', 'Diajukan']))
                    const querySnapshot = await getDocs(q)
                    bonSementara = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data()
                    }))
                } else {
                    // Untuk reviewer 1: hanya tampilkan bonSementara dengan status 'Diajukan'
                    const q1 = query(
                        collection(db, 'bonSementara'),
                        where('status', '==', 'Diajukan'),
                        where('user.reviewer1', 'array-contains', uid)
                    )

                    // Untuk reviewer 2: tampilkan bonSementara dengan status 'Diproses'
                    // yang sudah disetujui oleh reviewer 1
                    const q2 = query(
                        collection(db, 'bonSementara'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer2', 'array-contains', uid),
                        where('approvedByReviewer1Status', 'in', ['reviewer', 'superadmin'])
                    )
                    // Gabungkan hasil dari kedua query
                    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

                    bonSementara = [
                        ...snapshot1.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        })),
                        ...snapshot2.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        }))
                    ]

                    // Hapus duplikasi jika ada
                    bonSementara = Array.from(new Map(bonSementara.map((item) => [item.id, item])).values())
                }

                setBonSementaraCount(bonSementara.length)
            } catch (error) {
                console.error('Error fetching bon sementara data:', error)
            }
        }

        const fetchLpjCount = async () => {
            try {
                const uid = localStorage.getItem('userUid')
                const userRole = localStorage.getItem('userRole')

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return
                }

                let lpj = []
                if (userRole === 'Super Admin') {
                    // Jika Super Admin, tampilkan semua lpj yang diproses
                    const q = query(collection(db, 'lpj'), where('status', 'in', ['Diproses', 'Diajukan']))
                    const querySnapshot = await getDocs(q)
                    lpj = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data()
                    }))
                } else {
                    // Untuk reviewer 1: hanya tampilkan lpj dengan status 'Diajukan'
                    const q1 = query(
                        collection(db, 'lpj'),
                        where('status', '==', 'Diajukan'),
                        where('user.reviewer1', 'array-contains', uid)
                    )

                    // Untuk reviewer 2: tampilkan lpj dengan status 'Diproses'
                    // yang sudah disetujui oleh reviewer 1
                    const q2 = query(
                        collection(db, 'lpj'),
                        where('status', '==', 'Diproses'),
                        where('user.reviewer2', 'array-contains', uid),
                        where('approvedByReviewer1Status', 'in', ['reviewer', 'superadmin'])
                    )

                    // Gabungkan hasil dari kedua query
                    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)])

                    lpj = [
                        ...snapshot1.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        })),
                        ...snapshot2.docs.map((doc) => ({
                            id: doc.id,
                            displayId: doc.data().displayId,
                            ...doc.data()
                        }))
                    ]

                    // Hapus duplikasi jika ada
                    lpj = Array.from(new Map(lpj.map((item) => [item.id, item])).values())
                }

                setLpjCount(lpj.length)
            } catch (error) {
                console.error('Error fetching lpj data:', error)
            }
        }

        fetchReimbursementCount()
        fetchBonSementaraCount()
        fetchLpjCount()
    }, [])

    return (
        <div className='flex flex-col w-full gap-4 h-full'>
            {/* Reimbursement Card */}
            <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-8 text-white"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-lg font-medium text-gray-500">Reimbursement</p>
                    <div className="text-4xl font-bold">{reimbursementCount || 0}</div>
                    <p className="text-sm text-gray-500">Laporan Perlu Ditanggapi</p>
                </div>
            </div>
            {/* Nomor Bon Sementara Card */}
            <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                <div className="bg-gradient-to-r from-teal-400 to-green-500 p-6 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-8 text-white"
                    >
                        <path stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v7.5m2.25-6.466a9.016 9.016 0 0 0-3.461-.203c-.536.072-.974.478-1.021 1.017a4.559 4.559 0 0 0-.018.402c0 .464.336.844.775.994l2.95 1.012c.44.15.775.53.775.994 0 .136-.006.27-.018.402-.047.539-.485.945-1.021 1.017a9.077 9.077 0 0 1-3.461-.203M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-lg font-medium text-gray-500">Nomor Bon Sementara</p>
                    <div className="text-4xl font-bold">{bonSementaraCount || 0}</div>
                    <p className="text-sm text-gray-500">Pengajuan Perlu Ditanggapi</p>
                </div>
            </div>

            {/* LPJ Bon Sementara Card */}
            <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-8 text-white"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-lg font-medium text-gray-500">LPJ Bon Sementara</p>
                    <div className="text-4xl font-bold">{lpjCount || 0}</div>
                    <p className="text-sm text-gray-500">Laporan Perlu Ditanggapi</p>
                </div>
            </div>
        </div>
    )
}

export default ReportCard
