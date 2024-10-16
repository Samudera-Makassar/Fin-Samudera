import React, { useEffect } from 'react'
import Layout from './Layout'
import FormRbsOperasional from '../components/FormRbsOperasional'

const RbsMedical = () => {
    useEffect(() => {
        document.title = 'Reimbursement Operasional - Samudera Indonesia'
    }, [])

    return (
        <div>
            <Layout>
                <FormRbsOperasional />
            </Layout>
        </div>
    )
}

export default RbsMedical
