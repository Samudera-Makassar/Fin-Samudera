import React from "react";
import { pdf } from "@react-pdf/renderer";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";
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

const styles = StyleSheet.create({
    page: {
        padding: 24,
        fontFamily: 'Poppins',
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 8,
        fontSize: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        textTransform: 'uppercase',
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
        borderRightColor: '#000',
        borderRightWidth: 1,
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

const getApprovedReviewerNames = async (bonSementaraDetail) => {
    if (!bonSementaraDetail || !bonSementaraDetail.statusHistory) {
        return { reviewer1Name: "-", reviewer2Name: "-" };
    }

    const { reviewer1 = [], reviewer2 = [] } = bonSementaraDetail.user || {};
    const { statusHistory } = bonSementaraDetail;

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

const BsPDF = ({ bonSementaraDetail, approvedReviewers }) => {
    if (!bonSementaraDetail || bonSementaraDetail.status !== "Disetujui") {
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
                {bonSementaraDetail.bonSementara?.map((item) => (
                    <View style={styles.header}>
                        <View style={{ alignItems: 'center' }}>
                            <Text>{bonSementaraDetail.user?.unit || "-"}</Text>
                            <Text>MAKASSAR</Text>
                        </View>
                        <Text>{item.nomorBS || "-"}</Text>
                    </View>
                ))}

                <Text style={styles.title}>BON SEMENTARA</Text>

                {/* Table */}
                <View style={styles.tableContainer}>
                    {/* Tanggal Pembayaran Oleh Kasir Row */}
                    <View style={[styles.tableRow]}>
                        <View style={[styles.tableCell, { width: '29%', borderRight: 0 }]}>
                            <Text>Tanggal Pembayaran Oleh Kasir</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '1%', borderRight: 0 }]}>
                            <Text>:</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%', borderRight: 0 }]}>
                            <Text>
                                {bonSementaraDetail.tanggalPengajuan
                                    ? new Date(bonSementaraDetail.tanggalPengajuan).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })
                                    : "-"}
                            </Text>
                        </View>
                    </View>

                    {/* Diselesaikan paling lambat tanggal Row */}
                    <View style={[styles.tableRow]}>
                        <View style={[styles.tableCell, { width: '29%', borderRight: 0 }]}>
                            <Text>Diselesaikan paling lambat tanggal</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '1%', borderRight: 0 }]}>
                            <Text>:</Text>
                        </View>
                        <View style={[styles.tableCell, { width: '70%', borderRight: 0 }]}>
                            <Text> </Text>
                        </View>
                    </View>

                    {/* Header Row */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableHeaderCell, { width: '6%' }]}>
                            <Text>NO.</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, { width: '74%' }]}>
                            <Text>ACTIVITIES NAME</Text>
                        </View>
                        <View style={[styles.tableHeaderCell, { width: '20%', borderRight: 0 }]}>
                            <Text>JUMLAH (IDR)</Text>
                        </View>
                    </View>

                    {/* Data Row */}
                    {bonSementaraDetail.bonSementara?.map((item, index) => (
                        <View key={index} style={[styles.tableRow, { borderBottom: 0 }]}>
                            <View style={[styles.tableCell, { width: '6%', textAlign: 'center' }]}>
                                <Text>{index + 1}</Text>
                            </View>
                            <View style={[styles.tableCell, { width: '74%' }]}>
                                <Text>{item.aktivitas}</Text>
                            </View>
                            <View style={[styles.tableCell, { width: '20%', textAlign: 'right', borderRight: 0 }]}>
                                <Text>{item?.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</Text>
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
                    {bonSementaraDetail.bonSementara?.map((item) => (
                        <View style={[styles.tableRow]}>
                            <View style={[styles.tableCell, { width: '6%' }]}>
                                <Text> </Text>
                            </View>
                            <View style={[styles.tableCell, { width: '74%', textTransform: 'uppercase' }]}>
                                <Text>TERBILANG: {terbilang(item.jumlahBS || 0)}</Text>
                            </View>
                            <View style={[styles.tableCell, { width: '20%', borderRight: 0 }]}>
                                <Text> </Text>
                            </View>
                        </View>
                    ))}

                    {/* Total Row */}
                    {bonSementaraDetail.bonSementara?.map((item) => (
                        <View style={[styles.tableRow]}>
                            <View style={[styles.tableCell, { width: '6%', borderRight: 0 }]}>
                                <Text> </Text>
                            </View>
                            <View style={[styles.tableCell, { width: '74%', textAlign: 'right' }]}>
                                <Text>TOTAL:</Text>
                            </View>
                            <View style={[styles.tableCell, { width: '20%', borderRight: 0, textAlign: 'right' }]}>
                                <Text>{item.jumlahBS.toLocaleString('id-ID') ?? 'N/A'}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Footer */}
                    <View style={styles.footer}>
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

const generateBsPDF = async (bonSementaraDetail) => {
    try {
        // Cek apakah Bon Sementara sudah disetujui
        if (bonSementaraDetail.status !== "Disetujui") {
            toast.error("Bon Sementara belum disetujui");
            return;
        }

        // Ambil nama reviewer sebelum PDF dirender
        const approvedReviewers = await getApprovedReviewerNames(bonSementaraDetail);

        // Buat dokumen PDF    
        const pdfBlob = await pdf(
            <BsPDF
                bonSementaraDetail={bonSementaraDetail}
                approvedReviewers={approvedReviewers}
            />,
        ).toBlob();

        const sanitizedKategori = bonSementaraDetail.bonSementara[0].kategori.replace(/\//g, '_');

        const storageRef = ref(storage, `BonSementara/${sanitizedKategori}/${bonSementaraDetail.displayId}/${bonSementaraDetail.displayId}.pdf`);
        await uploadBytes(storageRef, pdfBlob);

        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Gagal mengunduh:", error);
        toast.error("Gagal mengunduh Bon Sementara");
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

export { BsPDF, generateBsPDF };