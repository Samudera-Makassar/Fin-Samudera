import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex mt-6 flex-1">
                <div className="w-1/6">
                    <Sidebar />
                </div>
                <div className="flex-1 bg-gray-100 p-6">
                    <main>{children}</main>
                </div>
            </div>
        </div>
    )
}

export default Layout
