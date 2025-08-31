// --- Main Application Logic --- //

(function() {
    'use strict';

    // Dependencies
    const store = window.sctStore;
    const ui = window.sctUI;

    // --- DOM Element Selectors --- //
    const $ = (selector) => document.querySelector(selector);
    const logStudyForm = $('#log-study-form');
    const logCourseForm = $('#log-course-form');
    const settingsForm = $('#settings-form');
    // Add other forms and key elements as needed

    // --- Event Handlers --- //

    /**
     * Handles the study log form submission.
     */
    function handleStudyLog(event) {
        event.preventDefault();
        const formData = new FormData(logStudyForm);
        const user = store.getCurrentUser();

        const newLog = {
            userId: user.id,
            subject: formData.get('subject'),
            hours: parseFloat(formData.get('hours')),
            date: formData.get('date'),
            notes: formData.get('notes')
        };

        const submitBtn = logStudyForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging...`;

        // Simulate network delay
        setTimeout(() => {
            store.addStudyLog(newLog);
            ui.showToast('Study session logged successfully!', 'success');
            ui.renderRecentLogs(); // Re-render the table
            logStudyForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }, 500);
    }

    /**
     * Handles the course completion form submission.
     */
    function handleCourseLog(event) {
        event.preventDefault();
        const formData = new FormData(logCourseForm);
        const user = store.getCurrentUser();

        const newLog = {
            userId: user.id,
            title: formData.get('course-title'),
            provider: formData.get('provider'),
            difficulty: formData.get('difficulty'),
            date: formData.get('completed-on')
        };

        const submitBtn = logCourseForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging...`;

        // Simulate network delay
        setTimeout(() => {
            store.addCourseLog(newLog);
            ui.showToast('Course completion logged! +5 points!', 'success');
            ui.triggerConfetti();
            ui.renderRecentLogs(); // Re-render the table
            logCourseForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }, 500);
    }

    /**
     * Handles the settings form submission.
     */
    function handleSettingsUpdate(event) {
        event.preventDefault();
        const formData = new FormData(settingsForm);

        // Update Point Rules
        const currentRules = store.getPointRules();
        const newRules = {
            ...currentRules,
            hourPoint: parseFloat(formData.get('hourPoint')),
            coursePoint: parseInt(formData.get('coursePoint'))
        };
        store.savePointRules(newRules);

        // Update User Profile Settings
        const currentUser = store.getCurrentUser();
        const allUsers = store.getUsers();
        const updatedUsers = allUsers.map(user => {
            if (user.id === currentUser.id) {
                return {
                    ...user,
                    theme: formData.get('theme'),
                    weeklyGoal: parseInt(formData.get('weeklyGoal'))
                };
            }
            return user;
        });
        store.saveUsers(updatedUsers);

        ui.showToast('Settings saved successfully!', 'success');

        // Apply theme change if needed
        document.documentElement.setAttribute('data-bs-theme', formData.get('theme'));
    }


    // --- Router (Page-specific logic) --- //

    /**
     * Populates the subject dropdown on the log page.
     */
    function populateSubjectDropdown() {
        const user = store.getCurrentUser();
        const modules = store.getModules();
        const subjectSelect = $('#subject');

        if (user && modules && subjectSelect) {
            const userModules = modules[user.id] || [];
            subjectSelect.innerHTML = userModules.map(module =>
                `<option value="${module.code} - ${module.name}">${module.code} - ${module.name}</option>`
            ).join('');
        }
    }

    // --- Router (Page-specific logic) --- //

    function route() {
        // First, initialize shared UI elements like header and auth check
        ui.initSharedUI();

        const path = window.location.pathname;

        if (path.endsWith('dashboard.html')) {
            const charts = window.sctCharts;
            ui.renderDashboard();
            charts.initDashboardCharts();
        } else if (path.endsWith('leaderboard.html')) {
            ui.renderLeaderboard();
            charts.initLeaderboardChart();
        } else if (path.endsWith('log.html')) {
            populateSubjectDropdown();
            if (logStudyForm) logStudyForm.addEventListener('submit', handleStudyLog);
            if (logCourseForm) logCourseForm.addEventListener('submit', handleCourseLog);
            ui.renderRecentLogs();
        } else if (path.endsWith('settings.html')) {
            ui.renderSettingsPage();
            if (settingsForm) settingsForm.addEventListener('submit', handleSettingsUpdate);
        } else if (path.endsWith('history.html')) {
            ui.renderHistoryPage();
        } else if (path.endsWith('notifications.html')) {
            // TODO: Add logic for notifications page
        }
    }

    // --- App Initialization --- //
    route();

})();
