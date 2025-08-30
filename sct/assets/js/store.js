// --- Mock Data Store (localStorage) --- //

(function(window) {
    'use strict';

    const KEY_PREFIX = 'sct.';
    const USERS_KEY = `${KEY_PREFIX}users`;
    const RULES_KEY = `${KEY_PREFIX}pointRules`;
    const LOGS_KEY = `${KEY_PREFIX}logs`;
    const CURRENT_USER_KEY = `${KEY_PREFIX}currentUser`;

    // --- Seed Data --- //
    const seedData = {
        users: [
            { id: 'yasuru', name: 'Yasuru', avatar: 'Y', theme: 'light', weeklyGoal: 10, email: 'yasurubandara2@gmail.com', password: '1234' },
            { id: 'anuja', name: 'Anuja', avatar: 'A', theme: 'light', weeklyGoal: 8, email: 'anuja@example.com', password: 'password456' }
        ],
        pointRules: {
            hourPoint: 1,
            coursePoint: 5,
            bonus: {
                firstTenHoursMultiplier: 1.2,
                streakBonusPerWeek: 2,
                streakThresholdWeeks: 3
            }
        },
        logs: {
            study: [
                { id: `study-${Date.now()}-1`, userId: 'yasuru', subject: 'Math', hours: 2, date: '2025-08-25' },
                { id: `study-${Date.now()}-2`, userId: 'anuja', subject: 'AI', hours: 3, date: '2025-08-25' },
                { id: `study-${Date.now()}-3`, userId: 'yasuru', subject: 'History', hours: 1.5, date: '2025-08-26' },
                { id: `study-${Date.now()}-4`, userId: 'anuja', subject: 'JavaScript', hours: 4, date: '2025-08-27' },
            ],
            courses: [
                { id: `course-${Date.now()}-1`, userId: 'anuja', title: 'Data Viz 101', provider: 'Coursera', difficulty: 'Medium', date: '2025-08-26' }
            ]
        }
    };

    // --- Private Helper Functions --- //
    function _get(key) {
        const value = localStorage.getItem(key);
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    function _set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // --- Public API --- //
    const store = {
        init: function() {
            if (!_get(USERS_KEY)) {
                console.log('Seeding initial data into localStorage...');
                this.saveUsers(seedData.users);
                this.savePointRules(seedData.pointRules);
                this.saveLogs(seedData.logs);
            }
        },

        // Users
        getUsers: () => _get(USERS_KEY) || [],
        saveUsers: (users) => _set(USERS_KEY, users),
        getUserById: function(userId) {
            return this.getUsers().find(u => u.id === userId);
        },

        // Point Rules
        getPointRules: () => _get(RULES_KEY) || {},
        savePointRules: (rules) => _set(RULES_KEY, rules),

        // Logs
        getLogs: () => _get(LOGS_KEY) || { study: [], courses: [] },
        saveLogs: (logs) => _set(LOGS_KEY, logs),

        addStudyLog: function(logEntry) {
            const logs = this.getLogs();
            logs.study.push({ ...logEntry, id: `study-${Date.now()}` });
            this.saveLogs(logs);
        },

        addCourseLog: function(logEntry) {
            const logs = this.getLogs();
            logs.courses.push({ ...logEntry, id: `course-${Date.now()}` });
            this.saveLogs(logs);
        },

        // Current User Session
        setCurrentUser: (userId) => _set(CURRENT_USER_KEY, userId),
        getCurrentUser: function() {
            const userId = _get(CURRENT_USER_KEY);
            if (!userId) return null;
            return this.getUserById(userId);
        },
        logout: () => localStorage.removeItem(CURRENT_USER_KEY),
    };

    // Expose the store to the global window object
    window.sctStore = store;

    // Initialize the store on script load
    window.sctStore.init();

})(window);
