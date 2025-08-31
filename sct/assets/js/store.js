// --- Mock Data Store (localStorage) --- //

(function(window) {
    'use strict';

    const KEY_PREFIX = 'sct.';
    const USERS_KEY = `${KEY_PREFIX}users`;
    const RULES_KEY = `${KEY_PREFIX}pointRules`;
    const LOGS_KEY = `${KEY_PREFIX}logs`;
    const MODULES_KEY = `${KEY_PREFIX}modules`;
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
        },
        modules: {
            anuja: [
                // BICT Level 1
                { code: "EN 1101", name: "Integrated English Language Skills for Technology (I)" },
                { code: "FT 1101", name: "Workshop Practice" },
                { code: "FT 1201", name: "Basic Mathematics" },
                { code: "FT 1301", name: "Physics" },
                { code: "IC 1101", name: "Essentials ICT and Social Computing" },
                { code: "IC 1201", name: "Introduction to Computer Systems and Operating Systems" },
                { code: "IC 1301", name: "Application Laboratory I" },
                { code: "IC 1302", name: "Programming I" },
                { code: "EN 1102", name: "Integrated English Language Skills for Technology (II)" },
                { code: "FT 1102", name: "Technology and Historical Transformation" },
                { code: "FT 1204", name: "Computer Applications" },
                { code: "IC 1202", name: "Information System Modeling" },
                { code: "IC 1203", name: "Web Application Development" },
                { code: "IC 1303", name: "Application Laboratory II" },
                { code: "IC 1304", name: "Database Management Systems I" },
                { code: "IC 1305", name: "Object Oriented Programming" },
                // BICT Level 2
                { code: "EN 2101", name: "Primary English Communication Skills for Technology (I)" },
                { code: "FT 2201", name: "Management of Technology" },
                { code: "IC 2201", name: "Database Management Systems II" },
                { code: "IC 2202", name: "Discrete Mathematics" },
                { code: "IC 2203", name: "IT project Management" },
                { code: "IC 2204", name: "Software Engineering" },
                { code: "IC 2301", name: "Multimedia and Web Design" },
                { code: "IC 2302", name: "Computer Networks" },
                { code: "EN 2102", name: "English Communication Skills for Technology (II)" },
                { code: "IA 2205", name: "Statistical Data Analysis" },
                { code: "IC 2205", name: "IT Systems Acquisition" },
                { code: "IC 2303", name: "Agile Software Development" },
                { code: "IC 2304", name: "Graphic Design and Creative Development" },
                { code: "IC 2305", name: "Mobile Application Development" },
                { code: "IC 2306", name: "Programming II" },
                // BICT Level 3
                { code: "EN 3101", name: "Advanced Commutation Skills in English for Technology (I)" },
                { code: "IC 3201", name: "Enterprise Resource Planning Systems" },
                { code: "IC 3202", name: "ICT Innovation" },
                { code: "IC 3203", name: "Information Systems Management" },
                { code: "IC 3204", name: "Introduction to Software Quality Assurance" },
                { code: "IC 3205", name: "Introduction to Information Systems Security" },
                { code: "IC 3206", name: "Professional Practice in ICT" },
                { code: "IC 3207", name: "Bioinformatics" },
                { code: "IC 3301", name: "Introduction to GIS and Remote Sensing" },
                { code: "FT 3101", name: "Development Economics" },
                { code: "FT 3201", name: "Environmental Law" },
                { code: "FT 3202", name: "Occupational Health and Safety" },
                { code: "FT 3203", name: "Sociology and Values for a Technological Society" },
                // BICT Level 4
                { code: "EN 4101", name: "Academic Writing Skills for Technology" },
                { code: "FT 4101", name: "Intellectual Property Rights" },
                { code: "FT 4201", name: "Innovation and Entrepreneurship" },
                { code: "IC 4201", name: "Digital Forensics" },
                { code: "IC 4202", name: "Selected Topics in ICT" },
                { code: "IC 4301", name: "Data Analytics and Business Intelligence" },
                { code: "IC 4302", name: "Programming III" },
                { code: "IC 4303", name: "Systems and Network Administration" },
                { code: "EN 4102", name: "Advanced Commutation Skills in English for Technology (II)" },
                { code: "IC 4304", name: "Human Computer Interaction" },
                { code: "IC 4305", name: "Software Quality Management and Test Automation" },
                { code: "IC 4801", name: "Individual/Group Project" },
            ],
            yasuru: [
                // BET Level 1
                { code: "EN 1101", name: "Integrated English Language Skills for Technology (I)" },
                { code: "FT 1101", name: "Workshop Practice" },
                { code: "FT 1201", name: "Basic Mathematics" },
                { code: "FT 1202", name: "Biology" },
                { code: "FT 1203", name: "Chemistry" },
                { code: "FT 1301", name: "Physics" },
                { code: "IA 1201", name: "Pre-Calculus and Coordinate Geometry" },
                { code: "IA 1202", name: "Electricity and Magnetism" },
                { code: "IA 1203", name: "Communication Skills for Engineering Technologists" },
                { code: "EN 1102", name: "Integrated English Language Skills for Technology (II)" },
                { code: "FT 1102", name: "Technology and Historical Transformation" },
                { code: "FT 1204", name: "Computer Applications" },
                { code: "IA 1204", name: "Vectors and Matrices" },
                { code: "IA 1205", name: "Introduction to Calculus" },
                { code: "IA 1206", name: "Introduction to Computer Programming" },
                { code: "IA 1207", name: "Computer Architecture I" },
                { code: "IA 1208", name: "Engineering Mechanics" },
                { code: "IA 1301", name: "Analog and Digital Electronics I" },
                // BET Level 2
                { code: "EN 2101", name: "Primary English Communication Skills for Technology (I)" },
                { code: "FT 2201", name: "Management of Technology" },
                { code: "IA 2101", name: "Technical Drawing and CAD" },
                { code: "IA 2102", name: "Introduction to Engineering Materials Technology" },
                { code: "IA 2201", name: "Ordinary Differential Equations" },
                { code: "IA 2202", name: "Probability and Statistics" },
                { code: "IA 2203", name: "Computer Architecture II" },
                { code: "IA 2204", name: "Industrial Management and Marketing" },
                { code: "IA 2301", name: "Analog and Digital Electronics II" },
                { code: "EN 2102", name: "English Communication Skills for Technology (II)" },
                { code: "IA 2103", name: "Workshop Practice – Welding Techniques" },
                { code: "IA 2104", name: "Internet Programming" },
                { code: "IA 2205", name: "Statistical Data Analysis" },
                { code: "IA 2206", name: "Electromagnetic Fields" },
                { code: "IA 2207", name: "Waves and Vibrations & AC Theory" },
                { code: "IA 2208", name: "Electronic Circuit Simulations and Analysis" },
                { code: "IA 2209", name: "Microcontroller Laboratory" },
                { code: "IA 2210", name: "Rapid Application Development" },
                { code: "IA 2211", name: "Mobile Application Development" },
                // BET Level 3
                { code: "EN 3101", name: "Advanced Commutation Skills in English for Technology (I)" },
                { code: "IA 3101", name: "Introduction to Field Programmable Gate Arrays" },
                { code: "IA 3201", name: "Applied Numerical Methods" },
                { code: "IA 3202", name: "Sensors and Transducers" },
                { code: "IA 3203", name: "Digital Signal Processing" },
                { code: "IA 3204", name: "Data Acquisition Systems" },
                { code: "IA 3205", name: "Introduction to Robotics" },
                { code: "IA 3206", name: "Non-conventional Energy Sources & their Applications" },
                { code: "IA 3207", name: "Data Communication and Networking" },
                { code: "IA 3208", name: "Computer Programming (Mini Project)" },
                { code: "FT 3101", name: "Development Economics" },
                { code: "FT 3201", name: "Environmental Law" },
                { code: "FT 3202", name: "Occupational Health and Safety" },
                { code: "FT 3203", name: "Sociology and Values for a Technological Society" },
                // BET Level 4
                { code: "EN 4101", name: "Academic Writing Skills for Technology" },
                { code: "FT 4101", name: "Intellectual Property Rights" },
                { code: "FT 4201", name: "Innovation and Entrepreneurship" },
                { code: "IA 4201", name: "Power Electronics" },
                { code: "IA 4202", name: "Induction Motor Drives and Programmable Logic Controllers" },
                { code: "IA 4203", name: "Industrial Automation and Control" },
                { code: "IA 4204", name: "Instrumentation Laboratory" },
                { code: "IA 4205", name: "Engineering Economics and Financial Accounting" },
                { code: "IA 4301", name: "Precision Measurement Techniques and Calibration of Instruments" },
                { code: "EN 4102", name: "Advanced Commutation Skills in English for Technology (II)" },
                { code: "IA 4206", name: "Shielding and Protection of Electronic Instruments" },
                { code: "IA 4207", name: "Special Instrumentation Techniques" },
                { code: "IA 4208", name: "Fibre Optics and Laser Instrumentation" },
                { code: "IA 4209", name: "Nuclear and Medical Instrumentation" },
                { code: "IA 4801", name: "Research Project" },
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
                this.saveModules(seedData.modules);
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

        // Modules
        getModules: () => _get(MODULES_KEY) || { anuja: [], yasuru: [] },
        saveModules: (modules) => _set(MODULES_KEY, modules),

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
