Chart.register(ChartDataLabels);
let monthlyEarningChart, dailyEarningChart;
let lotWiseEarningPercentageChart, dailyProgressChart, reservationBarChart;;
const loader = document.getElementById('loader');
const canvasInsightsArray = document.getElementsByClassName('canvas-insights');


// ----------------------------------------------------------- CANVAS INSIGHTS ---------------------------------------

function generateEarningInsights(labels, data) {
    if (!data || data.length === 0) return 'No earnings data available for this year.';

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const total = data.reduce((a, b) => a + b, 0);
    const avg = total / data.length;

    const maxMonth = labels[data.indexOf(maxVal)];
    const minMonth = labels[data.indexOf(minVal)];

    let trend = '';
    let increasing = 0, decreasing = 0;
    for (let i = 1; i < data.length; i++) {
        if (data[i] > data[i - 1]) increasing++;
        else if (data[i] < data[i - 1]) decreasing++;
    }

    if (increasing > decreasing) trend = 'an overall Increasing / Upward';
    else if (decreasing > increasing) trend = 'a Declining trend';
    else trend = 'a relatively Stable pattern';

    return (
        `📊 TruLot's Monthly Earnings Analysis:\n\n` +
        `• Total earnings this year: ₹${total.toFixed(2)}\n` +
        `• Average monthly earning: ₹${avg.toFixed(2)}\n` +
        `• Highest earning month: ${maxMonth} (₹${maxVal.toFixed(2)})\n` +
        `• Lowest earning month: ${minMonth} (₹${minVal.toFixed(2)})\n` +
        `• The data shows ${trend} across the year.\n\n` +
        `Use this insight to evaluate performance and make data-driven decisions.`
    );
}

function generateLotWiseReservationInsights(lots, active_reservations, past_reservations) {
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

function generateLotWiseEarningInsights(labels, data) {
    if (!data || data.length === 0) return 'No lot-wise earning data available for this year.';

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);

    const maxLot = labels[data.indexOf(maxVal)];
    const minLot = labels[data.indexOf(minVal)];

    const topLots = labels
        .map((label, i) => ({ label, value: data[i] }))    // Combines the labels and data arrays into an 'array of objects', each object represents a lot and its corresponding percentage, sort the array in desc order by using b-a (difference) and take top 3
        .sort((a, b) => b.value - a.value)        // If it returns a positive number, a is sorted after b and if -ve then b is sorted after a.
        .slice(0, 3);

    let topLotSummary = topLots.map((lot, idx) => `${idx + 1}. ${lot.label} (${lot.value}%)`).join('\n');

    return (
        `🏢 TruLot Lot-Wise Earnings Summary:\n\n` +
        `• Highest earning lot: ${maxLot} (${maxVal}%)\n` +
        `• Lowest earning lot: ${minLot} (${minVal}%)\n` +
        `• Top performing lots:\n${topLotSummary}\n\n`
    );
}

function generateProgressInsights(dataPoints) {
    if (!dataPoints || dataPoints.length === 0) return 'No progress data available for this year.';

    const totalBookings = dataPoints.reduce((sum, p) => sum + p.x, 0);
    const totalEarnings = dataPoints.reduce((sum, p) => sum + p.y, 0);
    const avgBookings = totalBookings / dataPoints.length;
    const avgEarnings = totalEarnings / dataPoints.length;

    let highestBookingDay = dataPoints[0];   // Initialise the value with first data point
    let highestEarningDay = dataPoints[0];

    dataPoints.forEach(p => {
        if (p.x > highestBookingDay.x) highestBookingDay = p;  // update if any other point has larger value
        if (p.y > highestEarningDay.y) highestEarningDay = p;
    });

    let trend = '';
    //  risingEarnings contains the number of days where the earning (y) increased compared to the previous day.
    // datapoint - { x: bookings, y: earnings, label: "Jul 01" }
    const rising = dataPoints.filter((_, i) => i > 0 && dataPoints[i].y > dataPoints[i - 1].y).length;     // compares the earnings (y) of the current day with the previous day.
    const falling = dataPoints.filter((_, i) => i > 0 && dataPoints[i].y < dataPoints[i - 1].y).length;

    if (rising > falling) trend = 'an upward trajectory in earnings';      // if there are more no. of days when earning on that day is higher then a +ve trend
    else if (falling > rising) trend = 'a downward trend in earnings';
    else trend = 'a relatively steady earning pattern';

    return (
        `📈 TruLot Daily Progress Insight:\n` +
        `• Total Bookings: ${totalBookings}, Total Earnings: ₹${totalEarnings.toFixed(2)}\n` +
        `• Average per day → Bookings: ${avgBookings.toFixed(1)}, Earnings: ₹${avgEarnings.toFixed(2)}\n` +
        `• 📅 Highest Booking Day: ${highestBookingDay.label} (${highestBookingDay.x} bookings)\n` +
        `• 💰 Highest Earning Day: ${highestEarningDay.label} (₹${highestEarningDay.y.toFixed(2)})\n` +
        `• The data reflects <span style="color:red">${trend}</span> throughout the year.\n\n`
    );
}

// ---------------------------------------------------- Charts using chartjs ------------------------------------------------------

async function loadMonthlyEarningChartByYear(forcedYear = null) {    
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;    // set current year in dropdown on page load
    document.getElementById('summaryTitle').textContent = `TruLot Financial Overview by Month, year ${year}`;

    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/adminDashboard/monthly-earning/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }

        canvasInsightsArray[0].innerHTML = generateEarningInsights(result.labels, result.data).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (monthlyEarningChart) monthlyEarningChart.destroy();
        monthlyEarningChart = new Chart(document.getElementById('monthlyEarningChart'), {
            type: 'line',
            data: {
                labels: result.labels,
                datasets: [{
                    // label: `Your Monthly Spending on TruLot in ${year}`,
                    data: result.data,
                    borderColor: '#a9c7f7ff',
                    borderColor: '#3b82f6',
                    borderColor: '#60a5fa',
                    backgroundColor: '#d3e0f180',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: false,
                onClick: (e, element) => {       // onclick event each element(month spend point)
                    if (element.length > 0) {
                        console.log(element);   //
                        const monthIndex = element[0].index + 1;
                        loadDailyEarningChart(monthIndex, year);
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
                        formatter: value => `${value.toFixed(3)}%` // 
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount Earned in Ruppees(₹)',
                            color: '#60a5fa',
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
                            text: 'Month-Wise Earning on TruLot',
                            color: '#60a5fa',
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

async function loadDailyEarningChart(month, year) {
    try{
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/adminDashboard/earning/daily/${month}/${year}`);
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
        document.getElementById('summaryTitle').textContent = `TruLot Daily Financial Overview by ${monthName} ${year}`;

        if (dailyEarningChart) dailyEarningChart.destroy();

        dailyEarningChart = new Chart(document.getElementById('dailyEarningChart'), {
            type: 'line',
            data: {
                labels: result.labels,
                datasets: [{
                    // label: `Daily Spending on TruLot in ${monthName} ${year}`,
                    data: result.data,
                    borderColor: '#60a5fa',
                    backgroundColor: '#d3e0f180',
                    tension: 0.4,
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
                            text: 'Amount Earned in Rupees(₹)',
                            color: '#60a5fa',
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
                            color: '#60a5fa',
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

async function loadLotWiseEarningPercentageByYear(forcedYear = null) {    
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;    // set current year in dropdown on page load
    document.getElementById('lot-wise-earning-pie-chart-h1').textContent = `TruLot ParkingLots Wise Earning Summary ${year}`;
    
    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/adminDashboard/lot-wise-earning-percentage/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert('Failed to load summary:', result.message);
            return;
        }

        canvasInsightsArray[2].innerHTML = generateLotWiseEarningInsights(result.labels, result.data).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

        if (lotWiseEarningPercentageChart) lotWiseEarningPercentageChart.destroy();
        lotWiseEarningPercentageChart = new Chart(document.getElementById('lot-wise-earning-pie-chart'), {
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

async function loadGrowthDualAxisLineChart(forcedYear = null) {
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;  
    document.getElementById('daily-progress-h1').textContent = `TruLot Overall Progress Chart & Summary ${year}`;

    try{
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/adminDashboard/relation_earning_and_booking/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            loader.style.display = 'none';
            await customAlert("Failed to load data");
            return;
        }
        
        canvasInsightsArray[3].innerHTML = generateProgressInsights(result.points).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)
        if (dailyProgressChart) dailyProgressChart.destroy();
        dailyProgressChart = new Chart(document.getElementById('daily-progress-chart'), {
            type: 'line',
            data: {
                labels: result.points.map(p => p.label),  // ["Jul 01", "Jul 02", ...]
                datasets: [
                    {
                        data: result.points.map(p => p.x),
                        yAxisID: 'yBookings',
                        borderColor: '#34d399',
                        backgroundColor: '#34d39933',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        data: result.points.map(p => p.y),
                        yAxisID: 'yEarnings',
                        borderColor: '#60a5fa',
                        backgroundColor: '#60a5fa33',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: false,
                plugins: {
                    legend:{
                        display: false
                    },
                    datalabels: {
                        display: false,
                    }
                },
                scales: {
                    x: {
                        title: { 
                            display: true,
                            text: 'Daily progress',
                            color: '#60a5fa',
                            font: {
                                size: 18,
                                weight: 'bold',
                                lineHeight: 1.4,
                            },
                            padding: {
                                top: 10,  
                                bottom: 10,
                            }
                        }
                    },

                    yBookings: {
                        type: 'linear',
                        position: 'left',
                        title: { 
                            display: true,
                            text: 'No. of Bookings per day',
                            color: '#60a5fa',
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
                        beginAtZero: true
                    },

                    yEarnings: {
                        type: 'linear',
                        position: 'right',
                        title: { 
                            display: true,
                            text: 'Earnings in Rupees per day (₹)',
                            color: '#60a5fa',
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
                        beginAtZero: true,
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

async function loadLotWiseReservationChartByYear(forcedYear = null) {
    const year = forcedYear || document.getElementById('yearSelect').value;
    document.getElementById('yearSelect').value = year;  
    document.getElementById('active-past-reservation-h1').textContent = `Active and Completed Reservation status for year ${year}`;
    try {
        loader.style.display = 'flex';
        const response = await fetch(`/TruLotParking/role/adminDashboard/active-past-reservation-lotWise/${year}`);
        const result = await response.json();
        
        if (!result.success) {
            await customAlert('Failed to load reservation data');
            return;
        }
        
        const { lots, active_reservations, past_reservations } = result;    // destructure the result object using keys
        canvasInsightsArray[1].innerHTML = generateLotWiseReservationInsights(lots, active_reservations, past_reservations).replace(/\n/g, '<br>');   // replace \n (next line with <br> tag)

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
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Active vs Past Reservations (Lot-wise) - ${year}`,
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },

                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Parking Lot (TruLot)',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            font: { weight: 'bold' }
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
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            precision: 0,
                            font: { weight: 'bold' }
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
    loadMonthlyEarningChartByYear(currentYear);
    loadLotWiseReservationChartByYear(currentYear);
    loadLotWiseEarningPercentageByYear(currentYear);
    loadGrowthDualAxisLineChart(currentYear);
};

function handleYearChange() {
    const year = document.getElementById('yearSelect').value;
    loadMonthlyEarningChartByYear(year);
    loadLotWiseReservationChartByYear(year);
    loadLotWiseEarningPercentageByYear(year);
    loadGrowthDualAxisLineChart(year);
}


document.getElementById('back-i').addEventListener('click', async() => {
    window.location.href = '/TruLotParking/role/adminDashboard';
});


// concept 
// javascript sort func sorts an array of number lexographically by default
// Example : [10,5,1] => [1, 10, 5] ---> why ?

// lexicographic sorting treats the value as string and then compares the string:
// "1" (starts with 1) ✅
// "10" (starts with 1, then 0) ➡️ comes after "1"
// "5" (starts with 5)

// So, we use comparison paramters -
//  b-a => sort the value in descending order
// a-b => sort the values in asc order