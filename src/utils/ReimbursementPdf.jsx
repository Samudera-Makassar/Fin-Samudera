import React from "react";
import { pdf } from "@react-pdf/renderer";
import { Page, Text, View, Document, StyleSheet, Image, Font } from "@react-pdf/renderer";
import Logo from "../assets/images/logo-samudera.png";
import { doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

Font.register({
  family: "Poppins",
  fonts: [
    { src: require("../assets/fonts/Poppins-Regular.ttf") },
    { src: require("../assets/fonts/Poppins-SemiBold.ttf"), fontWeight: "semibold", },
    { src: require("../assets/fonts/Poppins-Bold.ttf"), fontWeight: "bold" },
    { src: require("../assets/fonts/Poppins-Italic.ttf"), fontStyle: "italic" },
  ],
});

Font.register({
  family: "Optima",
  fonts: [
    { src: require("../assets/fonts/Optima.ttf") },
    { src: require("../assets/fonts/Optima_Medium.ttf"), fontWeight: "medium" },
    { src: require("../assets/fonts/Optima_B.ttf"), fontWeight: "bold" },
    { src: require("../assets/fonts/Optima_Italic.ttf"), fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Poppins',
  },
  logo: {
    width: 160,
    height: 24,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  header: {
    marginBottom: 10,
    fontSize: 8,
    justifyContent: 'space-between',
    fontFamily: 'Optima',
    alignItems: 'flex-end'
  },
  tableContainer: {
    border: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableHeader: {
    textAlign: 'center',
  },
  tableHeaderCell: {
    fontSize: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  tableCell: {
    fontSize: 8,
    padding: 4,
    borderRightColor: '#000',
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center'
  },
  bankInfo: {
    borderWidth: 2,    
    fontWeight: 'semibold',
    padding: 4,
  },
  footer: {
    marginTop: 16,
    fontSize: 6,    
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,    
  },
});

const getApprovedReviewerNames = async (reimbursementDetail) => {
  if (!reimbursementDetail || !reimbursementDetail.statusHistory) {
    return { reviewer1Name: "-", reviewer2Name: "-" };
  }

  const { reviewer1 = [], reviewer2 = [] } = reimbursementDetail.user || {};
  const { statusHistory } = reimbursementDetail;

  const findApprovedReviewer = async (reviewers, backupRole) => {
    for (const reviewerUid of reviewers) {

      const approved = statusHistory.find(
        (history) =>
          history.actor === reviewerUid && // Cocokkan UID reviewer
          history.status.toLowerCase().includes("disetujui"), // Cek apakah status mengandung 'disetujui'
      );

      if (approved) {
        try {
          const reviewerDocRef = doc(db, "users", reviewerUid);
          const reviewerSnapshot = await getDoc(reviewerDocRef);

          if (reviewerSnapshot.exists()) {
            const nama = reviewerSnapshot.data().nama;
            return nama; // Ambil nama reviewer
          }
        } catch (error) {
          console.error(`Error fetching reviewer ${reviewerUid}:`, error);
        }
      }
    }

    // Jika tidak ditemukan, cari admin sebagai backup
    const backupApproval = statusHistory.find(
      (history) =>
        history.status.toLowerCase().includes(backupRole.toLowerCase()) &&
        history.status.toLowerCase().includes("disetujui"),
    );

    if (backupApproval) {
      try {
        const backupDocRef = doc(db, "users", backupApproval.actor);
        const backupSnapshot = await getDoc(backupDocRef);

        if (backupSnapshot.exists()) {
          const backupName = backupSnapshot.data().nama;
          return backupName;
        }
      } catch (error) {
        console.error(`Error fetching backup actor (${backupRole}):`, error);
      }
    }
    return "-";
  };

  // Cari reviewer1 dan gunakan "Super Admin" sebagai backup jika tidak ditemukan
  const reviewer1Name = await findApprovedReviewer(reviewer1, "Super Admin");
  // Cari reviewer2 dan gunakan "Super Admin" sebagai backup jika tidak ditemukan
  const reviewer2Name = await findApprovedReviewer(reviewer2, "Super Admin");

  // Jika kedua reviewer adalah Super Admin, kembalikan "Super Admin" saja
  if (reviewer1Name === reviewer2Name && reviewer1Name.toLowerCase().includes("super admin")) {
    return { reviewer1Name: "Super Admin", reviewer2Name: "" };
  }

  return { reviewer1Name, reviewer2Name };
};

const ReimbursementPDF = ({ reimbursementDetail, approvedReviewers }) => {
  if (!reimbursementDetail || reimbursementDetail.status !== "Disetujui") {
    return null;
  }

  // Fungsi untuk mengubah angka menjadi terbilang
  const terbilang = (angka) => {
    const bilangan = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
      "Dua Belas",
      "Tiga Belas",
      "Empat Belas",
      "Lima Belas",
      "Enam Belas",
      "Tujuh belas",
      "Delapan belas",
      "Sembilan belas",
    ];
    const satuan = ["", "Ribu", "Juta", "Miliar", "Triliun"];

    if (angka < 20) return bilangan[angka];

    const prosesTerbilang = (num) => {
      if (num < 20) return bilangan[num];
      if (num < 100) {
        const depan = Math.floor(num / 10);
        const belakang = num % 10;
        return (
          (depan === 1 ? "Sepuluh" : bilangan[depan] + " Puluh") +
          (belakang > 0 ? " " + bilangan[belakang] : "")
        );
      }
      if (num < 1000) {
        const depan = Math.floor(num / 100);
        const belakang = num % 100;
        return (
          (depan === 1 ? "Seratus" : bilangan[depan] + " Ratus") +
          (belakang > 0 ? " " + prosesTerbilang(belakang) : "")
        );
      }
      return "";
    };

    const formatTerbilang = (num) => {
      if (num === 0) return "nol";

      let result = "";
      let sisa = num;
      let tingkat = 0;

      while (sisa > 0) {
        const bagian = sisa % 1000;
        if (bagian !== 0) {
          const sebutan = prosesTerbilang(bagian);
          result = sebutan + " " + satuan[tingkat] + " " + result;
        }
        sisa = Math.floor(sisa / 1000);
        tingkat++;
      }

      return result.trim() + " Rupiah";
    };

    return formatTerbilang(angka);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={Logo} style={styles.logo} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={{ fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}>{reimbursementDetail.user?.unit || "-"}</Text>
          <Text>Jl. Sungai Saddang No. 82, Kota Makassar</Text>
          <Text style={{ marginTop: 10, fontWeight: "bold" }}>samudera.id</Text>
          <Text style={{ fontSize: 6 }}>A member of the SAMUDERA INDONESIA GROUP</Text>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* REIMBURSEMENT Row */}
          <View style={[styles.tableRow]}>
            <View style={[styles.tableCell, { width: '100%', textAlign: 'center', fontWeight: 'semibold', fontSize: 10, borderRight: 0 }]}>
              <Text>REIMBURSEMENT</Text>
            </View>
          </View>

          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableHeaderCell, { width: '6%', borderRight: 1 }]}>
              <Text>NO.</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '74%', borderRight: 1 }]}>
              <Text>ACTIVITIES NAME</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '20%' }]}>
              <Text>JUMLAH (IDR)</Text>
            </View>
          </View>

          {/* Kegiatan Row */}
          <View style={[styles.tableRow, { borderBottom: 0 }]}>
            <View style={[styles.tableCell, { width: '6%', textAlign: 'center' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '74%', fontWeight: 'bold', textTransform: 'uppercase' }]}>
              <Text>BIAYA REIMBURSE {reimbursementDetail.user?.nama || "-"} UNTUK KEGIATAN {reimbursementDetail.kategori || "-"}</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%', textAlign: 'right', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Data Row */}
          {reimbursementDetail.reimbursements?.map((item, index) => (
            <View key={index} style={[styles.tableRow, { borderBottom: 0 }]}>
              <View style={[styles.tableCell, { width: '6%', textAlign: 'center' }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCell, { width: '74%', justifyContent: 'flex-start', flexDirection: 'row' }]}>
                <Text style={{ width: 100 }}>
                  {item.tanggal
                    ? new Date(item.tanggal)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                      .replace(/\./g, "")
                      .replace(/\s/g, "-")
                    : "-"}
                </Text>
                <Text style={{ marginLeft: 12 }}>{item.jenis || "-"}</Text>
              </View>
              <View style={[styles.tableCell, { width: '20%', textAlign: 'right', borderRight: 0 }]}>
                <Text>{(item.biaya || 0).toLocaleString("id-ID")}</Text>
              </View>
            </View>
          ))}

          {/* Empty Row */}
          <View style={[styles.tableRow, { borderBottom: 0 }]}>
            <View style={[styles.tableCell, { width: '6%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '74%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '20%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Terbilang Row */}
          <View style={[styles.tableRow]}>
            <View style={[styles.tableCell, { width: '6%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '74%', textTransform: 'uppercase' }]}>
              <Text>TERBILANG: {terbilang(reimbursementDetail.totalBiaya || 0)}</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Total Row */}
          <View style={[styles.tableRow]}>
            <View style={[styles.tableCell, { width: '6%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '74%', textAlign: 'right' }]}>
              <Text>TOTAL:</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%', borderRight: 0, textAlign: 'right' }]}>
              <Text>Rp{reimbursementDetail.totalBiaya?.toLocaleString("id-ID") || "-"}</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerRow, { paddingLeft: 4 }]}>
              <Text>Dokumen Ini Sudah Mendukung Signature Digital</Text>
            </View>
            <View style={[styles.footerRow, { alignItems: 'flex-end', columnGap: 4, marginTop: 2 }]}>
              <View style={[styles.bankInfo, { flexDirection: "row", columnGap: 4, alignItems: "flex-start" }]}>
                {/* Label */}
                <View style={{ flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <Text>Nama Account</Text>
                  <Text>Bank Penerima</Text>
                  <Text>No Rekening</Text>
                </View>

                {/* Tanda Titik Dua */}
                <View style={{ flexDirection: "column", gap: 2, flexShrink: 0 }}>
                  <Text>:</Text>
                  <Text>:</Text>
                  <Text>:</Text>
                </View>

                {/* Value */}
                <View style={{ flexDirection: "column", gap: 2, paddingRight: 32 }}>
                  <Text>{reimbursementDetail.user?.nama || "-"}</Text>
                  <Text>{reimbursementDetail.user?.bankName || "-"}</Text>
                  <Text>{reimbursementDetail.user?.accountNumber || "-"}</Text>
                </View>
              </View>

              <Text style={{ paddingVertical: 2, paddingRight: 4 }}>
                Approved By {approvedReviewers.reviewer1Name}
                {approvedReviewers.reviewer2Name ? ` & ${approvedReviewers.reviewer2Name}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document >
  );
  // return (
  //   <Document>
  //     <Page size="A4" style={styles.page}>
  //       <Image src={Logo} style={styles.logo} />
  //       {/* <View style={styles.header}> */}
  //       <View style={[styles.companyInfo, { fontFamily: "Optima" }]}>
  //         <Text style={styles.title}>
  //           {reimbursementDetail.user?.unit || "-"}
  //         </Text>
  //         <Text style={styles.subtitle}>
  //           Jl. Sungai Saddang No. 82, Kota Makassar
  //         </Text>
  //         <Text
  //           style={[styles.subtitle, { marginTop: 12, fontWeight: "bold" }]}
  //         >
  //           samudera.id
  //         </Text>
  //         <Text style={[styles.subtitle, { fontSize: 8 }]}>
  //           A member of the SAMUDERA INDONESIA GROUP
  //         </Text>
  //       </View>
  //       {/* </View> */}

  //       <View style={styles.tableContainer}>
  //         <View style={[styles.tableRow, styles.tableHeader]}>
  //           <Text
  //             style={[
  //               styles.tableCell,
  //               {
  //                 flex: 1,
  //                 textAlign: "center",
  //                 fontSize: 12,
  //                 fontWeight: "semibold",
  //               },
  //             ]}
  //           >
  //             REIMBURSEMENT
  //           </Text>
  //         </View>

  //         {/* Header Tabel */}
  //         <View style={[styles.tableRow]}>
  //           <Text
  //             style={[
  //               styles.tableCell,
  //               { flex: 0.05, textAlign: "center", borderRight: 1 },
  //             ]}
  //           >
  //             NO.
  //           </Text>
  //           <Text
  //             style={[
  //               styles.tableCell,
  //               { flex: 0.8, textAlign: "center", borderRight: 1 },
  //             ]}
  //           >
  //             ACTIVITIES NAME
  //           </Text>
  //           <Text
  //             style={[styles.tableCell, { flex: 0.15, textAlign: "center" }]}
  //           >
  //             JUMLAH (IDR)
  //           </Text>
  //         </View>

  //         {/* Baris untuk deskripsi Biaya Reimburse */}
  //         <View style={[styles.tableRow]}>
  //           <Text style={[styles.tableCell, { flex: 0.05, borderRight: 1 }]}> </Text>
  //           <Text
  //             style={[
  //               styles.tableCell,
  //               {
  //                 flex: 0.8,
  //                 fontWeight: "semibold",
  //                 textTransform: "uppercase",
  //                 borderRight: 1,
  //               },
  //             ]}
  //           >
  //             BIAYA REIMBURSE {reimbursementDetail.user?.nama || "-"} UNTUK
  //             KEGIATAN {reimbursementDetail.kategori || "-"}
  //           </Text>
  //           <Text style={[styles.tableCell, { flex: 0.15 }]}> </Text>
  //         </View>

  //         {/* Baris Data */}
  //         {reimbursementDetail.reimbursements?.map((item, index) => (
  //           <View key={index} style={styles.tableRow}>
  //             <Text
  //               style={[
  //                 styles.tableCell,
  //                 { flex: 0.05, textAlign: "center", borderRight: 1 },
  //               ]}
  //             >
  //               {index + 1}
  //             </Text>
  //             <View
  //               style={[
  //                 styles.tableCell,
  //                 { flex: 0.8, flexDirection: "row", borderRight: 1 },
  //               ]}
  //             >
  //               <Text style={{ width: 100 }}>
  //                 {item.tanggal
  //                   ? new Date(item.tanggal)
  //                     .toLocaleDateString("en-GB", {
  //                       day: "2-digit",
  //                       month: "short",
  //                       year: "2-digit",
  //                     })
  //                     .replace(/\./g, "")
  //                     .replace(/\s/g, "-")
  //                   : "-"}
  //               </Text>
  //               <Text style={{ marginLeft: 10 }}>{item.jenis || "-"}</Text>
  //             </View>
  //             <Text
  //               style={[styles.tableCell, { flex: 0.15, textAlign: "right" }]}
  //             >
  //               {(item.biaya || 0).toLocaleString("id-ID")}
  //             </Text>
  //           </View>
  //         ))}

  //         <View style={styles.tableRow}>
  //           <Text style={[styles.tableCell, { flex: 0.05, borderRight: 1 }]}> </Text>
  //           <Text
  //             style={[
  //               styles.tableCell,
  //               { flex: 0.8, textAlign: "right", borderRight: 1 },
  //             ]}
  //           >
  //             TOTAL
  //           </Text>
  //           <Text style={[styles.tableCell, { flex: 0.15, textAlign: "right" }]}>
  //             Rp{reimbursementDetail.totalBiaya?.toLocaleString("id-ID") || "-"}
  //           </Text>
  //         </View>

  //         <View style={styles.tableRow}>
  //           <Text style={styles.tableCell}>
  //             TERBILANG: {terbilang(reimbursementDetail.totalBiaya || 0)}
  //           </Text>
  //         </View>

  //         <Text
  //           style={[
  //             styles.subtitle,
  //             { marginTop: 24, paddingHorizontal: 4, fontSize: 8 },
  //           ]}
  //         >
  //           Dokumen Ini Sudah Mendukung Signature Digital
  //         </Text>

  //         <View
  //           style={[
  //             styles.container,
  //             { flexDirection: "row", justifyContent: "space-between" },
  //           ]}
  //         >
  //           <View
  //             style={[styles.bankInfo, { width: "40%", flexDirection: "row" }]}
  //           >
  //             {/* Label */}
  //             <View
  //               style={{
  //                 flexDirection: "column",
  //                 marginRight: 4,
  //                 textAlign: "right",
  //               }}
  //             >
  //               <Text style={{ marginBottom: 4 }}>Nama Account</Text>
  //               <Text style={{ marginBottom: 4 }}>Bank Penerima</Text>
  //               <Text style={{ marginBottom: 4 }}>No Rekening</Text>
  //             </View>
  //             {/* Tanda Titik Dua */}
  //             <View
  //               style={{
  //                 flexDirection: "column",
  //                 marginRight: 4,
  //                 textAlign: "center",
  //               }}
  //             >
  //               <Text style={{ marginBottom: 4 }}>:</Text>
  //               <Text style={{ marginBottom: 4 }}>:</Text>
  //               <Text style={{ marginBottom: 4 }}>:</Text>
  //             </View>
  //             {/* Value */}
  //             <View style={{ flexDirection: "column", textAlign: "left" }}>
  //               <Text style={{ marginBottom: 4 }}>
  //                 {reimbursementDetail.user?.nama || "-"}
  //               </Text>
  //               <Text style={{ marginBottom: 4 }}>
  //                 {reimbursementDetail.user?.bankName || "-"}
  //               </Text>
  //               <Text style={{ marginBottom: 4 }}>
  //                 {reimbursementDetail.user?.accountNumber || "-"}
  //               </Text>
  //             </View>
  //           </View>

  //           <Text
  //             style={[
  //               styles.signature,
  //               {
  //                 marginLeft: "auto",
  //                 marginBottom: 0,
  //                 textAlign: "right",
  //                 width: "70%",
  //                 paddingHorizontal: 4
  //               },
  //             ]}
  //           >
  //             Approved By {approvedReviewers.reviewer1Name}
  //             {approvedReviewers.reviewer2Name ? ` & ${approvedReviewers.reviewer2Name}` : ""}
  //           </Text>
  //         </View>
  //       </View>
  //     </Page>
  //   </Document>
  // );
};

const generateReimbursementPDF = async (reimbursementDetail) => {
  try {
    // Cek apakah reimbursement sudah disetujui
    if (reimbursementDetail.status !== "Disetujui") {
      toast.error("Reimbursement belum disetujui");
      return;
    }

    // Ambil nama reviewer sebelum PDF dirender
    const approvedReviewers = await getApprovedReviewerNames(reimbursementDetail);

    // Buat dokumen PDF    
    const pdfBlob = await pdf(
      <ReimbursementPDF
        reimbursementDetail={reimbursementDetail}
        approvedReviewers={approvedReviewers}
      />,
    ).toBlob();

    const sanitizedKategori = reimbursementDetail.kategori.replace(/\//g, '_');

    const storageRef = ref(storage, `Reimbursement/${sanitizedKategori}/${reimbursementDetail.displayId}/${reimbursementDetail.displayId}.pdf`);
    await uploadBytes(storageRef, pdfBlob);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Gagal mengunduh:", error);
    toast.error("Gagal mengunduh Reimbursement");
    return null;
  }
};

<ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
/>

export { ReimbursementPDF, generateReimbursementPDF };