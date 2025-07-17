Chart.register(ChartDataLabels);
let monthlyChart, dailyChart;
let lotWiseSpendingChart, lotWiseReservationPercentageChart, reservationBarChart;
const loader = document.getElementById('loader');
const canvasInsightsArray = document.getElementsByClassName('canvas-insights');

function generateBasicInsights(labels, data) {
    if (!data || data.length === 0) return 'No spending data available for this year on TruLot.';

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const total = data.reduce((a, b) => a + b, 0);   // a is accumulator, b is current value => eg : In first iteration 0 + val1, In 2nd iteration => 0 + Val2, .....
    const avg = total / data.length;
    const maxMonth = labels[data.indexOf(maxVal)];
    const minMonth = labels[data.indexOf(minVal)];

    const spendingTrend = maxVal === minVal
        ? `Your spending remained consistent across all months.`
        : `Your highest spending occurred in **${maxMonth}** with ₹${maxVal.toFixed(2)}, while the lowest was in **${minMonth}** at ₹${minVal.toFixed(2)}.`;

    return `Here's a quick overview of your monthly expenditure:\n\n` +
           `${spendingTrend} On average, you spent around ₹${avg.toFixed(2)} per month.\n\n` +
           `This suggests ${avg > 1000 ? 'moderate to high' : 'low to moderate'} activity on your account. ` +
           `Keep tracking your spending to manage your finances better.`;
}

function generateLotWiseActivePastReservationInsights(lots, active_reservations, past_reservations) {
    if (!lots || lots.length === 0) return 'No reservation data available for this year.';

    const totalPerLot = lots.map((lot, i) => ({
        lot,
        active: active_reservations[i],
        past: past_reservations[i],
        total: active_reservations[i] + past_reservations[i]
    }));

    const sortedByTotal = [...totalPerLot].sort((a, b) => b.total - a.total);
    const topLot = sortedByTotal[0];
    const bottomLot = sortedByTotal[sortedByTotal.length - 1];

    // Overall totals
    const totalActiveReservations = active_reservations.reduce((a, b) => a + b, 0);
    const totalPastReservations = past_reservations.reduce((a, b) => a + b, 0);
    const totalReservations = totalActiveReservations + totalPastReservations;

    return (
        `🅿️ TruLot Parking Lot Reservation Summary:\n` +
        `• Total Reservations: ${totalReservations} (Active: ${totalActiveReservations}, Completed: ${totalPastReservations})\n` +
        `• Top Lot: ${topLot.lot} (${topLot.total} total → Active: ${topLot.active}, Completed: ${topLot.past})\n` +
        `• Least Used Lot: ${bottomLot.lot} (${bottomLot.total} total → Active: ${bottomLot.active}, Completed: ${bottomLot.past})\n` +
        `These insights help identify the most and least utilized parking areas for better space management.`
    );
}

function generateLotWiseSpendingInsights(labels, data) {
    if (!data || data.length === 0){
        return 'No lot-wise spending data available for this year on TruLot.';
    }

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const total = data.reduce((a, b) => a + b, 0);
    const avg = total / data.length;
    const maxLotName = labels[data.indexOf(maxVal)];
    const minLotName = labels[data.indexOf(minVal)];

    const spendingPattern = maxVal === minVal
        ? `You spent a similar amount across all parking lots.`
        : `You spent the most at **${maxLotName}** (₹${maxVal.toFixed(2)}), and the least at **${minLotName}** (₹${minVal.toFixed(2)}).`;

    return `Here's your lot-wise spending summary:\n\n` +
           `${spendingPattern} On average, you spent ₹${avg.toFixed(2)} per lot.\n\n` +
           `This gives an idea of which lots you frequent the most. Use this insight to better manage your parking budget.`;
}

function generateLotWiseReservationPercentageInsights(labels, data) {
    if (!data || data.length === 0 || !labels || labels.length === 0) {
        return 'No reservation data available for this year on TruLot.';
    }

    const total = data.reduce((sum, val) => sum + val, 0);
    const maxVal = Math.max(...data);   // spreading data array
    const minVal = Math.min(...data);

    const maxIndex = data.indexOf(maxVal);
    const minIndex = data.indexOf(minVal);

    const maxLotName = labels[maxIndex];
    const minLotName = labels[minIndex];

    const majorShare = maxVal >= 50 
        ? `Over half of your reservations (${maxVal}%) were made in **${maxLotName}**.`
        : `The highest share of your reservations (${maxVal}%) went to **${maxLotName}**.`;

    const leastShare = maxVal === minVal
        ? `You used all lots evenly.`
        : `The least used lot was **${minLotName}**, accounting for only ${minVal}%.`;

    const lotCount = labels.length;

    return `Here's your reservation breakdown for the year:\n` +
           `• You used **${lotCount}** different parking lots from TruLot.\n` +
           `• ${majorShare}\n` +
           `• ${leastShare}\n` +
           `This pattern reflects your preferred parking locations....`;
}

// -------------------------------------------------------- CANVAS -------------------------------

async function loadMonthlyChartByYear(forcedYear = null) {    
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;    // set current year in dropdown on page load
    document.getElementById('summaryTitle').textContent = `Your Monthly Expenditures Summary ${year}`;

    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/userDashboard/monthly-spend/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }
        canvasInsightsArray[0].innerHTML = generateBasicInsights(result.labels, result.data).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (monthlyChart) monthlyChart.destroy();
        monthlyChart = new Chart(document.getElementById('monthlyChart'), {
            type: 'line',
            data: {
                labels: result.labels,
                datasets: [{
                    // label: `Your Monthly Spending on TruLot in ${year}`,
                    data: result.data,
                    borderColor: '#14b8a6',
                    backgroundColor: '#bae4dfb0',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: false,
                onClick: (e, element) => {       // onclick event each element(month spend point)
                    if (element.length > 0) {
                        console.log(element);   //
                        const monthIndex = element[0].index + 1;
                        loadDailyChart(monthIndex, year);
                    }
                },

                onHover: (event, chartElement) => { 
                    const canvas = event.native ? event.native.target : event.target;        // An array of elements (bars, points, etc.) that the mouse is currently hovering over. If the array is empty, the cursor is not over a chart element.
                    if (chartElement.length > 0) {                 //  the user is currently hovering over something like a bar, line point, etc.
                        canvas.style.cursor = 'pointer';
                    } else {
                        canvas.style.cursor = 'default';
                    }
                },

                plugins: {
                    legend:{
                        display: false
                    },

                    tooltip: {
                        callbacks: {
                            label: context => `₹${context.parsed.y.toFixed(2)}`    // tooltip, shows corresponding y value(amount spend)
                        }
                    },

                    datalabels: {
                        display: true,
                        color: '#000',
                        font: {
                            weight: 'lighter',
                            size: 11
                        },
                        formatter: value => `${value.toFixed(2)}` // 
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount Spend in Ruppees(₹)',
                            color: '#14b8a6',
                            font: {
                                size: 16, 
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,   
                                bottom: 10,
                            }
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            },
                            color: '#0b0b0ba2'
                        },
                        grid: {
                            lineWidth: 2,     // Thicker grid lines for y-axis
                            color: '#e5e5e5'
                        }
                    },

                    x: {
                        title: {
                            display: true,
                            text: 'Month-Wise Spending on TruLot',
                            color: '#14b8a6',
                            font: {
                                size: 18,
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            },
                            color: '#0b0b0ba2'
                        },
                        grid: {
                            lineWidth: 2,
                            color: '#f2f2f2'
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.log(err);
        loader.style.display = 'none';
        await customAlert('Error loading summarised data');
        return;
    }finally{
        loader.style.display = 'none';
    }
}

async function loadDailyChart(month, year) {
    try{
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/userDashboard/spend/daily/${month}/${year}`);
        const result = await response.json();

        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }
        
        document.getElementById('canvas-wrapper-monthly').style.display = 'none';
        document.getElementById('yearSelect').style.display = 'none';
        document.getElementById('canvas-wrapper-daily').style.display = 'block';

        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        document.getElementById('summaryTitle').textContent = `Your Daily Expenditures in ${monthName} ${year}`;

        if (dailyChart) dailyChart.destroy();

        dailyChart = new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: result.labels,
                datasets: [{
                    // label: `Daily Spending on TruLot in ${monthName} ${year}`,
                    data: result.data,
                    borderColor: '#14b8a6',
                    backgroundColor: '#bae4dfb0',
                    tension: 0.1,
                    fill: false
                }]
            },

            options: {
                responsive: false,
                plugins: {
                    legend:{
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `₹${context.parsed.y.toFixed(2)}`
                        }
                    },
                    datalabels: {
                        display: false,
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount Spend in Rupees(₹)',
                            color: '#14b8a6',
                            font: {
                                size: 18,
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: `Day of ${monthName} Month`,
                            color: '#14b8a6',
                            font: {
                                size: 18,
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }catch(err) {
        console.error(err);
        loader.style.display = 'none';
        await customAlert('Error loading daily data');
        return;
    }finally{
        loader.style.display = 'none';
    }
}

async function loadLotWiseSpendingsByYear(forcedYear = null) {    
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;    // set current year in dropdown on page load
    document.getElementById('summaryTitle-lotwise').textContent = `Your Lot-Wise Expenditures Summary ${year}`;
    
    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/userDashboard/lot-wise-spending/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }

        canvasInsightsArray[1].innerHTML = generateLotWiseSpendingInsights(result.labels, result.data).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (lotWiseSpendingChart) lotWiseSpendingChart.destroy();
        lotWiseSpendingChart = new Chart(document.getElementById('lotWiseSpendingChart'), {
            type: 'bar',
            data: {
                labels: result.labels,
                datasets: [{
                    data: result.data,
                    backgroundColor: '#bae4dfb0',
                    borderColor: '#14b8a6',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Amount Spend Lot-Wise(₹)',
                            color: '#14b8a6',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        },
                        ticks: {
                            stepSize: 500,
                            color: '#333',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            lineWidth: 2,
                            color: '#f2f2f2'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Parking Lots',
                            color: '#14b8a6',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        },
                        ticks: {
                            color: '#333',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    title: {
                        display: false,
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `₹${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: '#000',
                        font: {
                            weight: 'lighter',
                            size: 11
                        },
                        formatter: value => `${value.toFixed(2)}` // 
                    }
                }
            }
        });
    }catch(err){
        console.log(err);
        loader.style.display = 'none';
        await customAlert('Error loading summarised data');
        return;
    }finally{
        loader.style.display = 'none';
    }
}

async function loadLotWiseReservationPercentageByYear(forcedYear = null) {    
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;    // set current year in dropdown on page load
    document.getElementById('lot-wise-reservations-pie-chart-h1').textContent = `Your Lot-Wise Reservation Summary ${year}`;
    
    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/userDashboard/lot-wise-reservation-percentage/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }

        canvasInsightsArray[2].innerHTML = generateLotWiseReservationPercentageInsights(result.labels, result.data).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (lotWiseReservationPercentageChart) lotWiseReservationPercentageChart.destroy();
        lotWiseReservationPercentageChart = new Chart(document.getElementById('lot-wise-reservations-pie-chart'), {
            type: 'pie',
            data: {
                labels: result.labels,
                datasets: [{
                    data: result.data,
                    backgroundColor: [
                        '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#c084fc', '#fb7185', '#2dd4bf'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const label = context.label || '';
                                const value = context.parsed;
                                return `${label}: ${value}%`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#000',
                        font: {
                            weight: 'lighter',
                            size: 11
                        },
                        formatter: (value) => `${value}%`
                    },
                    title: {
                        display: false,
                    }
                }
            }
        });
    }catch(err){
        console.log(err);
        loader.style.display = 'none';
        await customAlert('Error loading summarised data');
        return;
    }finally{
        loader.style.display = 'none';
    }
};

async function loadLotWiseReservationChartByYear(forcedYear = null) {
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;  
    document.getElementById('active-past-reservation-h1').textContent = `Your Active & Completed Reservation for year ${year}`;
    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/userDashboard/active-past-reservation-lotWise/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            await customAlert('Failed to load reservation data');
            return;
        }
        
        const { lots, active_reservations, past_reservations } = result;    // destructure the result object using keys
        canvasInsightsArray[3].innerHTML = generateLotWiseActivePastReservationInsights(lots, active_reservations, past_reservations).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (reservationBarChart) reservationBarChart.destroy();
        reservationBarChart = new Chart(document.getElementById('lotWiseReservationChart'), {
            type: 'bar',
            data: {
                labels: lots,   // x-axis
                datasets: [       // y-axis
                    {
                        label: 'Active Reservations',
                        data: active_reservations,
                        backgroundColor: '#34d399',
                        stack: 'Stack 0'
                    },
                    {
                        label: 'Past Reservations',
                        data: past_reservations,
                        backgroundColor: '#60a5fa',
                        stack: 'Stack 1'
                    }
                ]
            },
            options: {
                responsive: false,
                plugins: {
                    legend:{
                        display: true
                    },
                    title: {
                        display: false,
                    },

                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                        }
                    },
                    datalabels: {
                        color: '#000',
                        font: {
                            weight: 'lighter',
                            size: 11
                        },
                        formatter: (value) => `${value}`
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Parking Lot (TruLot)',
                            color: '#14b8a6',
                            font: {
                                size: 16, 
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,   
                                bottom: 10,
                            }
                        },
                        ticks: {
                            font: { weight: 'bold' },
                            color: '#0b0b0ba2'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Reservation Status Lot-Wise',
                            color: '#14b8a6',
                            font: {
                                size: 16, 
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,   
                                bottom: 10,
                            }
                        },
                        ticks: {
                            precision: 0,
                            font: { weight: 'bold' },
                            color: '#0b0b0ba2'
                        },
                        grid: {
                            lineWidth: 2,
                            color: '#f2f2f2'
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.error(err);
        await customAlert('Something went wrong while loading chart');
    } finally {
        loader.style.display = 'none';
    }
}

const currentYear = new Date().getFullYear();
window.onload = () => {
    // history.replaceState({ view: 'monthly' }, '', window.location.href); // Push initial state => monthly
    loadMonthlyChartByYear(currentYear);
    loadLotWiseSpendingsByYear(currentYear);
    loadLotWiseReservationPercentageByYear(currentYear);
    loadLotWiseReservationChartByYear(currentYear);
};

function handleYearChange() {
    // const year = document.getElementById('yearSelect').value;
    loadMonthlyChartByYear();
    loadLotWiseSpendingsByYear();
    loadLotWiseReservationPercentageByYear();
    loadLotWiseReservationChartByYear();
}

document.getElementById('back-i').addEventListener('click', async() => {
    const dailyView = document.getElementById('canvas-wrapper-daily');
    const monthlyView = document.getElementById('canvas-wrapper-monthly');
    const yearSelect = document.getElementById('yearSelect');

    if (dailyView.style.display === 'block') {
        loader.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 500));
        loader.style.display = 'none';
        dailyView.style.display = 'none';
        monthlyView.style.display = 'block';
        yearSelect.style.display = 'inline-block';

        const year = document.getElementById('yearSelect').value;
        document.getElementById('summaryTitle').textContent = `Your Monthly Expenditures Summary ${year}`;

    } else {
        window.location.href = '/TruLotParking/role/userDashboard';
    }
});
