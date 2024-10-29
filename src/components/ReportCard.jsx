import React from 'react';

const ReportCard = ({ reimbursementCount, lpjCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Reimbursement Card */}
        <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
          <div className="bg-gray-100 p-6 rounded-full">
            <svg 
              className="w-8 h-8 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-500">Reimbursement</p>
            <div className="text-4xl font-bold">{reimbursementCount || 0}</div>
            <p className="text-sm text-gray-500">Laporan Perlu Diapprove/Review</p>
          </div>
        </div>

        {/* LPJ Bon Sementara Card */}
        <div className="bg-white flex items-center space-x-4 px-6 py-4 shadow-sm rounded-lg">
          <div className="bg-gray-100 p-6 rounded-full">
            <svg 
              className="w-8 h-8 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-gray-500">LPJ Bon Sementara</p>
            <div className="text-4xl font-bold">{lpjCount || 0}</div>
            <p className="text-sm text-gray-500">Laporan Perlu Diapprove/Review</p>
          </div>
        </div>
    </div>
  );
};

export default ReportCard;