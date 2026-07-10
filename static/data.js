// static/data.js

// Sample Data for all pages

const districtsData = [
    { name: "Kailali", population: 890000, allocation: 245, per_citizen: 2750, hdi: 0.52, status: "Developing" },
    { name: "Kanchanpur", population: 650000, allocation: 198, per_citizen: 3046, hdi: 0.55, status: "Developing" },
    { name: "Doti", population: 210000, allocation: 85, per_citizen: 4048, hdi: 0.48, status: "Backward" },
    { name: "Bajhang", population: 195000, allocation: 72, per_citizen: 3692, hdi: 0.45, status: "Backward" },
    { name: "Bajura", population: 135000, allocation: 68, per_citizen: 5037, hdi: 0.42, status: "Backward" },
    // Add more as needed
];

const ministriesData = [
    { name: "Infrastructure", nepali: "भौतिक पूर्वाधार", budget81: 412, budget80: 365, share: 24.8 },
    { name: "Education", nepali: "शिक्षा", budget81: 318, budget80: 290, share: 19.1 },
    { name: "Health", nepali: "स्वास्थ्य", budget81: 244, budget80: 210, share: 14.7 },
    // Add more
];

const projectsData = [
    { project: "Godawari–Dhangadhi Highway", district: "Kailali", budget: 450, spent: 320, progress: 71, status: "On Track" },
    { project: "District Hospital Upgradation", district: "Kanchanpur", budget: 180, spent: 95, progress: 53, status: "Delayed" },
    // Add more
];

const outcomesData = [
    { indicator: "Literacy Rate", province: 62.4, national: 76.3, target: 70 },
    { indicator: "Poverty Rate", province: 26.8, national: 18.7, target: 22 },
    { indicator: "Road Connectivity", province: 58.3, national: 72.6, target: 65 },
];

// Function to populate tables
function populateDistrictTable() {
    const tbody = document.getElementById("district-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = districtsData.map(d => `
        <tr>
            <td>${d.name}</td>
            <td>${d.population.toLocaleString()}</td>
            <td>Rs ${d.allocation} Cr</td>
            <td>Rs ${d.per_citizen}</td>
            <td>${d.hdi}</td>
            <td><span class="status ${d.status.toLowerCase()}">${d.status}</span></td>
        </tr>
    `).join('');
}

function populateProjectsTable() {
    const tbody = document.getElementById("projects-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = projectsData.map(p => `
        <tr>
            <td>${p.project}</td>
            <td>${p.district}</td>
            <td>Rs ${p.budget} Cr</td>
            <td>Rs ${p.spent} Cr</td>
            <td>${p.progress}%</td>
            <td><span class="status ${p.status.toLowerCase().replace(' ', '-')}">${p.status}</span></td>
        </tr>
    `).join('');
}

// Initialize all dynamic content
document.addEventListener("DOMContentLoaded", () => {
    populateDistrictTable();
    populateProjectsTable();
    
    // You can add more population functions here
    console.log("✅ Data loaded successfully");
});