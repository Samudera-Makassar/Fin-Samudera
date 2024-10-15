import React from 'react'
import EmptyState from '../assets/images/EmptyState.png'

const Dashboard = () => {
    return (
        <div className="container mx-auto py-8">
            <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Welcome, {}</h2>

                <div className="bg-white p-6 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-xl font-medium mb-4">Reimbursement Terakhir</h3>
                    <div className="flex justify-center">
                        <figure className="w-44 h-44">
                            <img src={EmptyState} alt="reimbursement icon" className="w-full h-full object-contain" />
                        </figure>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-medium mb-4">LPJ Bon Sementara Terakhir</h3>
                    <div className="flex justify-center">
                        <figure className="w-44 h-44">
                            <img src={EmptyState} alt="lpj bon icon" className="w-full h-full object-contain" />
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
