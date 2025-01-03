import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ClipLoader } from 'react-spinners';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const GAUComparisonChart = ({ rawData }) => {
    const [viewType, setViewType] = useState('monthly');
    const [chartData, setChartData] = useState(null);
    const [selectedYears, setSelectedYears] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    useEffect(() => {
        if (rawData && rawData.length) {
            setIsLoading(true);
            const years = [...new Set(rawData
                .filter(item => item.kategori === "GA/Umum")
                .map(item => new Date(item.tanggalPengajuan).getFullYear())
            )].sort((a, b) => b - a);

            const yearOptions = years.map(year => ({
                value: year.toString(),
                label: year.toString()
            }));

            setAvailableYears(yearOptions);
            if (yearOptions.length >= 2) {
                setSelectedYears([yearOptions[0], yearOptions[1]]);
            } else if (yearOptions.length === 1) {
                setSelectedYears([yearOptions[0]]);
            }
            setIsLoading(false)
        }
    }, [rawData]);

    useEffect(() => {
        if (selectedYears.length > 0) {
            setIsLoading(true);
            prepareChartData();
            setIsLoading(false);
        }
    }, [rawData, viewType, selectedYears]);

    const getMonthlyColor = (index) => {
        const baseColors = [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40", "#9966FF",
            "#FFB6C1", "#8B4513", "#00BFFF", "#32CD32", "#FFD700", "#8A2BE2",
            "#FF6347", "#9ACD32", "#DC143C", "#FF1493", "#00FF7F", "#7FFF00",
            "#1E90FF", "#D2691E", "#8FBC8F", "#FF4500", "#ADFF2F", "#6495ED",
            "#BA55D3", "#87CEEB", "#9370DB", "#3CB371", "#FF69B4", "#40E0D0",
            "#4682B4", "#DA70D6", "#708090", "#2E8B57", "#FFA07A", "#6A5ACD",
            "#20B2AA", "#5F9EA0", "#FFDAB9", "#EE82EE", "#F08080", "#98FB98"
        ];
        return baseColors[index % baseColors.length];
    };


    const getYearlyColor = (jenis) => {
        const jenisColors = {
            ATK: "rgba(255, 99, 132, 1)",
            RTG: "rgba(54, 162, 235, 1)",
            Entertaint: "rgba(255, 206, 86, 1)",
            Parkir: "rgba(75, 192, 192, 1)",
            "Meals Lembur": "rgba(153, 102, 255, 1)",
            "Meals Meeting": "rgba(255, 159, 64, 1)",
            "Jenis Lain": "rgba(201, 203, 207, 1)",
        };
        return jenisColors[jenis] || "rgba(0, 0, 0, 1)"
    };

    const prepareMonthlyData = () => {
        const capitalizeWords = (str) => {
            // if (str === str.toUpperCase()) {
            //     return str;
            // }
            return str
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        // Get all unique items
        const allItems = new Set();
        rawData.forEach(item => {
            if (item.kategori === "GA/Umum") {
                item.reimbursements.forEach(reimb => {
                    const normalizedItem = capitalizeWords(reimb.item);
                    allItems.add(normalizedItem);
                });
            }
        });
        const items = Array.from(allItems);

        // Initialize data structure
        const monthlyData = {};
        selectedYears.forEach(yearOption => {
            const year = yearOption.value;
            monthlyData[year] = Array(12).fill(null).map(() =>
                Object.fromEntries(items.map(item => [item, 0]))
            );
        });

        // Fill the data
        rawData.forEach(item => {
            if (item.kategori !== "GA/Umum") return;

            const date = new Date(item.tanggalPengajuan);
            const year = date.getFullYear().toString();
            const month = date.getMonth();

            if (monthlyData[year]) {
                item.reimbursements.forEach(reimb => {
                    const normalizedItem = capitalizeWords(reimb.item);
                    if (monthlyData[year][month][normalizedItem] !== undefined) {
                        monthlyData[year][month][normalizedItem]++;
                    }
                });
            }
        });

        // Create labels for months
        const labels = months.map(month => month);

        // Create datasets - one for each unique item across all years
        const datasets = [];
        items.forEach((item, colorIndex) => {
            selectedYears.forEach(yearOption => {
                const year = yearOption.value;
                const data = Array(12).fill(null).map((_, monthIndex) => {
                    const yearData = monthlyData[year];
                    return yearData ? yearData[monthIndex][item] : 0;
                });

                // Skip if all values are zero
                if (data.every(value => value === 0)) return;

                datasets.push({
                    label: `${item} (${year})`,  // Add year to label for distinction
                    data: data,
                    backgroundColor: getMonthlyColor(colorIndex), // Same color for same item
                    borderColor: getMonthlyColor(colorIndex),
                    borderWidth: 1,
                    stack: year,
                    itemId: item // Add itemId for legend grouping
                });
            });
        });

        setChartData({
            labels: labels,
            datasets: datasets
        });
    };

    const prepareYearlyData = () => {
        // Get all unique types
        const allTypes = new Set();
        rawData.forEach(item => {
            if (item.kategori === "GA/Umum") {
                item.reimbursements.forEach(reimb => {
                    allTypes.add(reimb.jenis);
                });
            }
        });
        const types = Array.from(allTypes);

        // Count items by year and type
        const yearlyTotals = {};
        selectedYears.forEach(yearOption => {
            const year = parseInt(yearOption.value);
            yearlyTotals[year] = Object.fromEntries(types.map(type => [type, 0]));
        });

        rawData.forEach(item => {
            if (item.kategori !== "GA/Umum") return;

            const year = new Date(item.tanggalPengajuan).getFullYear();
            if (yearlyTotals[year]) {
                item.reimbursements.forEach(reimb => {
                    yearlyTotals[year][reimb.jenis]++;
                });
            }
        });

        const datasets = types.map((type, index) => {
            const data = selectedYears.map(year => yearlyTotals[parseInt(year.value)][type]);

            // Exclude datasets with no data
            if (data.every(value => value === 0)) return null;

            return {
                label: type,
                data: data,
                backgroundColor: getYearlyColor(type),
                borderColor: getYearlyColor(type),
                borderWidth: 1,
                stack: '',
                itemId: type
            };
        }).filter(dataset => dataset !== null);

        setChartData({
            labels: selectedYears.map(year => `${year.value}`),
            datasets: datasets
        });
    };

    const prepareChartData = () => {
        if (!rawData || !rawData.length || selectedYears.length === 0) return;

        if (viewType === 'monthly') {
            prepareMonthlyData();
        } else {
            prepareYearlyData();
        }
    };

    const selectStyles = {
        control: (base) => ({
            ...base,
            minHeight: '32px',
            fontSize: '14px'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100
        }),
        multiValue: (base) => ({
            ...base,
            fontSize: '14px'
        })
    };

    if (isLoading || !chartData) {
        return (
            <div className="flex justify-center items-center h-96">
                <ClipLoader color="#36D7B7" size={60} />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 mr-12">
                <h2 className="text-lg font-medium">Perbandingan Pengajuan GA/Umum</h2>
                <div className="flex items-center space-x-4">
                    <div className="w-96">
                        <Select
                            isMulti
                            value={selectedYears}
                            onChange={setSelectedYears}
                            options={availableYears}
                            styles={selectStyles}
                            placeholder="Pilih tahun untuk dibandingkan"
                            className="text-sm"
                        />
                    </div>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio text-blue-600"
                            name="viewType"
                            value="monthly"
                            checked={viewType === 'monthly'}
                            onChange={(e) => setViewType(e.target.value)}
                        />
                        <span className="ml-2 text-sm">Per Bulan</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            className="form-radio text-blue-600"
                            name="viewType"
                            value="yearly"
                            checked={viewType === 'yearly'}
                            onChange={(e) => setViewType(e.target.value)}
                        />
                        <span className="ml-2 text-sm">Per Tahun</span>
                    </label>
                </div>
            </div>
            <div className="h-[400px]">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                grid: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: viewType === 'monthly' ? 'Bulan' : 'Tahun'
                                }
                            },
                            y: {
                                stacked: true,
                                title: {
                                    display: true,
                                    text: 'Jumlah Pengajuan'
                                },
                                ticks: {
                                    stepSize: 2,
                                    precision: 0
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                onClick: (e, legendItem, legend) => {
                                    const chart = legend.chart;
                                    const datasets = chart.data.datasets;

                                    // Temukan semua dataset dengan itemId yang sama
                                    const relatedDatasets = datasets.filter(
                                        ds => ds.itemId === legendItem.text
                                    );

                                    // Toggle visibility untuk semua dataset dengan itemId yang sama
                                    relatedDatasets.forEach(dataset => {
                                        const index = datasets.indexOf(dataset);
                                        const meta = chart.getDatasetMeta(index);
                                        meta.hidden = !meta.hidden;
                                    });

                                    chart.update();
                                },
                                labels: {
                                    generateLabels: (chart) => {
                                        const datasets = chart.data.datasets;
                                        const uniqueItems = new Set();

                                        // Kumpulkan item unik berdasarkan nama
                                        datasets.forEach(dataset => {
                                            if (dataset.itemId) {
                                                uniqueItems.add(dataset.itemId);
                                            }
                                        });

                                        // Buat label untuk setiap item unik
                                        return Array.from(uniqueItems).map((itemId, index) => {
                                            const dataset = datasets.find(ds => ds.itemId === itemId);

                                            // Cek apakah semua dataset dengan itemId ini tersembunyi
                                            const relatedDatasets = datasets.filter(ds => ds.itemId === itemId);
                                            const isHidden = relatedDatasets.every(ds =>
                                                chart.getDatasetMeta(datasets.indexOf(ds)).hidden
                                            );

                                            return {
                                                text: itemId,
                                                fillStyle: dataset.backgroundColor,
                                                strokeStyle: dataset.borderColor,
                                                lineWidth: dataset.borderWidth,
                                                hidden: isHidden,
                                                index: index
                                            };
                                        });
                                    }
                                }
                            },
                            datalabels: {
                                display: (context) => {
                                    if (viewType !== 'monthly') return false;

                                    const stack = context.dataset.stack;
                                    const dataIndex = context.dataIndex;

                                    // Get all datasets in the same stack that are not hidden
                                    const stackDatasets = context.chart.data.datasets.filter(
                                        ds => ds.stack === stack && !context.chart.getDatasetMeta(context.chart.data.datasets.indexOf(ds)).hidden
                                    );

                                    // Calculate total value for this stack at this index
                                    const stackTotal = stackDatasets.reduce((sum, dataset) => {
                                        return sum + (dataset.data[dataIndex] || 0);
                                    }, 0);

                                    if (stackTotal === 0) return false;
                                    const middleOfStack = stackTotal / 2;

                                    // Find the dataset whose middle point is closest to stack's middle
                                    let closestDataset = null;
                                    let smallestDistance = Infinity;

                                    stackDatasets.forEach((dataset, idx) => {
                                        const sumBefore = stackDatasets
                                            .slice(0, idx)
                                            .reduce((sum, d) => sum + (d.data[dataIndex] || 0), 0);
                                        const value = dataset.data[dataIndex] || 0;
                                        const middlePoint = sumBefore + (value / 2);
                                        const distance = Math.abs(middleOfStack - middlePoint);

                                        // Update closest dataset if this one is closer or at same distance but earlier in stack
                                        if (distance < smallestDistance ||
                                            (distance === smallestDistance &&
                                                stackDatasets.indexOf(dataset) < stackDatasets.indexOf(closestDataset))) {
                                            closestDataset = dataset;
                                            smallestDistance = distance;
                                        }
                                    });

                                    // Only show label for the closest dataset
                                    return context.dataset === closestDataset;
                                },
                                formatter: (value, context) => {
                                    if (viewType === 'monthly') {
                                        return context.dataset.stack;
                                    }
                                    return '';
                                },
                                font: {
                                    size: 10,
                                    weight: 'bold'
                                },
                                color: '#FFF',
                                anchor: 'center',
                                align: 'center',
                                rotation: -90,
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default GAUComparisonChart;