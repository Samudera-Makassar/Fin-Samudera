import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import Logo from '../assets/images/logo-samudera.png'

Font.register({
  family: 'Poppins',
  fonts: [
    { src: require('../assets/fonts/Poppins-Regular.ttf') }, 
    { src: require('../assets/fonts/Poppins-SemiBold.ttf'), fontWeight: 'semibold' }, 
    { src: require('../assets/fonts/Poppins-Bold.ttf'), fontWeight: 'bold' }, 
    { src: require('../assets/fonts/Poppins-Italic.ttf'), fontStyle: 'italic' }, 
  ],
});

Font.register({
  family: 'Optima',
  fonts: [
    { src: require('../assets/fonts/Optima.ttf') }, 
    { src: require('../assets/fonts/Optima_Medium.ttf'), fontWeight: 'medium' }, 
    { src: require('../assets/fonts/Optima_B.ttf'), fontWeight: 'bold' }, 
    { src: require('../assets/fonts/Optima_Italic.ttf'), fontStyle: 'italic' }, 
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 24,
    fontFamily: 'Poppins'
  },
  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 4
  // },
  logo: {
    width: 160,
    height: 24,
    marginBottom: 8, 
    alignSelf: 'flex-start' 
  },
  companyInfo: {
    alignItems: 'flex-end',
    marginBottom: 8,
    // fontFamily: 'Optima'
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'normal'
  },
  tableContainer: {
    marginTop: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    borderTopWidth: 1, 
    borderColor: '#000'
    // backgroundColor: '#d3d3d3',
    // fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
    padding: 4,
    flex: 1,
    textAlign: 'left',
    borderBottomWidth: 1, 
    // borderLeftWidth: 1, 
    // borderRightWidth: 1, 
    borderColor: '#000'
  },
  fullWidthCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    // fontWeight: 'bold',
    // borderBottomWidth: 1,
    // borderColor: '#000',
  },
  totalText: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    fontSize: 10,    
    fontWeight: 'semibold'
  },
  bankInfo: {    
    borderWidth: 2,
    borderColor: '#000',
    fontSize: 8, 
    fontWeight: 'semibold',   
    padding: 4    
  },
  signature: {
    fontSize: 8,
    // marginTop: 48,
    alignSelf: 'flex-end'
  }
});

const ReimbursementPDF = ({ reimbursementDetail }) => {
  if (!reimbursementDetail || reimbursementDetail.status !== 'Disetujui') {
    return null;
  }

  // Fungsi untuk mengubah angka menjadi terbilang
  const terbilang = (angka) => {
    const bilangan = [
      '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh',
      'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas',
      'Tujuh belas', 'Delapan belas', 'Sembilan belas'
    ];
    const satuan = ['', 'Ribu', 'Juta', 'Miliar', 'Triliun'];

    if (angka < 20) return bilangan[angka];

    const prosesTerbilang = (num) => {
      if (num < 20) return bilangan[num];
      if (num < 100) {
        const depan = Math.floor(num / 10);
        const belakang = num % 10;
        return (depan === 1 ? 'Sepuluh' : bilangan[depan] + ' Puluh') + 
               (belakang > 0 ? ' ' + bilangan[belakang] : '');
      }
      if (num < 1000) {
        const depan = Math.floor(num / 100);
        const belakang = num % 100;
        return (depan === 1 ? 'Seratus' : bilangan[depan] + ' Ratus') + 
               (belakang > 0 ? ' ' + prosesTerbilang(belakang) : '');
      }
      return '';
    };

    const formatTerbilang = (num) => {
      if (num === 0) return 'nol';
      
      let result = '';
      let sisa = num;
      let tingkat = 0;

      while (sisa > 0) {
        const bagian = sisa % 1000;
        if (bagian !== 0) {
          const sebutan = prosesTerbilang(bagian);
          result = sebutan + ' ' + satuan[tingkat] + ' ' + result;
        }
        sisa = Math.floor(sisa / 1000);
        tingkat++;
      }

      return result.trim() + ' Rupiah';
    };

    return formatTerbilang(angka);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={Logo} style={styles.logo} />
      {/* <View style={styles.header}> */}
        <View style={[styles.companyInfo, { fontFamily: 'Optima' }]}>
          <Text style={styles.title}>{reimbursementDetail.user?.unit || '-'}</Text>
          <Text style={styles.subtitle}>Jl. Sungai Saddang No. 82, Kota Makassar</Text>
          <Text style={[styles.subtitle, { marginTop: 12, fontWeight: 'bold' }]}>samudera.id</Text>
          <Text style={[styles.subtitle, { fontSize: 8 }]}>A member of the SAMUDERA INDONESIA GROUP</Text>
        </View>
        {/* </View> */}

        <View style={styles.tableContainer}>          
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 'semibold' }]}>
              REIMBURSEMENT
            </Text>
          </View>

          {/* Header Tabel */}
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 0.1, textAlign: 'center', borderRight: 1 }]}>NO.</Text>
            <Text style={[styles.tableCell, { flex: 0.7, textAlign: 'center', borderRight: 1 }]}>ACTIVITIES NAME</Text>
            <Text style={[styles.tableCell, { flex: 0.2, textAlign: 'center'}]}>JUMLAH (IDR)</Text>
          </View>

          {/* Baris untuk deskripsi Biaya Reimburse */}
          <View style={[styles.tableRow]}>
            <Text style={[styles.tableCell, { flex: 0.1, borderRight: 1 }]}> </Text>
            <Text style={[styles.tableCell, { flex: 0.7, fontWeight: 'semibold', textTransform: 'uppercase', borderRight: 1 }]}>
              BIAYA REIMBURSE {reimbursementDetail.user?.nama || '-'} UNTUK KEGIATAN {reimbursementDetail.kategori || '-'}
            </Text>
            <Text style={[styles.tableCell, { flex: 0.2 }]}> </Text>
          </View>

          {/* Baris Data */}
          {reimbursementDetail.reimbursements?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.1, textAlign: 'center', borderRight: 1 }]}>{index + 1}</Text>
              <View style={[styles.tableCell, { flex: 0.7, flexDirection: 'row', borderRight: 1 }]}>
                <Text style={{ width: 100 }}>
                  {item.tanggal 
                    ? new Date(item.tanggal).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      }).replace(/\./g, '').replace(/\s/g, '-')
                    : '-'}
                </Text>
                <Text style={{ marginLeft: 10 }}>
                  {item.jenis || '-'}
                </Text>
              </View>
              <Text style={[styles.tableCell, { flex: 0.2, textAlign: 'right'}]}>
                {(item.biaya || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          ))}

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.1, borderRight: 1 }]}> </Text>
            <Text style={[styles.tableCell, { flex: 0.7, textAlign: 'right', borderRight: 1 }]}>
              TOTAL
            </Text>
            <Text style={[styles.tableCell, { flex: 0.2, textAlign: 'right'}]}>
              Rp{reimbursementDetail.totalBiaya?.toLocaleString('id-ID') || '-'}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              TERBILANG: {terbilang(reimbursementDetail.totalBiaya || 0)}
            </Text>
          </View>
          
          <Text style={[styles.subtitle, {marginTop: 24, paddingHorizontal: 4, fontSize: 8}]}>Dokumen Ini Sudah Mendukung Signature Digital</Text>

          <View style={[styles.container, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <View style={[styles.bankInfo, { width: '40%', flexDirection: 'row' }]}>
              {/* Label */}
              <View style={{ flexDirection: 'column', marginRight: 4, textAlign: 'right'}}>
                <Text style={{ marginBottom: 4 }}>Nama Account</Text>
                <Text style={{ marginBottom: 4 }}>Bank Penerima</Text>
                <Text style={{ marginBottom: 4 }}>No Rekening</Text>
              </View>
              {/* Tanda Titik Dua */}
              <View style={{ flexDirection: 'column', marginRight: 4, textAlign: 'center' }}>
                <Text style={{ marginBottom: 4 }}>:</Text>
                <Text style={{ marginBottom: 4 }}>:</Text>
                <Text style={{ marginBottom: 4 }}>:</Text>
              </View>
              {/* Value */}
              <View style={{ flexDirection: 'column', textAlign: 'left' }}>
                <Text style={{ marginBottom: 4 }}>{reimbursementDetail.user?.nama || '-'}</Text>
                <Text style={{ marginBottom: 4 }}>{reimbursementDetail.user?.bankName || '-'}</Text>
                <Text style={{ marginBottom: 4 }}>{reimbursementDetail.user?.accountNumber || '-'}</Text>
              </View>
            </View>

            <Text style={[styles.signature, { marginLeft: 'auto', marginBottom: 0, textAlign: 'right', width: '70%' }]}>
              Approved by {reimbursementDetail.user?.reviewer1 || '-'} & {reimbursementDetail.user?.reviewer2 || '-'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const downloadReimbursementPDF = async (reimbursementDetail) => {
  try {
    // Cek apakah reimbursement sudah disetujui
    if (reimbursementDetail.status !== 'Disetujui') {
      alert('Reimbursement belum disetujui');
      return;
    }

    // Buat dokumen PDF
    const pdfBlob = await pdf(
      <ReimbursementPDF reimbursementDetail={reimbursementDetail} />
    ).toBlob();

    // Buat nama file dengan format yang sesuai
    const fileName = `Reimbursement_${reimbursementDetail.user?.nama || 'Unnamed'}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Gunakan file-saver untuk download
    saveAs(pdfBlob, fileName);

  } catch (error) {
    console.error('Gagal membuat PDF:', error);
    alert('Gagal membuat PDF Reimbursement');
  }
};

export { 
  ReimbursementPDF, 
  downloadReimbursementPDF 
};