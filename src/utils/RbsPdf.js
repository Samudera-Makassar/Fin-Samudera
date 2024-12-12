// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// export const downloadReimbursementPDF = (reimbursementDetail) => {
//     if (reimbursementDetail?.status !== 'Disetujui') {
//         return;
//     }

//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.getWidth();

//     // Logo
//     const logoElement = document.getElementById('logo-samudera');
//     if (logoElement) {
//         const logoWidth = 60; // Lebar logo dalam PDF
//         const logoHeight = 10; // Tinggi logo dalam PDF
//         doc.addImage(logoElement, 'PNG', 14, 10, logoWidth, logoHeight);
//     } else {
//         console.error('Logo dengan ID "logo-samudera" tidak ditemukan.');
//     }

//     // Judul & Header
//     doc.setFontSize(14);
//     doc.setFont('Helvetica', 'bold');
//     doc.text('PT MAKASSAR JAYA SAMUDERA', 14, 30);
//     doc.setFontSize(10);
//     doc.setFont('Helvetica', 'normal');
//     doc.text('Jl. Sungai Saddang No. 82, Kota Makassar', 14, 35);
//     doc.setFont('Helvetica', 'bold');
//     doc.text('samudera.id', 14, 40);
//     doc.setFont('Helvetica', 'normal');
//     doc.text('A member of the SAMUDERA INDONESIA GROUP', 14, 45);

//     // Judul Reimbursement
//     doc.setFontSize(12);
//     doc.setFont('Helvetica', 'bold');
//     doc.text('REIMBURSEMENT', pageWidth / 2, 50, { align: 'center' });

//     // Informasi dasar
//     doc.setFontSize(10);
//     doc.setFont('Helvetica', 'normal');
//     doc.text(`Biaya Reimburse Pak ${reimbursementDetail.user?.nama || '-'} untuk kegiatan ${reimbursementDetail.kategori || '-'}`, 14, 60);

//     // Tabel
//     doc.autoTable({
//         startY: 70,
//         head: [['No', 'Activities Name', 'Jumlah (IDR)']],
//         body: reimbursementDetail.reimbursements?.map((item, index) => [
//             index + 1,
//             item.jenis || '-',
//             `Rp ${item.biaya?.toLocaleString('id-ID') || '-'}`
//         ]),
//         theme: 'grid',
//         headStyles: { fillColor: [211, 211, 211] },
//         styles: { fontSize: 10, halign: 'left', valign: 'middle' },
//     });

//     // Terbilang
//     doc.setFontSize(10);
//     const totalBiaya = reimbursementDetail.totalBiaya?.toLocaleString('id-ID') || '-';
//     doc.text(`Total: Rp ${totalBiaya}`, 14, doc.lastAutoTable.finalY + 10);
//     doc.text('Terbilang:', 14, doc.lastAutoTable.finalY + 20);

//     // Informasi Bank
//     doc.setFontSize(10);
//     doc.text('Dokumen ini sudah mendukung digitalisasi', 14, doc.lastAutoTable.finalY + 40);
//     doc.text(`Nama Account : ${reimbursementDetail.user?.bankAccountName || '-'}`, 14, doc.lastAutoTable.finalY + 50);
//     doc.text(`Bank Penerima : ${reimbursementDetail.user?.bankName || '-'}`, 14, doc.lastAutoTable.finalY + 60);
//     doc.text(`No Rekening : ${reimbursementDetail.user?.bankAccountNumber || '-'}`, 14, doc.lastAutoTable.finalY + 70);

//     // Tanda tangan
//     doc.setFontSize(10);
//     doc.text('Approved by Reviewer1 & Reviewer2', pageWidth - 60, doc.lastAutoTable.finalY + 90);

//     doc.save(`Reimbursement_${reimbursementDetail.displayId || 'Detail'}.pdf`);
// };
