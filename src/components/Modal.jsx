import React from 'react'

const Modal = ({
    showModal,
    title,
    message,
    onClose,
    onConfirm,
    cancelText = 'Batal',
    confirmText = 'Hapus',
    cancelReason,
    setCancelReason,
    showCancelReason
}) => {
    if (!showModal) return null

    const handleReasonChange = (e) => setCancelReason(e.target.value)

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div 
                className="bg-white rounded-lg p-6 z-10 w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <p className="text-sm text-gray-500 mb-4">{message}</p>
                {showCancelReason && (
                    <textarea
                        placeholder="Alasan pembatalan"
                        value={cancelReason}
                        onChange={handleReasonChange}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                )}
                <div className="flex justify-end">
                    <button
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded hover:bg-gray-300 hover:text-gray-700 mr-2"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="bg-red-600 text-white px-8 py-2 rounded hover:bg-red-700 hover:text-gray-200"
                        onClick={() => onConfirm()}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal