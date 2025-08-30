// --- UI Rendering and DOM Manipulation --- //

(function(window) {
    'use strict';

    // Dependencies
    const store = window.sctStore;
    const points = window.sctPoints;

    // --- Private Helper Functions --- //

    /**
     * A simple utility to select a DOM element.
     * @param {string} selector The CSS selector.
     * @returns {Element | null}
     */
    const $ = (selector) => document.querySelector(selector);

    /**
     * Animates a number counting up from 0.
     * @param {Element} el The element containing the number.
     * @param {number} to The final number.
     * @param {number} duration The animation duration in ms.
     */
    function countUp(el, to, duration = 1500) {
        if (!el) return;
        let start = 0;
        const end = parseFloat(to);
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));

        const timer = setInterval(() => {
            start += increment;
            if (el.dataset.format === 'float') {
                 el.textContent = start.toFixed(1);
            } else {
                 el.textContent = Math.floor(start);
            }
            if (start === end) {
                clearInterval(timer);
                el.textContent = to; // Ensure final value is exact
            }
        }, stepTime);
    }

    // --- Public API --- //
    const ui = {
        /**
         * Initializes common UI elements present on all authenticated pages.
         */
        initSharedUI: function() {
            const user = store.getCurrentUser();
            if (!user) {
                // Not logged in, redirect to login page
                if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
                    window.location.href = 'login.html';
                }
                return;
            }

            // If on login page but already logged in, redirect to dashboard
            if (window.location.pathname.endsWith('login.html')) {
                window.location.href = 'dashboard.html';
            }

            const userGreetingEl = $('#user-greeting');
            const userAvatarEl = $('#user-avatar-initial');
            const weekDatesEl = $('#week-dates');

            if (userGreetingEl) userGreetingEl.textContent = user.name;
            if (userAvatarEl) {
                userAvatarEl.textContent = user.avatar;
                // Here you could add logic to change avatar color based on user prefs
            }
            if (weekDatesEl) {
                const [year, week] = points.getCurrentWeekInfo();
                weekDatesEl.textContent = `Year ${year}, Week ${week}`;
            }
        },

        /**
         * Renders the dashboard content.
         */
        renderDashboard: function() {
            const user = store.getCurrentUser();
            if (!user) return;

            const weeklyStats = points.calculateWeeklyStats(user.id, points.getCurrentWeekInfo());
            const lifetimeStats = points.calculateLifetimeStats(user.id);

            // KPI Cards
            const kpiContainer = $('#kpi-cards');
            if (kpiContainer) {
                kpiContainer.innerHTML = `
                    <div class="col-md-4">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title text-muted">Weekly Points</h5>
                                <p class="h2" data-kpi-value="${weeklyStats.totalPoints}">0</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title text-muted">Weekly Study Hours</h5>
                                <p class="h2" data-kpi-value="${weeklyStats.studyHours}" data-format="float">0.0</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow-sm">
                             <div class="card-body">
                                <h5 class="card-title text-muted">Courses Completed (Week)</h5>
                                <p class="h2" data-kpi-value="${weeklyStats.coursesCompleted}">0</p>
                            </div>
                        </div>
                    </div>
                `;
                // Animate counters
                document.querySelectorAll('[data-kpi-value]').forEach(el => {
                    countUp(el, el.dataset.kpiValue);
                });
            }

            // Render Gamified Widgets
            const studyStreakEl = $('#study-streak-value');
            if (studyStreakEl) {
                // For now, using a static value. A real implementation would call a function
                // from points.js to calculate the actual streak.
                studyStreakEl.textContent = '3';
            }

            const weeklyGoalProgressEl = $('#weekly-goal-progress');
            if (weeklyGoalProgressEl) {
                const goal = user.weeklyGoal || 10; // Default goal of 10 hours
                const progress = (weeklyStats.studyHours / goal) * 100;
                weeklyGoalProgressEl.innerHTML = `
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                            ${Math.round(progress)}%
                        </div>
                    </div>
                    <div class="text-center mt-1">
                        <small>${weeklyStats.studyHours.toFixed(1)} / ${goal} hours</small>
                    </div>
                `;
            }
        },

        /**
         * Renders the leaderboard content, including the head-to-head panel and table.
         */
        renderLeaderboard: function() {
            const users = store.getUsers();
            const currentWeek = points.getCurrentWeekInfo();

            const leaderboardData = users.map(user => {
                const weeklyStats = points.calculateWeeklyStats(user.id, currentWeek);
                const lifetimeStats = points.calculateLifetimeStats(user.id);
                return {
                    user,
                    weeklyPoints: weeklyStats.totalPoints,
                    lifetimePoints: lifetimeStats.totalPoints
                };
            }).sort((a, b) => b.weeklyPoints - a.weeklyPoints);

            const leader = leaderboardData[0];
            const headToHeadPanel = $('#head-to-head-panel');
            if (headToHeadPanel) {
                headToHeadPanel.innerHTML = leaderboardData.map((data, index) => {
                    const isLeader = data.user.id === leader.user.id;
                    return `
                        <div class="col-6">
                            <div class="card ${isLeader ? 'border-primary leader-pulse' : ''}">
                                <div class="card-body">
                                    <h3 class="card-title">${data.user.name} ${isLeader ? '🏆' : ''}</h3>
                                    <p class="h4">${data.weeklyPoints} <span class="text-muted fs-6">pts this week</span></p>
                                    <p class="text-muted">${data.lifetimePoints} lifetime pts</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            const leaderboardBody = $('#leaderboard-body');
            if (leaderboardBody) {
                leaderboardBody.innerHTML = leaderboardData.map((data, index) => {
                    const isLeader = index === 0;
                    return `
                        <tr class="${isLeader ? 'table-primary' : ''}">
                            <td>${index + 1}</td>
                            <td>${data.user.name}</td>
                            <td>${data.weeklyPoints}</td>
                            <td>${data.lifetimePoints}</td>
                        </tr>
                    `;
                }).join('');
            }
        },

        /**
         * Renders the history page content.
         */
        renderHistoryPage: function() {
            // Enable tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            const logs = store.getLogs();
            const allLogs = [
                ...logs.study.map(l => ({...l, type: 'Study'})),
                ...logs.courses.map(l => ({...l, type: 'Course'}))
            ].sort((a,b) => new Date(b.date) - new Date(a.date));

            const timelineEl = $('#history-timeline');
            if (timelineEl) {
                if (allLogs.length === 0) {
                    timelineEl.innerHTML = '<li class="list-group-item">No activity yet.</li>';
                    return;
                }
                timelineEl.innerHTML = allLogs.map(log => {
                    const user = store.getUserById(log.userId);
                    const icon = log.type === 'Study' ? 'bi-clock' : 'bi-patch-check-fill';
                    const title = log.type === 'Study' ? `Logged ${log.hours}h for ${log.subject}` : `Completed ${log.title}`;
                    return `
                        <li class="list-group-item">
                            <i class="bi ${icon} me-2"></i>
                            <strong>${user.name}</strong> ${title} on ${log.date}
                        </li>
                    `;
                }).join('');
            }

            // Render stats cards (simplified)
            const statsCardsEl = $('#history-stats-cards');
            if (statsCardsEl) {
                const totalHours = logs.study.reduce((sum, log) => sum + log.hours, 0);
                const totalCourses = logs.courses.length;
                statsCardsEl.innerHTML = `
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h5 class="card-title">Total Study Hours (All Time)</h5>
                                <p class="h3">${totalHours.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h5 class="card-title">Total Courses Completed</h5>
                                <p class="h3">${totalCourses}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        },

        /**
         * Renders the recent logs table on the Log Progress page.
         */
        renderRecentLogs: function() {
            const logs = store.getLogs();
            const allLogs = [
                ...logs.study.map(l => ({...l, type: 'Study'})),
                ...logs.courses.map(l => ({...l, type: 'Course'}))
            ].sort((a,b) => new Date(b.date) - new Date(a.date));

            const recentLogsTable = $('#recent-logs-body');
            if(recentLogsTable) {
                recentLogsTable.innerHTML = allLogs.slice(0, 10).map(log => `
                    <tr>
                        <td>${log.date}</td>
                        <td><span class="badge bg-${log.type === 'Study' ? 'info' : 'success'}">${log.type}</span></td>
                        <td>${log.type === 'Study' ? `${log.subject} (${log.hours}h)` : log.title}</td>
                        <td>${store.getUserById(log.userId).name}</td>
                    </tr>
                `).join('');
            }
        },

        /**
         * Renders the settings page, populating forms with current data.
         */
        renderSettingsPage: function() {
            const rules = store.getPointRules();
            const user = store.getCurrentUser();

            if (!rules || !user) return;

            // Populate Point Rules
            $('#hour-point').value = rules.hourPoint;
            $('#course-point').value = rules.coursePoint;

            // Populate Profile Settings
            $('#theme').value = user.theme;
            $('#weekly-goal').value = user.weeklyGoal;
        },

        /**
         * Shows a toast message.
         * @param {string} message The message to display.
         * @param {string} type 'success' or 'error'.
         */
        showToast: function(message, type = 'success') {
            const toastContainer = $('#toast-container') || document.createElement('div');
            if (!toastContainer.id) {
                toastContainer.id = 'toast-container';
                toastContainer.style.position = 'fixed';
                toastContainer.style.bottom = '1rem';
                toastContainer.style.right = '1rem';
                toastContainer.style.zIndex = '1050';
                document.body.appendChild(toastContainer);
            }

            const toastEl = document.createElement('div');
            toastEl.className = `toast show align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
            toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;

            toastContainer.appendChild(toastEl);

            const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
            toast.show();
        },

        /**
         * Triggers a confetti animation.
         */
        triggerConfetti: function() {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            } else {
                console.warn('Confetti library not found.');
            }
        }
    };

    window.sctUI = ui;

})(window);
