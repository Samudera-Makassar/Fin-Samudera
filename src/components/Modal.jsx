import React, { useEffect } from 'react'

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
    
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [showModal])

    if (!showModal) return null

    const handleReasonChange = (e) => setCancelReason(e.target.value)

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">{title}</h2>

                <p className="mb-6 text-gray-600">{message}</p>

                {showCancelReason && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alasan Pembatalan</label>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            value={cancelReason}
                            onChange={handleReasonChange}
                            placeholder="Masukkan alasan pembatalan..."
                        />
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-gray-200 text-gray-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base hover:bg-gray-300 hover:text-gray-700 transition-colors"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="bg-red-600 text-white px-6 sm:px-8 py-1.5 sm:py-2 rounded text-sm sm:text-base hover:bg-red-700 hover:text-gray-200 transition-colors"
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