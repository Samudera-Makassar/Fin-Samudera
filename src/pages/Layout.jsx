import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="flex mt-6 flex-1">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                {/* Mengubah padding dan overflow handling pada main content container */}
                <div className="flex-1 bg-gray-100 p-4 md:p-6 ml-0 lg:ml-64 overflow-hidden">
                    <main className="w-full overflow-hidden">{children}</main>
                </div>
            </div>
        </div>
    );
};

export default Layout;