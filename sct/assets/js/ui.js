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
            let user = store.getCurrentUser();
            // If no user is logged in (e.g., first visit), default to yasuru.
            if (!user) {
                store.setCurrentUser('yasuru');
                user = store.getCurrentUser();
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

            // KPI Cards
            const kpiContainer = $('#kpi-cards');
            if (kpiContainer) {
                kpiContainer.innerHTML = `
                    <div class="col-4 text-center">
                        <i class="bi bi-star-fill fs-2" style="color: var(--app-purple);"></i>
                        <p class="h4 mb-0 mt-2" data-kpi-value="${weeklyStats.totalPoints}">0</p>
                        <small class="text-muted">Points</small>
                    </div>
                    <div class="col-4 text-center">
                        <i class="bi bi-clock-fill fs-2" style="color: var(--app-green);"></i>
                        <p class="h4 mb-0 mt-2" data-kpi-value="${weeklyStats.studyHours}" data-format="float">0.0</p>
                        <small class="text-muted">Hours</small>
                    </div>
                    <div class="col-4 text-center">
                        <i class="bi bi-patch-check-fill fs-2" style="color: var(--app-orange);"></i>
                        <p class="h4 mb-0 mt-2" data-kpi-value="${weeklyStats.coursesCompleted}">0</p>
                        <small class="text-muted">Courses</small>
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
         * Renders the leaderboard with a podium style.
         */
        renderLeaderboard: function() {
            const users = store.getUsers();
            const currentWeek = points.getCurrentWeekInfo();

            const leaderboardData = users.map(user => {
                const weeklyStats = points.calculateWeeklyStats(user.id, currentWeek);
                return {
                    user,
                    weeklyPoints: weeklyStats.totalPoints,
                };
            }).sort((a, b) => b.weeklyPoints - a.weeklyPoints);

            const podiumEl = $('#leaderboard-podium');
            if (podiumEl) {
                // Since there are only 2 users, we manually create a 2nd and 1st place
                const secondPlace = leaderboardData[1];
                const firstPlace = leaderboardData[0];

                podiumEl.innerHTML = `
                    <div class="podium-stand second-place mx-2">
                        <div class="podium-rank">2</div>
                        <div class="podium-avatar">${secondPlace.user.avatar}</div>
                        <div class="podium-name">${secondPlace.user.name}</div>
                        <div class="podium-points">${secondPlace.weeklyPoints} pts</div>
                    </div>
                    <div class="podium-stand first-place mx-2">
                        <div class="podium-rank">1 🏆</div>
                        <div class="podium-avatar">${firstPlace.user.avatar}</div>
                        <div class="podium-name">${firstPlace.user.name}</div>
                        <div class="podium-points">${firstPlace.weeklyPoints} pts</div>
                    </div>
                `;
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
