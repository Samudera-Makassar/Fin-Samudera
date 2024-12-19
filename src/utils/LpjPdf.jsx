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
    fontFamily: 'Optima',
  },
  logo: {
    width: 160,
    height: 24,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  header: {
    marginBottom: 16,
    fontWeight: 'bold',
    fontSize: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableContainer: {
    border: 1,
    borderColor: '#000',
    fontFamily: 'Poppins'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#000',
    borderBottomWidth: 1,    
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#ED1C24',
    textAlign: 'center',
    fontWeight: 'bold',   
    color: 'white' 
  },
  tableHeaderCell: {
    fontSize: 8,
    padding: 2,
    borderColor: '#000',
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    height: '100%'
  },
  biayaHeaderContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  subHeaderRow: {
    flexDirection: 'row',
    width: '100%',
  },
  subHeaderCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 2,
    height: '100%'
  },
  tableCell: {
    fontSize: 8,
    padding: 2,
    borderRightColor: '#000',
    borderRightWidth: 1,
    height: '100%',
    justifyContent: 'center'
  },
  footer: {
    marginTop: 8,
    fontSize: 8,
    padding: 4
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingVertical: 0,
  },
});

const getApprovedReviewerNames = async (lpjDetail) => {
  if (!lpjDetail || !lpjDetail.statusHistory) {
    return { reviewer1Name: "-", reviewer2Name: "-" };
  }

  const { reviewer1 = [], reviewer2 = [] } = lpjDetail.user || {};
  const { statusHistory } = lpjDetail;

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

  // Tambahkan kondisi jika reviewer2 kosong atau tidak ada
  if ((reviewer2.length === 0 || reviewer2Name === "-") && reviewer1Name !== "-") {
    return { reviewer1Name, reviewer2Name: "" };
  }

  // Jika kedua reviewer adalah Super Admin, kembalikan "Super Admin" saja
  if (reviewer1Name === reviewer2Name && reviewer1Name.toLowerCase().includes("super admin")) {
    return { reviewer1Name: "Super Admin", reviewer2Name: "" };
  }

  return { reviewer1Name, reviewer2Name };
};

const LpjPDF = ({ lpjDetail, approvedReviewers }) => {
  if (!lpjDetail || lpjDetail.status !== "Disetujui") {
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={Logo} style={styles.logo} />
        <Text style={styles.title}>LAPORAN PERTANGGUNG JAWABAN</Text>
        <View style={styles.header}>
          {lpjDetail.kategori === "GA/Umum" ? (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: "column", marginRight: 12, gap: 4 }}>
                <Text>Bisnis Unit</Text>
                <Text>PIC</Text>
                <Text>No. BS</Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "center", marginRight: 4, gap: 4 }}>
                <Text>:</Text>
                <Text>:</Text>
                <Text>:</Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "left", textTransform: 'uppercase', gap: 4 }}>
                <Text>{lpjDetail.user?.unit || "-"}</Text>
                <Text>{lpjDetail.user?.nama || "-"}</Text>
                <Text>{lpjDetail.nomorBS || "-"}</Text>
              </View>
            </View>
          ) : lpjDetail.kategori === "Marketing/Operasional" ? (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: "column", marginRight: 12, gap: 4 }}>
                <Text>Bisnis Unit</Text>
                <Text>Project</Text>
                <Text>Customer</Text>
                <Text>Location</Text>
                <Text>PIC</Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "center", marginRight: 4, gap: 4 }}>
                <Text>:</Text>
                <Text>:</Text>
                <Text>:</Text>
                <Text>:</Text>
                <Text>:</Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "left", textTransform: 'uppercase', gap: 4 }}>
                <Text>{lpjDetail.user?.unit || "-"}</Text>
                <Text>{lpjDetail.project || "-"}</Text>
                <Text>{lpjDetail.customer || "-"}</Text>
                <Text>{lpjDetail.lokasi || "-"}</Text>
                <Text>{lpjDetail.user?.nama || "-"}</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text>Kategori tidak ditemukan</Text>
            </View>
          )}

          {lpjDetail.kategori === "Marketing/Operasional" && (
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: "column", marginRight: 12, gap: 4 }}>
                <Text> </Text>
                <Text>No. BS</Text>
                <Text>No. Job Order</Text>
                <Text>Tgl. Kegiatan</Text>
                <Text> </Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "center", marginRight: 4, gap: 4 }}>
                <Text> </Text>
                <Text>:</Text>
                <Text>:</Text>
                <Text>:</Text>
                <Text> </Text>
              </View>
              <View style={{ flexDirection: "column", textAlign: "left", textTransform: 'uppercase', gap: 4 }}>
                <Text> </Text>
                <Text>{lpjDetail.nomorBS || "-"}</Text>
                <Text>{lpjDetail.nomorJO || "-"}</Text>
                <Text>
                  {lpjDetail.tanggal
                    ? new Date(lpjDetail.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    : "-"}
                </Text>
                <Text> </Text>
              </View>
            </View>
          )}
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableHeaderCell, { width: '5%' }]}>
              <Text>NO.</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '32%' }]}>
              <Text>URAIAN</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '12%' }]}>
              <Text>BON</Text>
              <Text>SEMENTARA</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '7%', paddingHorizontal: 1 }]}>
              <Text>JUMLAH</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '10%', paddingHorizontal: 1 }]}>
              <Text>SATUAN</Text>
              <Text>BOX/SHIFT</Text>
              <Text>/JAM</Text>
            </View>
            <View style={[styles.tableHeaderCell, { width: '24%', padding: 0 }]}>
              <View style={styles.biayaHeaderContainer}>
                <Text style={{ textAlign: 'center', borderBottom: 1, width: '100%', paddingVertical: 4 }}>BIAYA</Text>
                <View style={styles.subHeaderRow}>
                  <View style={[styles.subHeaderCell, { borderRight: 1, borderBottom: 0 }]}>
                    <Text> </Text>
                    <Text>AKTUAL (Rp)</Text>
                    <Text> </Text>
                  </View>
                  <View style={[styles.subHeaderCell, { borderBottom: 0 }]}>
                    <Text> </Text>
                    <Text>JUMLAH</Text>
                    <Text> </Text>
                  </View>
                </View>
                {/* <Text> </Text> */}
              </View>
            </View>
            <View style={[styles.tableHeaderCell, { width: '10%', borderRight: 0 }]}>
              <Text>KET</Text>
            </View>
          </View>

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Bon Sementara Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text style={{ fontWeight: 'bold' }}>A. Bon Sementara :</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Aktivitas Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text>{lpjDetail?.aktivitas} </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
              <Text>{lpjDetail?.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Header Data Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text style={{ fontWeight: 'bold' }}>B. Perincian Biaya :</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Data Row */}
          {lpjDetail.lpj?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCell, { width: '5%', textAlign: 'center' }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCell, { width: '32%' }]}>
                <Text>{item.namaItem}</Text>
              </View>
              <View style={[styles.tableCell, { width: '12%' }]}>
                <Text> </Text>
              </View>
              <View style={[styles.tableCell, { width: '7%', textAlign: 'center' }]}>
                <Text>{item.jumlah}</Text>
              </View>
              <View style={[styles.tableCell, { width: '10%' }]}>
                <Text> </Text>
              </View>
              <View style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
                <Text>{item?.biaya.toLocaleString('id-ID') || "-"}</Text>
              </View>
              <View style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
                <Text>{item?.jumlahBiaya.toLocaleString('id-ID') || "-"}</Text>
              </View>
              <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
                <Text style={{ flexWrap: 'wrap', textAlign: 'left', overflow: 'hidden' }}>{item?.keterangan || " "}</Text>
              </View>
            </View>
          ))}

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Empty Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Total Bon Sementara Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%', borderRight: 0, borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%', borderTopWidth: 1 }]}>
              <Text>Total Bon Sementara</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', textAlign: 'right', fontWeight: 'bold', borderTopWidth: 1 }]}>
              <Text>{lpjDetail?.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, { width: '7%', borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0, borderTopWidth: 1 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Sub Total Biaya Operasional Sementara Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text>Sub Total Biaya Operasional Sementara</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
              <Text>{lpjDetail?.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Total Biaya Operasional Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text>Total Biaya Operasional</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', textAlign: 'right', fontWeight: 'bold' }]}>
              <Text>{lpjDetail.totalBiaya.toLocaleString('id-ID') ?? 'N/A'}</Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Sisa Lebih Biaya Operasional Sementara Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%' }]}>
              <Text>Sisa Lebih Biaya Operasional Sementara</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
              <Text>{lpjDetail.sisaLebih === 0 ? '' : `${lpjDetail.sisaLebih.toLocaleString('id-ID') ?? 'N/A'}`}</Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Sisa Kurang dibayarkan ke Pegawai Row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, { width: '5%', borderRight: 0, borderBottom: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '32%', borderBottom: 1 }]}>
              <Text>Sisa Kurang dibayarkan ke Pegawai</Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', borderBottom: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '7%', borderBottom: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderBottom: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', borderBottom: 1 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.tableCell, { width: '12%', borderBottom: 1, textAlign: 'right' }]}>
              <Text>{lpjDetail.sisaKurang === 0 ? '' : `-${lpjDetail.sisaKurang.toLocaleString('id-ID') ?? 'N/A'}`}</Text>
            </View>
            <View style={[styles.tableCell, { width: '10%', borderRight: 0, borderBottom: 1 }]}>
              <Text> </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ fontWeight: 'bold' }}>{lpjDetail.tanggalPengajuan
              ? "Makassar, " + new Date(lpjDetail.tanggalPengajuan)
                .toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
                .replace(/\./g, "")
                .replace(/\s/g, " ")
              : "-"}
            </Text>
            <View style={styles.footerRow}>
              <Text>Dokumen Ini Sudah Mendukung Signature Digital</Text>
              <Text>
                Approved By {approvedReviewers.reviewer1Name}
                {approvedReviewers.reviewer2Name ? ` & ${approvedReviewers.reviewer2Name}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const generateLpjPDF = async (lpjDetail) => {
  try {
    // Cek apakah lpj sudah disetujui
    if (lpjDetail.status !== "Disetujui") {
      toast.error("Lpj Bon Sementara belum disetujui");
      return;
    }

    // Ambil nama reviewer sebelum PDF dirender
    const approvedReviewers = await getApprovedReviewerNames(lpjDetail);

    // Buat dokumen PDF    
    const pdfBlob = await pdf(
      <LpjPDF
        lpjDetail={lpjDetail}
        approvedReviewers={approvedReviewers}
      />,
    ).toBlob();

    const sanitizedKategori = lpjDetail.kategori.replace(/\//g, '_');

    const storageRef = ref(storage, `LPJ/${sanitizedKategori}/${lpjDetail.displayId}/${lpjDetail.displayId}.pdf`);
    await uploadBytes(storageRef, pdfBlob);

    const downloadURL = await getDownloadURL(storageRef);    
    return downloadURL;
  } catch (error) {
    console.error("Gagal mengunduh:", error);
    toast.error("Gagal mengunduh LPJ Bon Sementara");
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

export { LpjPDF, generateLpjPDF };