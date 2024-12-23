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
        <div className="justify-between gap-4 mb-6 flex flex-row">
            <div className='flex flex-col w-full gap-4'>
                {/* Reimbursement Card */}
                <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
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
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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
            <div className='flex flex-col w-full gap-4'>
                {/* Reimbursement Card */}
                <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
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
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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
                    <div className="bg-gray-100 p-6 rounded-full">
                        <svg
                            className="w-8 h-8 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
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
        </div>
    )
}

export default ReportCard
