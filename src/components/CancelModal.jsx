import React from 'react';

const CancelModal = ({ 
    showModal, 
    selectedReport, 
    cancelReason, 
    setCancelReason, 
    onClose, 
    onSubmit 
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-4">Batalkan Laporan {selectedReport?.id}</h3>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Alasan Pembatalan:
                </label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end">
                    <button
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 hover:text-gray-700 mr-2"
                        onClick={onClose}
                    >
                        Batal
                    </button>
                    <button
                        className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 hover:text-gray-200"
                        onClick={onSubmit}
                    >
                        Kirim Alasan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelModal;