// --- Chart.js Initialization --- //

(function(window) {
    'use strict';

    // Dependencies
    const store = window.sctStore;
    const points = window.sctPoints;
    const $ = (selector) => document.querySelector(selector);

    // --- Public API --- //
    const charts = {
        initDashboardCharts: function() {
            const currentUser = store.getCurrentUser();
            if (!currentUser) return;

            this.renderWeeklyPointsChart(currentUser);
            this.renderComparisonChart();
        },

        /**
         * Renders the line chart for the current user's weekly points trend.
         * @param {object} currentUser The currently logged-in user.
         */
        renderWeeklyPointsChart: function(currentUser) {
            const ctx = $('#weekly-points-chart')?.getContext('2d');
            if (!ctx) return;

            const labels = [];
            const data = [];
            const [currentYear, currentWeek] = points.getCurrentWeekInfo();

            // Get data for the last 6 weeks
            for (let i = 5; i >= 0; i--) {
                let week = currentWeek - i;
                let year = currentYear;
                if (week <= 0) {
                    // This logic is simplified; a robust solution would handle year boundaries better
                    week += 52;
                    year -= 1;
                }
                labels.push(`W${week}`);
                const stats = points.calculateWeeklyStats(currentUser.id, [year, week]);
                data.push(stats.totalPoints);
            }

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Your Weekly Points',
                        data: data,
                        borderColor: '#4338CA', // Indigo 700
                        backgroundColor: 'rgba(67, 56, 202, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },

        /**
         * Renders the bar chart comparing Yasuru and Anuja's points for the current week.
         */
        renderComparisonChart: function() {
            const ctx = $('#yasuru-vs-anuja-chart')?.getContext('2d');
            if (!ctx) return;

            const users = store.getUsers();
            const currentWeekInfo = points.getCurrentWeekInfo();

            const userPoints = users.map(user => {
                return points.calculateWeeklyStats(user.id, currentWeekInfo).totalPoints;
            });

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: users.map(u => u.name),
                    datasets: [{
                        label: 'Current Week Points',
                        data: userPoints,
                        backgroundColor: [
                            'rgba(67, 56, 202, 0.7)',  // Indigo for Yasuru
                            'rgba(16, 185, 129, 0.7)'  // Emerald for Anuja
                        ],
                        borderColor: [
                            '#4338CA',
                            '#10B981'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    };

    window.sctCharts = charts;

    // --- New Chart for Leaderboard --- //
    charts.initLeaderboardChart = function() {
        const ctx = $('#leaderboard-trend-chart')?.getContext('2d');
        if (!ctx) return;

        const users = store.getUsers();
        const [currentYear, currentWeek] = points.getCurrentWeekInfo();
        const labels = [];
        const datasets = users.map((user, index) => ({
            label: user.name,
            data: [],
            borderColor: index === 0 ? '#4338CA' : '#10B981', // Indigo for user 1, Emerald for user 2
            backgroundColor: index === 0 ? 'rgba(67, 56, 202, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3
        }));

        for (let i = 5; i >= 0; i--) {
            let week = currentWeek - i;
            let year = currentYear;
            if (week <= 0) {
                week += 52;
                year -= 1;
            }
            labels.push(`W${week}`);
            users.forEach((user, index) => {
                const stats = points.calculateWeeklyStats(user.id, [year, week]);
                datasets[index].data.push(stats.totalPoints);
            });
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

})(window);
