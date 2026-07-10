// static/app.js

// Simple utility functions and interactivity

document.addEventListener("DOMContentLoaded", function() {

    // Navbar mobile menu (if needed later)
    console.log("%cSudurpaschim Budget Visualizer Loaded", "color: #1a3c5e; font-weight: bold");

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            if (this.getAttribute("href") !== "#") {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute("href"));
                if (target) target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Hover effect on metric cards
    const metrics = document.querySelectorAll('.metric');
    metrics.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 20px rgba(26, 60, 94, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        });
    });

    // Make table rows clickable (optional enhancement)
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            row.style.backgroundColor = '#f0f9ff';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 300);
        });
    });

});

// Status badge styling helper (can be extended)
function getStatusClass(status) {
    const map = {
        'on track': 'success',
        'delayed': 'warning',
        'completed': 'primary',
        'backward': 'danger'
    };
    return map[status.toLowerCase()] || 'secondary';
}