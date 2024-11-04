import React, { useEffect, useState } from 'react'
import Layout from './Layout'
import ManageUser from '../components/ManageUser'
import Modal from '../components/Modal'

const ManageUserPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        document.title = 'Manage User - Samudera Indonesia'
    }, [])

    const userData = {
        user: [
            {
                nama: 'Andi Ichwan Farmawan',
                email: 'ichwanfarmawan@gmail.com',
                posisi: 'Magang',
                unit: 'MJS',
                akses: 'Submit',
                departemen: 'Operation'
            },
            {
                nama: 'Rachmat Maulana',
                email: 'rachmatmaulana81669@gmail.com',
                posisi: 'Magang',
                unit: 'MJS',
                akses: 'Submit',
                departemen: 'GA/Umum'
            }
        ]
    };
    
    const openModal = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleDelete = () => {
        closeModal();
    };

    return (
        <div>
            <Layout>
                <ManageUser
                    data={userData}
                    onOpenModal={openModal}
                    onEdit={(item) => console.log('Edit:', item)}
                />
                {isModalOpen && (
                <Modal
                    showModal={isModalOpen}
                    title="Konfirmasi Penghapusan"
                    message={`Apakah Anda yakin ingin menghapus pengguna ${selectedItem?.nama || 'ini'}?`}
                    onClose={closeModal}
                    onConfirm={handleDelete}
                />
                 )}
            </Layout>
        </div>
    )
}

export default ManageUserPage