import React from 'react'

const ModalPDF = ({ showModal, previewUrl, onClose }) => {
    if (!showModal) return null

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
            style={{ width: '100%', height: '100%' }} 
        >
            <div className="bg-white rounded-lg shadow-lg p-6 relative w-[90%] max-w-6xl" style={{ height: '90vh' }}>
                {/* Tombol untuk menutup modal */}
                <button onClick={onClose} className="absolute top-4 right-7 text-gray-500 hover:text-gray-800 text-4xl">
                    &times;
                </button>
                <h2 className="text-lg font-semibold mb-4">Lampiran</h2>

                {/* Iframe untuk menampilkan PDF */}
                <div className="overflow-auto border rounded-lg" style={{ height: 'calc(100% - 50px)' }}>
                    <iframe
                        src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        width="100%"
                        height="100%"
                        title="Lihat Lampiran"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    )
}

export default ModalPDF
