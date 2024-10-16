import React, { useEffect } from 'react'
import Layout from './Layout'
import FormRbsUmum from '../components/FormRbsUmum'

const RbsMedical = () => {
    useEffect(() => {
        document.title = 'Reimbursement GA/Umum - Samudera Indonesia'
    }, [])

    return (
        <div>
            <Layout>
                <FormRbsUmum />
            </Layout>
        </div>
    )
}

export default RbsMedical
