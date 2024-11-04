import React from 'react';

const Modal = ({ 
    showModal, 
    title, 
    message, 
    onClose, 
    onConfirm 
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-sm text-gray-500 mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 hover:text-gray-700 mr-2"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 hover:text-gray-200"
                        onClick={onConfirm}
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
