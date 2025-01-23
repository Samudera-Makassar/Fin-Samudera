import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const handleCloseLogoutModal = () => {
        if (!isLoading) {
            setShowLogoutModal(false);
        }
    };

    const handleConfirmLogout = async () => {
        setIsLoading(true);
        try {            
            localStorage.clear(); 
            navigate('/'); 
        } finally {
            setIsLoading(false);
            setShowLogoutModal(false);
        }        
    };    

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar toggleSidebar={toggleSidebar} />
            <div className="flex mt-6 flex-1">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={toggleSidebar}
                    onLogout={handleLogout}
                />
                <div className="flex-1 bg-gray-100 p-4 md:p-6 ml-0 lg:ml-64 overflow-hidden">
                    <main className="w-full overflow-hidden">{children}</main>
                </div>
            </div>
            
            <Modal
                showModal={showLogoutModal}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar?"
                onClose={handleCloseLogoutModal}
                onConfirm={handleConfirmLogout}
                cancelText="Batal"
                confirmText="Ya, Keluar"
                isLoading={isLoading}
            />
        </div>
    );
};

export default Layout;