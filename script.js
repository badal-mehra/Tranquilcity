
    // Initialize variables
    let noiseChart, trafficChart, healthChart;
    let map, heatmapLayer;
    let selectedCity = 'delhi';
    let currentView = 'overview';
    let tickerMessages = [
        '<i class="fas fa-exclamation-circle"></i> High noise levels detected in Connaught Place, Delhi',
        '<i class="fas fa-exclamation-circle"></i> Traffic congestion causing elevated noise in Bandra, Mumbai',
        '<i class="fas fa-check-circle"></i> Noise levels normal in Whitefield, Bangalore',
        '<i class="fas fa-exclamation-circle"></i> Health risk advisory for Howrah, Kolkata due to prolonged noise exposure',
        '<i class="fas fa-exclamation-circle"></i> Construction noise exceeding limits in Adyar, Chennai'
    ];
    
    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeCharts();
        initializeMap();
        updateTicker();
        updateTimestamp();
        startDataSimulation();
        animateMetrics();
        setupEventListeners();
    });
    
    // Initialize Charts
    function initializeCharts() {
        const chartOptions = (yMin, yMax, yLabelCallback) => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: { label: yLabelCallback }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: yMin,
                    max: yMax,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)'}
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)'}
                }
            }
        });

        // Noise Chart
        noiseChart = new Chart(document.getElementById('noiseChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Noise Level (dB)',
                    data: [65, 74, 80, 75, 82, 68, 72],
                    borderColor: '#4cd137',
                    backgroundColor: 'rgba(76, 209, 55, 0.1)',
                    borderWidth: 2, tension: 0.4, fill: true
                }]
            },
            options: chartOptions(50, 100, ctx => `Noise: ${ctx.parsed.y.toFixed(1)} dB`)
        });
        
        // Traffic Chart
        trafficChart = new Chart(document.getElementById('trafficChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Traffic Density',
                    data: [75, 85, 95, 90, 100, 65, 70],
                    backgroundColor: 'rgba(253, 187, 45, 0.8)',
                    borderColor: 'rgba(253, 187, 45, 1)',
                    borderWidth: 1
                }]
            },
            options: chartOptions(0, 110, ctx => `Traffic: ${ctx.parsed.y}% of capacity`)
        });
        
        // Health Chart
        healthChart = new Chart(document.getElementById('healthChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Health Risk Index',
                    data: [3, 4, 6, 5, 7, 3, 4],
                    borderColor: '#ff4757',
                    backgroundColor: 'rgba(255, 71, 87, 0.1)',
                    borderWidth: 2, tension: 0.4, fill: true
                }]
            },
            options: chartOptions(0, 10, ctx => `Health Risk: ${ctx.parsed.y.toFixed(1)}/10`)
        });
    }
    
    // Initialize Map
    function initializeMap() {
        map = L.map('map').setView([28.6139, 77.2090], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        heatmapLayer = L.heatLayer([], {radius: 25, blur: 15, maxZoom: 17}).addTo(map);
        addMapMarkers();
    }
    
    // Add markers to the map
    function addMapMarkers() {
        map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
        const cityCoords = {
            'delhi': [28.6139, 77.2090], 'mumbai': [19.0760, 72.8777],
            'bangalore': [12.9716, 77.5946], 'kolkata': [22.5726, 88.3639], 'chennai': [13.0827, 80.2707]
        };
        map.setView(cityCoords[selectedCity], 12);

        const markers = {
            'delhi': [{lat: 28.632, lng: 77.219, title: 'Connaught Place', noise: 88}, {lat: 28.65, lng: 77.23, title: 'Chandni Chowk', noise: 92}, {lat: 28.52, lng: 77.25, title: 'Nehru Place', noise: 85}],
            'mumbai': [{lat: 19.06, lng: 72.83, title: 'Bandra', noise: 89}, {lat: 18.92, lng: 72.83, title: 'Marine Drive', noise: 82}, {lat: 19.11, lng: 72.88, title: 'Andheri Station', noise: 94}],
            'bangalore': [{lat: 12.97, lng: 77.6, title: 'MG Road', noise: 85}, {lat: 12.93, lng: 77.61, title: 'Koramangala', noise: 81}, {lat: 12.99, lng: 77.55, title: 'Majestic', noise: 91}],
            'kolkata': [{lat: 22.56, lng: 88.35, title: 'Esplanade', noise: 87}, {lat: 22.54, lng: 88.34, title: 'Park Street', noise: 84}, {lat: 22.58, lng: 88.34, title: 'Howrah Bridge', noise: 93}],
            'chennai': [{lat: 13.06, lng: 80.28, title: 'T. Nagar', noise: 88}, {lat: 13.05, lng: 80.24, title: 'Anna Nagar', noise: 83}, {lat: 13.08, lng: 80.27, title: 'Central Station', noise: 90}]
        };
        
        const cityMarkers = markers[selectedCity] || [];
        cityMarkers.forEach(marker => {
            const iconColor = marker.noise < 65 ? 'blue' : marker.noise < 75 ? 'lime' : marker.noise < 85 ? 'yellow' : 'red';
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24], iconAnchor: [12, 12]
            });
            L.marker([marker.lat, marker.lng], {icon: markerIcon}).addTo(map)
                .bindPopup(`<div style="color: #333; text-align: center;"><h3>${marker.title}</h3><p>Noise: <strong>${marker.noise} dB</strong></p></div>`);
        });
        const heatData = cityMarkers.map(m => [m.lat, m.lng, m.noise / 100]);
        heatmapLayer.setLatLngs(heatData);
    }
    
    function updateTicker() {
        const ticker = document.getElementById('ticker-content');
        ticker.innerHTML = tickerMessages.map(msg => `<div class="alert-item">${msg}</div>`).join('');
    }
    
    function updateTimestamp() {
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
    }
    
    function startDataSimulation() {
        setInterval(() => {
            updateTimestamp();
            showNotification('Live data stream is active');
        }, 30000);
    }
    
    function showNotification(message) {
        const toast = document.getElementById('notification-toast');
        document.getElementById('toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    
    function animateMetrics() {
        document.querySelectorAll('.metric-value').forEach(metric => {
            const target = parseFloat(metric.getAttribute('data-target'));
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                metric.textContent = target < 10 ? current.toFixed(1) : Math.round(current).toLocaleString();
            }, 20);
        });
    }
    
    function setupEventListeners() {
        document.getElementById('city-select').addEventListener('change', function() {
            selectedCity = this.value;
            addMapMarkers();
            showNotification(`Viewing data for ${this.options[this.selectedIndex].text}`);
        });
        
        document.querySelectorAll('.view-controls .view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelector('.view-controls .view-btn.active').classList.remove('active');
                this.classList.add('active');
                updateView(this.getAttribute('data-view'));
            });
        });
        
        document.querySelectorAll('.chart-controls .view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // --- FIX START ---
                // This is the corrected, more robust logic for toggling the active button state.
                const buttonsInGroup = this.parentElement.querySelectorAll('.view-btn');
                buttonsInGroup.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                // --- FIX END ---
                updateChartPeriod(this.getAttribute('data-chart'), this.getAttribute('data-period'));
            });
        });
        
        document.getElementById('mobile-menu-btn').addEventListener('click', () => {
            document.getElementById('nav-menu').classList.toggle('show');
        });

        // Modal listeners
        const modal = document.getElementById('demo-modal');
        document.getElementById('request-demo-btn').addEventListener('click', () => modal.style.display = 'flex');
        document.getElementById('modal-close-btn').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });
        document.getElementById('demo-form').addEventListener('submit', e => {
            e.preventDefault();
            modal.style.display = 'none';
            showNotification('Thank you! Your demo request has been received.');
            e.target.reset();
        });
    }
    
    // Update view based on selected view type
    function updateView(viewType) {
        const dashboard = document.getElementById('dashboard');
        dashboard.classList.toggle('details-view', viewType === 'details');
        showNotification(`${viewType.charAt(0).toUpperCase() + viewType.slice(1)} view selected`);
    }

    // Update chart period with realistic data
    function updateChartPeriod(chartType, period) {
        const data = {
            noise: {
                day: [55, 54, 56, 58, 62, 70, 78, 85, 88, 86, 82, 79, 78, 80, 81, 84, 89, 92, 90, 85, 78, 70, 65, 60],
                week: [85, 88, 86, 90, 92, 75, 70],
                month: [80,82,85,83,81,79,75,78,80,84,86,88,85,82,80,78,81,83,87,90,91,88,85,82,79,76,74,78,82,85]
            },
            traffic: {
                day: [5, 4, 3, 5, 15, 40, 75, 90, 98, 92, 80, 70, 65, 68, 75, 85, 95, 100, 90, 60, 40, 25, 15, 10],
                week: [88, 92, 90, 95, 100, 70, 55],
                month: [85,88,90,87,85,80,70,75,82,88,91,94,90,86,82,80,84,87,92,96,98,93,88,84,80,75,70,78,85,90]
            },
            health: {
                day: [1, 1, 1, 2, 3, 5, 6, 7.5, 8, 7, 6, 5, 5, 5.5, 6, 7, 8, 8.5, 8, 6, 5, 4, 3, 2],
                week: [7, 7.5, 7.2, 8, 8.5, 5, 4],
                month: [6,6.5,7,6.8,6.5,6,5,5.5,6,7,7.5,8,7.5,7,6.5,6,6.8,7.2,8,8.5,8.8,8,7.5,7,6,5,4.5,5.5,6.5,7.5]
            },
        };

        const labels = {
            day: Array.from({length: 24}, (_, i) => `${i}:00`),
            week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            month: Array.from({length: 30}, (_, i) => `Day ${i + 1}`)
        };

        let chart;
        if (chartType === 'noise') chart = noiseChart;
        else if (chartType === 'traffic') chart = trafficChart;
        else if (chartType === 'health') chart = healthChart;
        
        if (chart) {
            chart.data.labels = labels[period];
            chart.data.datasets[0].data = data[chartType][period];
            chart.update();
        }
        
        showNotification(`Showing ${period} data for ${chartType}`);
    }
    
    function scrollToTop() {
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
