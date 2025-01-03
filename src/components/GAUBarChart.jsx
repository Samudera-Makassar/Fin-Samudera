import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ClipLoader from "react-spinners/ClipLoader";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const GAUBarChart = ({ selectedType, selectedMonth, selectedYear, months }) => {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "reimbursement"));
                const data = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));

                const filteredData = data.filter((item) => {
                    const pengajuanDate = new Date(item.tanggalPengajuan);
                    const itemMonth = pengajuanDate.getMonth() + 1;
                    const itemYear = pengajuanDate.getFullYear();

                    const monthMatch = selectedMonth.value === "all" || itemMonth === parseInt(selectedMonth.value);
                    const yearMatch = selectedYear.value === "all" || itemYear === parseInt(selectedYear.value);

                    return (
                        item.kategori === "GA/Umum" &&
                        item.reimbursements.some(r => r.jenis === selectedType) &&
                        monthMatch &&
                        yearMatch
                    );
                });

                const flattenedData = filteredData.flatMap(item =>
                    item.reimbursements.filter(r => r.jenis === selectedType)
                );

                setChartData(flattenedData);
            } catch (error) {
                console.error("Error fetching data from Firestore:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedType) {
            fetchData();
        }
    }, [selectedType, selectedMonth, selectedYear]);

    const prepareChartData = () => {
        if (!chartData) return null;

        const itemCounts = chartData.reduce((acc, reimb) => {
            const itemName = reimb.item.toLowerCase();
            acc[itemName] = (acc[itemName] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(itemCounts).map(item =>
            item.split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        );
        const values = Object.values(itemCounts);

        return {
            labels,
            datasets: [
                {
                    label: 'Jumlah Item',
                    data: values,
                    backgroundColor: "rgba(75, 192, 192, 1)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };
    };

    const chartDisplayData = prepareChartData();

    if (isLoading || !chartData) {
        return (
            <div className="flex justify-center items-center h-96">
                <ClipLoader color="#36D7B7" size={60} />
            </div>
        );
    }

    const getPeriodText = () => {
        const monthName = selectedMonth.value === "all"
            ? "Semua Bulan"
            : months.find(m => m.value === selectedMonth.value)?.label;
        const yearText = selectedYear.value === "all"
            ? "Semua Tahun"
            : selectedYear.value;
        return `${monthName} ${yearText}`;
    };

    return (
        <div className="w-full">
            <h2 className="text-lg font-medium mb-4">
                Detail Item {selectedType} - {getPeriodText()}
            </h2>
            <div className="h-[400px]">
                {chartDisplayData && chartDisplayData.labels.length > 0 ? (
                    <Bar
                        data={chartDisplayData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "top",
                                    labels: {
                                        padding: 12,
                                        font: {
                                            size: 12,
                                        },
                                    },
                                },
                                datalabels: {
                                    color: '#fff',
                                    font: {
                                        weight: 'bold',
                                        size: 12
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: "Item",
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: "Jumlah",
                                    },
                                    ticks: {
                                        stepSize: 2,
                                        precision: 0,
                                        beginAtZero: true,
                                    },
                                },
                            },
                        }}
                    />
                ) : (
                    <p className="text-gray-500 py-16 text-center">Tidak ada data untuk {selectedType} pada periode {getPeriodText()}.</p>
                )}
            </div>
        </div>
    );
};

export default GAUBarChart;