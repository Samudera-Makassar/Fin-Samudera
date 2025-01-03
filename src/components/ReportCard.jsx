import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'

const ReportCard = () => {
    const [reimbursementCount, setReimbursementCount] = useState(0)
    const [bonSementaraCount, setBonSementaraCount] = useState(0)
    const [lpjCount, setLpjCount] = useState(0)
    const [userRole, setUserRole] = useState('')

    useEffect(() => {
        const role = localStorage.getItem('userRole')
        setUserRole(role)

        if (role === 'Super Admin') {
            return
        }

        const fetchCounts = async (collectionName) => {
            try {
                const uid = localStorage.getItem('userUid')

                if (!uid) {
                    console.error('UID tidak ditemukan di localStorage')
                    return []
                }

                let queries = []

                // Query untuk dokumen yang user sebagai validator
                const validatorQuery = query(
                    collection(db, collectionName),
                    where('status', '==', 'Diajukan'),
                    where('user.validator', 'array-contains', uid)
                )
                queries.push(getDocs(validatorQuery))

                // Query untuk dokumen yang user sebagai reviewer1
                const r1Query = query(
                    collection(db, collectionName),
                    where('status', '==', 'Divalidasi'),
                    where('user.reviewer1', 'array-contains', uid)
                )
                queries.push(getDocs(r1Query))

                // Query untuk dokumen yang user sebagai reviewer2
                const r2Query = query(
                    collection(db, collectionName),
                    where('status', '==', 'Diproses'),
                    where('user.reviewer2', 'array-contains', uid),
                    where('approvedByReviewer1Status', 'in', ['reviewer', 'superadmin'])
                )
                queries.push(getDocs(r2Query))

                const snapshots = await Promise.all(queries)
                let documents = snapshots.flatMap((snapshot) =>
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        displayId: doc.data().displayId,
                        ...doc.data()
                    }))
                )

                // Hapus duplikasi
                documents = Array.from(new Map(documents.map((item) => [item.id, item])).values())
                return documents
            } catch (error) {
                console.error(`Error fetching ${collectionName} data:`, error)
                return []
            }
        }

        const updateCounts = async () => {
            const reimbursements = await fetchCounts('reimbursement')
            const bonSementara = await fetchCounts('bonSementara')
            const lpj = await fetchCounts('lpj')

            setReimbursementCount(reimbursements.length)
            setBonSementaraCount(bonSementara.length)
            setLpjCount(lpj.length)
        }

        updateCounts()
    }, [])

    const containerClassName =
        userRole === 'Reviewer'
            ? 'justify-between gap-4 mb-6 flex flex-row'
            : 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'

    return (
        <div className={containerClassName}>
            {userRole === 'Reviewer' ? (
                <div className="flex flex-col w-full gap-4 h-full">
                    {/* Reimbursement Card */}
                    <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
                        <div className="bg-gray-100 p-6 rounded-full">
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
                                    d="M8.25 9.75h4.875a2.625 2.625 0 0 1 0 5.25H12M8.25 9.75 10.5 7.5M8.25 9.75 10.5 12m9-7.243V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z"
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
                        <div className="bg-gradient-to-r from-teal-400 to-green-500 p-6 rounded-full">
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
            ) : (
                <>
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
                </>
            )}
        </div>
    )
}

export default ReportCard
