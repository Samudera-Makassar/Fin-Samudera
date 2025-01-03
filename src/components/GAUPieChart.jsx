import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Select from "react-select";
import GAUBarChart from './GAUBarChart';
import GAUComparisonChart from "./GAUComparisonBarChart";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const GAUPieChart = () => {
    const [chartData, setChartData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState({ value: "all", label: "Semua Bulan" });
    const [selectedYear, setSelectedYear] = useState({ value: "all", label: "Semua Tahun" });
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

    const months = [
        { value: "all", label: "Semua Bulan" },
        { value: "1", label: "Januari" },
        { value: "2", label: "Februari" },
        { value: "3", label: "Maret" },
        { value: "4", label: "April" },
        { value: "5", label: "Mei" },
        { value: "6", label: "Juni" },
        { value: "7", label: "Juli" },
        { value: "8", label: "Agustus" },
        { value: "9", label: "September" },
        { value: "10", label: "Oktober" },
        { value: "11", label: "November" },
        { value: "12", label: "Desember" }
    ];

    const handleChartClick = (event) => {
        const chart = event.chart;
        const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true });

        if (activePoints.length > 0) {
            const index = activePoints[0].index;
            const label = chart.data.labels[index];
            const actualType = label.split(' (')[0];
            setSelectedCategory(actualType);
            setIsModalOpen(true);
        }
    };

    const jenisColors = {
        ATK: "rgba(255, 99, 132, 1)",
        RTG: "rgba(54, 162, 235, 1)",
        Entertaint: "rgba(255, 206, 86, 1)",
        Parkir: "rgba(75, 192, 192, 1)",
        "Meals Lembur": "rgba(153, 102, 255, 1)",
        "Meals Meeting": "rgba(255, 159, 64, 1)",
        "Jenis Lain": "rgba(201, 203, 207, 1)",
    };

    const updateChartData = (dataItems, month, year) => {
        if (!dataItems.length) {
            setChartData({
                labels: [],
                datasets: [],
            });
            return;
        }

        const filteredData = dataItems.filter(item => {
            if (item.kategori !== "GA/Umum") return false;

            const pengajuanDate = new Date(item.tanggalPengajuan);
            const itemYear = pengajuanDate.getFullYear();
            const itemMonth = pengajuanDate.getMonth() + 1;

            return (
                (year.value === "all" || itemYear === parseInt(year.value)) &&
                (month.value === "all" || itemMonth === parseInt(month.value))
            );
        });

        if (!filteredData.length) {
            setChartData({
                labels: [],
                datasets: [],
            });
            return;
        }

        const allReimbursements = filteredData.flatMap(item => item.reimbursements);
        const groupedData = allReimbursements.reduce((acc, reimb) => {
            const { jenis } = reimb;
            if (!acc[jenis]) acc[jenis] = 0;
            acc[jenis] += 1;
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const values = Object.values(groupedData);

        const labelWithCount = labels.map((label, index) => {
            const jenisCount = values[index];
            return `${label} (${jenisCount})`;
        });
        const backgroundColors = labels.map(label => jenisColors[label] || "rgba(201, 203, 207, 1)"); // Default color if jenis not found

        setChartData({
            labels: labelWithCount,
            datasets: [
                {
                    label: "Jumlah Pengajuan",
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1,
                },
            ],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            padding: 4,
                            usePointStyle: true,
                            font: { size: 12 },
                        },
                    },
                    datalabels: {
                        formatter: (value, context) => {                           
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${percentage}%`; 
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                    },
                },
            }
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "reimbursement"));
                const fetchedData = querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id
                }));

                const years = [...new Set(fetchedData.map(item =>
                    new Date(item.tanggalPengajuan).getFullYear()
                ))].sort((a, b) => b - a);

                const yearOptions = years.map(year => ({
                    value: year.toString(),
                    label: year.toString(),
                }));

                setAvailableYears(yearOptions);
                setRawData(fetchedData);

                if (years.length > 0) {
                    const initialYear = yearOptions[0];
                    setSelectedYear(initialYear);
                    updateChartData(fetchedData, selectedMonth, initialYear);
                }
            } catch (error) {
                console.error("Error fetching data from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const handleMonthChange = (option) => {
        setSelectedMonth(option);
        updateChartData(rawData, option, selectedYear);
    };

    const handleYearChange = (option) => {
        setSelectedYear(option);
        updateChartData(rawData, selectedMonth, option);
    };

    const selectStyles = {
        control: (base) => ({
            ...base,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: '#e5e7eb',
            fontSize: '12px',
            height: '32px',
            padding: '0 4px',
            lineHeight: 'normal',
            '&:hover': {
                borderColor: '#3b82f6'
            },
            borderRadius: '8px'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100
        }),
        option: (base) => ({
            ...base,
            fontSize: '12px',
            padding: '6px 12px',
            cursor: 'pointer'
        })
    };

    if (!chartData) {
        return (
            <div className="bg-white px-6 py-4 flex flex-col w-full shadow-sm rounded-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-medium">Jumlah Pengajuan GA/Umum</h2>
                    <div className="flex justify-end">
                        <Skeleton width={140} height={32} />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <Skeleton width={140} height={32} />
                    <Skeleton width={140} height={32} />
                </div>
                <div className="flex justify-center items-center h-full">
                    <Skeleton circle={true} height={240} width={240} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white px-6 py-4 flex flex-col w-full shadow-sm rounded-lg">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Jumlah Pengajuan GA/Umum</h2>
                <div
                    className="text-red-500 hover:text-red-600 text-sm font-semibold underline cursor-pointer"
                    onClick={() => setIsComparisonModalOpen(true)}
                >
                    Lihat Perbandingan
                </div>
            </div>

            <hr className="border-gray-100 my-2" />

            <div className="flex flex-col w-full h-full gap-2">
                <div className="flex justify-end space-x-2">
                    <Select
                        className="w-36"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        options={months}
                        styles={selectStyles}
                    />
                    <Select
                        className="w-36"
                        value={selectedYear}
                        onChange={handleYearChange}
                        options={[{ value: "all", label: "Semua Tahun" }, ...availableYears]}
                        styles={selectStyles}
                    />
                </div>

                <div className="flex justify-center items-center w-full h-full">
                    {chartData.labels.length === 0 ? (
                        <p className="text-gray-500 text-sm">Tidak ada pengajuan GA/Umum untuk periode yang dipilih</p>
                    ) : (
                        <Pie
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: "right",
                                        labels: {
                                            padding: 12,
                                            usePointStyle: true,
                                            font: { size: 12 },
                                        },
                                    },
                                    datalabels: {
                                        formatter: (value, ctx) => {
                                            const dataset = ctx.chart.data.datasets[0];
                                            const total = dataset.data.reduce((acc, data) => acc + data, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return `${percentage}%`;
                                        },
                                        color: '#fff',
                                        font: {
                                            weight: 'bold',
                                            size: 12
                                        },
                                        textAlign: 'center',
                                        display: function (context) {
                                            const dataset = context.dataset;
                                            const value = dataset.data[context.dataIndex];
                                            return value > 0;
                                        },
                                    }
                                },
                                onClick: handleChartClick,
                            }}
                        />
                    )}
                </div>
            </div>

            {isComparisonModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsComparisonModalOpen(false);
                        }
                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 max-w-6xl">
                        <button
                            onClick={() => setIsComparisonModalOpen(false)}
                            className="absolute top-4 right-7 text-gray-500 hover:text-gray-800 text-4xl"
                        >
                            &times;
                        </button>
                        <GAUComparisonChart
                            rawData={rawData}
                            selectedYear={selectedYear}
                        />
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsModalOpen(false);
                        }
                    }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <div className="bg-white rounded-lg shadow-lg p-6 relative w-3/4 max-w-6xl">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-7 text-gray-500 hover:text-gray-800 text-4xl"
                        >
                            &times;
                        </button>
                        <GAUBarChart
                            selectedType={selectedCategory}
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            months={months}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GAUPieChart;