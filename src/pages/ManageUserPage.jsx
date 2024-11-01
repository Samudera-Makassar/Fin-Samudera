import React, { useEffect } from 'react'
import Layout from './Layout'
import ManageUser from '../components/ManageUser'

const ManageUserPage = () => {
    useEffect(() => {
        document.title = 'Cek Reimbursement - Samudera Indonesia'
    }, [])

    return (
        <div>
            <Layout>
                <ManageUser />
            </Layout>
        </div>
    )
}

export default ManageUserPage