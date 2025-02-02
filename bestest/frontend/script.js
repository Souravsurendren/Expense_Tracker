// Add your JavaScript logic here
document.getElementById('toggle-mode').addEventListener('click', function () {
  document.body.classList.toggle('light-mode');
});

// Chart instances
let incomeExpensesChart = null;
let expenseBreakdownChart = null;

// Function to fetch all data from the server
async function fetchData() {
  try {
    const response = await fetch('http://localhost:5000/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return { incomes: [], expenses: [], savings: [] };
  }
}

// Function to update the summary
async function updateSummary() {
  const data = await fetchData();
  const totalIncome = data.incomes.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalExpenses = data.expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const totalSavings = data.savings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  document.getElementById('total-income').innerText = totalIncome.toFixed(2);
  document.getElementById('total-expenses').innerText = totalExpenses.toFixed(2);
  document.getElementById('total-savings').innerText = totalSavings.toFixed(2);

  renderCharts(totalIncome, totalExpenses, data.expenses);
}

// Function to update the logbook
async function updateLogbook() {
  const data = await fetchData();
  let logbookElement = document.getElementById('logbook');
  logbookElement.innerHTML = '';

  // Combine all data
  const allData = [
    ...data.incomes.map(item => ({ ...item, type: 'income' })),
    ...data.expenses.map(item => ({ ...item, type: 'expense' })),
    ...data.savings.map(item => ({ ...item, type: 'savings' }))
  ];

  // Group by month
  const groupedData = allData.reduce((acc, curr) => {
    const month = curr.date;
    if (!acc[month]) acc[month] = [];
    acc[month].push(curr);
    return acc;
  }, {});

  // Display grouped data
  for (const [month, entries] of Object.entries(groupedData)) {
    logbookElement.innerHTML += `<div class="logbook-month"><h3>${month}</h3>`;
    entries.forEach(item => {
      if (item.type === 'income') {
        logbookElement.innerHTML += `<p>Income: ₹${item.amount} from ${item.source}</p>`;
      } else if (item.type === 'expense') {
        logbookElement.innerHTML += `<p>Expense: ₹${item.amount} for ${item.type}</p>`;
      } else if (item.type === 'savings') {
        logbookElement.innerHTML += `<p>Savings: ₹${item.amount}</p>`;
      }
    });
    logbookElement.innerHTML += `</div>`;
  }
}

// Function to validate amount
function validateAmount(amount) {
  return !isNaN(amount) && parseFloat(amount) >= 0;
}

// Function to add income
document.getElementById('income-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const incomeAmount = document.getElementById('income-amount').value;
  const incomeSource = document.getElementById('income-source').value;
  const incomeDate = document.getElementById('income-date').value;

  if (!validateAmount(incomeAmount)) {
    alert("Please enter a valid income amount.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: incomeAmount, source: incomeSource, date: incomeDate }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      updateSummary();
      updateLogbook();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error adding income:', error);
  }
});

// Function to add expense
document.getElementById('expenses-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const expenseAmount = document.getElementById('expense-amount').value;
  const expenseType = document.getElementById('expense-type').value;
  const expenseDate = document.getElementById('expense-date').value;

  if (!validateAmount(expenseAmount)) {
    alert("Please enter a valid expense amount.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/expense', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: expenseAmount, type: expenseType, date: expenseDate }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      updateSummary();
      updateLogbook();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error adding expense:', error);
  }
});

// Function to add savings
document.getElementById('savings-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const savingsAmount = document.getElementById('savings-amount').value;
  const savingsDate = document.getElementById('savings-date').value;

  if (!validateAmount(savingsAmount)) {
    alert("Please enter a valid savings amount.");
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: savingsAmount, date: savingsDate }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      updateSummary();
      updateLogbook();
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('Error adding savings:', error);
  }
});

// Function to render charts
function renderCharts(totalIncome, totalExpenses, expenseData) {
  const ctx1 = document.getElementById('income-expenses-chart').getContext('2d');
  const ctx2 = document.getElementById('expense-breakdown-chart').getContext('2d');

  // Destroy existing charts
  if (incomeExpensesChart) incomeExpensesChart.destroy();
  if (expenseBreakdownChart) expenseBreakdownChart.destroy();

  // Income vs Expenses Chart
  incomeExpensesChart = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        label: 'Amount ₹',
        data: [totalIncome, totalExpenses],
        backgroundColor: ['#4caf50', '#ff5252'],
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });

  // Expense Breakdown Chart
  const expenseTypes = expenseData.map(e => e.type);
  const expenseAmounts = expenseData.map(e => parseFloat(e.amount));

  expenseBreakdownChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: expenseTypes,
      datasets: [{
        label: 'Expense Distribution',
        data: expenseAmounts,
        backgroundColor: ['#ff5252', '#ff9800', '#3f51b5', '#9c27b0', '#00bcd4', '#8bc34a', '#cddc39', '#ffeb3b'],
      }]
    }
  });
}

// Function to convert data to CSV format
function convertToCSV(data, headers) {
  const rows = data.map(item => headers.map(header => item[header.toLowerCase()]).join(','));
  return [headers.join(','), ...rows].join('\n');
}

// Function to export data as CSV
async function exportDataToCSV() {
  try {
    // Fetch all data from the server
    const data = await fetchData();

    // Combine all data into a single array
    const allData = [
      ...data.incomes.map(item => ({ type: 'Income', amount: item.amount, source: item.source, date: item.date })),
      ...data.expenses.map(item => ({ type: 'Expense', amount: item.amount, source: item.type, date: item.date })),
      ...data.savings.map(item => ({ type: 'Savings', amount: item.amount, source: 'Savings', date: item.date }))
    ];

    // Define CSV headers
    const headers = ['Type', 'Amount', 'Source', 'Date'];

    // Convert data to CSV
    const csvData = convertToCSV(allData, headers);

    // Create a Blob and trigger download
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_tracker_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Error exporting data. Please try again.');
  }
}

// Attach export functionality to the "Export Data" button
document.getElementById('export-data').addEventListener('click', exportDataToCSV);

// Initialize
updateSummary();
updateLogbook();
