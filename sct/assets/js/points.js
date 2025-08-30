// --- Point Calculation Logic --- //

(function(window) {
    'use strict';

    // Depends on sctStore being loaded first
    const store = window.sctStore;

    // --- Private Helper Functions --- //

    /**
     * Gets the ISO week number and year for a given date.
     * @param {Date} d The date.
     * @returns {[number, number]} An array containing [year, weekNumber].
     */
    function getWeekInfo(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return [d.getUTCFullYear(), weekNo];
    }

    /**
     * Get the current week number and year.
     * @returns {[number, number]} An array containing [year, weekNumber].
     */
    function getCurrentWeekInfo() {
        return getWeekInfo(new Date());
    }

    // --- Public API --- //
    const points = {

        /**
         * Calculates points and stats for a user for a specific week.
         * @param {string} userId The ID of the user.
         * @param {[number, number]} weekInfo The [year, weekNumber] to calculate for.
         * @returns {object} An object with detailed point and stat info.
         */
        calculateWeeklyStats: function(userId, weekInfo) {
            const rules = store.getPointRules();
            const logs = store.getLogs();
            const user = store.getUserById(userId);

            if (!user) return { totalPoints: 0, studyHours: 0, coursesCompleted: 0 };

            const [year, week] = weekInfo;

            const weeklyStudyLogs = logs.study.filter(log => {
                const logWeekInfo = getWeekInfo(new Date(log.date));
                return log.userId === userId && logWeekInfo[0] === year && logWeekInfo[1] === week;
            });

            const weeklyCourseLogs = logs.courses.filter(log => {
                const logWeekInfo = getWeekInfo(new Date(log.date));
                return log.userId === userId && logWeekInfo[0] === year && logWeekInfo[1] === week;
            });

            const studyHours = weeklyStudyLogs.reduce((sum, log) => sum + log.hours, 0);
            const coursesCompleted = weeklyCourseLogs.length;

            // --- Point Calculation --- //
            let hourPoints = 0;
            if (rules.bonus && studyHours > 0) {
                const bonusHours = Math.min(studyHours, 10);
                const regularHours = studyHours - bonusHours;
                hourPoints += (bonusHours * rules.bonus.firstTenHoursMultiplier * rules.hourPoint);
                hourPoints += (regularHours * rules.hourPoint);
            } else {
                hourPoints = studyHours * rules.hourPoint;
            }

            const coursePoints = coursesCompleted * rules.coursePoint;

            // Streak bonus calculation would be more complex, omitted for this simplified version as per prompt's example logic.
            // A full implementation would require checking previous weeks.
            const streakBonus = 0;

            const totalPoints = hourPoints + coursePoints + streakBonus;

            return {
                totalPoints: Math.round(totalPoints * 100) / 100,
                studyHours: Math.round(studyHours * 100) / 100,
                coursesCompleted,
                weekInfo
            };
        },

        /**
         * Calculates the lifetime stats for a user.
         * @param {string} userId The ID of the user.
         * @returns {object} An object with lifetime stats.
         */
        calculateLifetimeStats: function(userId) {
            const logs = store.getLogs();
            const userLogs = logs.study.filter(log => log.userId === userId);
            const userCourses = logs.courses.filter(log => log.userId === userId);

            const allWeeks = [...new Set(userLogs.map(log => getWeekInfo(new Date(log.date)).join('-')))];

            const totalPoints = allWeeks.reduce((sum, weekStr) => {
                const weekInfo = weekStr.split('-').map(Number);
                return sum + this.calculateWeeklyStats(userId, weekInfo).totalPoints;
            }, 0);

            return {
                totalPoints: Math.round(totalPoints * 100) / 100,
                totalStudyHours: userLogs.reduce((sum, log) => sum + log.hours, 0),
                totalCoursesCompleted: userCourses.length,
            };
        },

        getWeekInfo,
        getCurrentWeekInfo,
    };

    window.sctPoints = points;

})(window);
