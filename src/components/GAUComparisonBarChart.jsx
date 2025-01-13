import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Select from 'react-select';
import { ClipLoader } from 'react-spinners';

const GAUComparisonChart = ({ rawData, showLPJ = false }) => {
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
            setIsLoading(false);
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

    const getYearlyColor = (jenis, index, showLPJ = false) => {
        if (showLPJ) {
            return getMonthlyColor(index);
        }

        const jenisColors = {
            ATK: "rgba(255, 99, 132, 1)",
            RTG: "rgba(54, 162, 235, 1)",
            Entertaint: "rgba(255, 206, 86, 1)",
            Parkir: "rgba(75, 192, 192, 1)",
            "Meals Lembur": "rgba(153, 102, 255, 1)",
            "Meals Meeting": "rgba(255, 159, 64, 1)",
            "Jenis Lain": "rgba(201, 203, 207, 1)",
        };
        return jenisColors[jenis] || "rgba(0, 0, 0, 1)";
    };

    const prepareMonthlyData = () => {
        const capitalizeWords = (str) => {
            return str
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        const allItems = new Set();
        rawData.forEach(item => {
            if (item.kategori === "GA/Umum") {
                if (showLPJ && item.lpj) {
                    item.lpj.forEach(lpjItem => {
                        if (lpjItem.namaItem) {
                            allItems.add(capitalizeWords(lpjItem.namaItem));
                        }
                    });
                } else if (!showLPJ && item.reimbursements) {
                    item.reimbursements.forEach(reimb => {
                        if (reimb.item) {
                            allItems.add(capitalizeWords(reimb.item));
                        }
                    });
                }
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
                if (showLPJ && item.lpj) {
                    item.lpj.forEach(lpjItem => {
                        const normalizedItem = capitalizeWords(lpjItem.namaItem);
                        if (monthlyData[year][month][normalizedItem] !== undefined) {
                            monthlyData[year][month][normalizedItem] += lpjItem.jumlah || 1;
                        }
                    });
                } else if (!showLPJ && item.reimbursements) {
                    item.reimbursements.forEach(reimb => {
                        const normalizedItem = capitalizeWords(reimb.item);
                        if (monthlyData[year][month][normalizedItem] !== undefined) {
                            monthlyData[year][month][normalizedItem]++;
                        }
                    });
                }
            }
        });

        // Create datasets
        const datasets = [];
        items.forEach((item, colorIndex) => {
            selectedYears.forEach(yearOption => {
                const year = yearOption.value;
                const data = Array(12).fill(null).map((_, monthIndex) => {
                    const yearData = monthlyData[year];
                    return yearData ? yearData[monthIndex][item] : 0;
                });

                if (data.every(value => value === 0)) return;

                datasets.push({
                    label: `${item} (${year})`,
                    data: data,
                    backgroundColor: getMonthlyColor(colorIndex),
                    borderColor: getMonthlyColor(colorIndex),
                    borderWidth: 1,
                    stack: year,
                    itemId: item
                });
            });
        });

        setChartData({
            labels: months,
            datasets: datasets
        });
    };

    const prepareYearlyData = () => {
        const capitalizeWords = (str) => {
            return str
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        };

        const allTypes = new Set();
        rawData.forEach(item => {
            if (item.kategori === "GA/Umum") {
                if (showLPJ && item.lpj) {
                    item.lpj.forEach(lpjItem => {
                        if (lpjItem.namaItem) {
                            allTypes.add(capitalizeWords(lpjItem.namaItem));
                        }
                    });
                } else if (!showLPJ && item.reimbursements) {
                    item.reimbursements.forEach(reimb => {
                        if (reimb.jenis) allTypes.add(reimb.jenis);
                    });
                }
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
                if (showLPJ && item.lpj) {
                    item.lpj.forEach(lpjItem => {
                        const normalizedItem = capitalizeWords(lpjItem.namaItem);
                        if (yearlyTotals[year][normalizedItem] !== undefined) {
                            yearlyTotals[year][normalizedItem] += lpjItem.jumlah || 1;
                        }
                    });
                } else if (!showLPJ && item.reimbursements) {
                    item.reimbursements.forEach(reimb => {
                        if (reimb.jenis) {
                            yearlyTotals[year][reimb.jenis]++;
                        }
                    });
                }
            }
        });

        const datasets = types.map((type, index) => {
            const data = selectedYears.map(year => yearlyTotals[parseInt(year.value)][type]);

            if (data.every(value => value === 0)) return null;

            return {
                label: type,
                data: data,
                backgroundColor: getYearlyColor(type, index, showLPJ),
                borderColor: getYearlyColor(type, index, showLPJ),
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
                <h2 className="text-lg font-medium">
                    {showLPJ ? "Perbandingan Pengajuan LPJ BS GA/Umum" : "Perbandingan Pengajuan Reimbursement GA/Umum"}
                </h2>
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
                                    text: showLPJ ? 'Jumlah Item' : 'Jumlah Pengajuan'
                                },
                                ticks: {
                                    stepSize: 2,
                                    precision: 0
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                onClick: (e, legendItem, legend) => {
                                    const chart = legend.chart;
                                    const datasets = chart.data.datasets;
                                    const relatedDatasets = datasets.filter(
                                        ds => ds.itemId === legendItem.text
                                    );
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
                                        datasets.forEach(dataset => {
                                            if (dataset.itemId) {
                                                uniqueItems.add(dataset.itemId);
                                            }
                                        });
                                        return Array.from(uniqueItems).map((itemId, index) => {
                                            const dataset = datasets.find(ds => ds.itemId === itemId);
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
                                    const stackDatasets = context.chart.data.datasets.filter(
                                        ds => ds.stack === stack && !context.chart.getDatasetMeta(context.chart.data.datasets.indexOf(ds)).hidden
                                    );
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

                                        if (distance < smallestDistance ||
                                            (distance === smallestDistance &&
                                                stackDatasets.indexOf(dataset) < stackDatasets.indexOf(closestDataset))) {
                                            closestDataset = dataset;
                                            smallestDistance = distance;
                                        }
                                    });

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