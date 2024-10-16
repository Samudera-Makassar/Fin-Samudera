import React, { useEffect } from 'react'
import Layout from './Layout'
import FormRbsMedical from '../components/FormRbsMedical'

const RbsMedical = () => {
    useEffect(() => {
        document.title = 'Reimbursement Medical - Samudera Indonesia'
    }, [])

    return (
        <div>
            <Layout>
                <FormRbsMedical />
            </Layout>
        </div>
    )
}

export default RbsMedical
