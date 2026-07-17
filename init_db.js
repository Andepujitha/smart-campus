const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

(async () => {
    console.log("⚙️ Starting SQLite database initialization...");

    const dbPath = path.join(__dirname, 'smart_campus.db');
    
    // Delete existing sqlite file to avoid duplicate key issues on fresh seed
    if (fs.existsSync(dbPath)) {
        console.log("🗑️ Deleting old database file...");
        fs.unlinkSync(dbPath);
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("❌ Failed to connect to SQLite file:", err.message);
            return;
        }
        console.log("✅ Created and connected to SQLite database at:", dbPath);
    });

    db.serialize(() => {
        // Create Tables
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            dept TEXT NOT NULL,
            cgpa REAL NOT NULL DEFAULT 0.00,
            attendance REAL NOT NULL DEFAULT 100.00,
            parent TEXT NOT NULL,
            parentPhone TEXT NOT NULL,
            email TEXT NOT NULL,
            photo TEXT NOT NULL,
            aadhaar TEXT NOT NULL DEFAULT 'Pending Upload',
            certs TEXT NOT NULL DEFAULT 'Pending Upload',
            scholarship TEXT NOT NULL DEFAULT 'Ineligible',
            placementEligible INTEGER NOT NULL DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS faculty (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            photo TEXT NOT NULL,
            subjectAllocated TEXT NOT NULL,
            attendance REAL NOT NULL DEFAULT 100.00,
            salary TEXT NOT NULL DEFAULT '₹75,000/mo'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS courses (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            duration TEXT NOT NULL,
            facultyId TEXT NOT NULL,
            subjects TEXT NOT NULL,
            studentsEnrolled INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS notices (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            urgency TEXT NOT NULL,
            date TEXT NOT NULL,
            content TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS calendar_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS library_books (
            isbn TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            available INTEGER NOT NULL DEFAULT 0,
            location TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS scholarships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT NOT NULL,
            name TEXT NOT NULL,
            cgpaRequired REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS placement_drives (
            company TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            minCgpa REAL NOT NULL,
            package TEXT NOT NULL,
            date TEXT NOT NULL,
            registered INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Upcoming'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS fees (
            refNo TEXT PRIMARY KEY,
            studentId TEXT NOT NULL,
            term TEXT NOT NULL,
            amount INTEGER NOT NULL,
            dueDate TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS exams (
            code TEXT NOT NULL,
            subject TEXT NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            duration TEXT NOT NULL,
            room TEXT NOT NULL,
            PRIMARY KEY (code, type)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS grades (
            studentId TEXT NOT NULL,
            examType TEXT NOT NULL,
            marks INTEGER NOT NULL DEFAULT 0,
            grade TEXT NOT NULL DEFAULT 'F',
            PRIMARY KEY (studentId, examType),
            FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
        )`);

        console.log("📝 Tables created successfully.");

        // Insert Seed Data
        const studentAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232bbfa3'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";
        const facultyAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";

        // 1. Faculty
        const stmtFaculty = db.prepare(`INSERT INTO faculty (id, name, photo, subjectAllocated, attendance, salary) VALUES (?,?,?,?,?,?)`);
        stmtFaculty.run('FAC-101', 'Dr. Ramesh Prasad', facultyAvatar, 'Data Structures & Algorithms', 96.50, '₹85,000/mo');
        stmtFaculty.run('FAC-102', 'Prof. S. N. Bose', facultyAvatar, 'Artificial Intelligence & Neural Nets', 99.10, '₹92,000/mo');
        stmtFaculty.run('FAC-103', 'Dr. APJ Kalam', facultyAvatar, 'Microprocessors & Embedded Design', 98.40, '₹1,20,000/mo');
        stmtFaculty.run('FAC-104', 'Prof. C. V. Raman', facultyAvatar, 'Fluid Dynamics & Thermals', 92.30, '₹88,000/mo');
        stmtFaculty.finalize();

        // 2. Students
        const stmtStudents = db.prepare(`INSERT INTO students (id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, aadhaar, certs, scholarship, placementEligible) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
        stmtStudents.run('SC-2026-CSE01', 'Aarav Sharma', 'Computer Science Eng', 9.10, 94.20, 'Rajesh Sharma', '+91 98765 43210', 'aarav.s@campus.edu', studentAvatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Eligible', 1);
        stmtStudents.run('SC-2026-CSE02', 'Kavya Patel', 'Computer Science Eng', 8.80, 71.50, 'Sanjay Patel', '+91 98234 56789', 'kavya.p@campus.edu', studentAvatar, 'Uploaded & Verified', 'Pending Verification', 'Applied', 1);
        stmtStudents.run('SC-2026-ECE05', 'Ananya Rao', 'Electronics & Comm', 6.40, 62.10, 'Kalyan Rao', '+91 97654 32109', 'ananya.r@campus.edu', studentAvatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Ineligible', 0);
        stmtStudents.run('SC-2026-ME09', 'Vikram Singh', 'Mechanical Eng', 7.90, 88.00, 'Harbhajan Singh', '+91 99123 45678', 'vikram.s@campus.edu', studentAvatar, 'Pending Upload', 'Pending Upload', 'Ineligible', 1);
        stmtStudents.run('SC-2026-CSE12', 'Rohan Das', 'Computer Science Eng', 9.60, 98.40, 'Sujata Das', '+91 91234 56789', 'rohan.d@campus.edu', studentAvatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Approved', 1);
        stmtStudents.finalize();

        // 3. Courses
        const stmtCourses = db.prepare(`INSERT INTO courses (code, name, duration, facultyId, subjects, studentsEnrolled) VALUES (?,?,?,?,?,?)`);
        stmtCourses.run('CS-101', 'Data Structures & Algorithms', '1 Semester', 'FAC-101', 'Arrays & Linked Lists, Trees & Graphs, Hashing & Search Algorithms, Sorting Strategies', 42);
        stmtCourses.run('CS-202', 'Artificial Intelligence & Neural Nets', '1 Semester', 'FAC-102', 'Supervised Learning, Deep Networks, Reinforcement Models, Natural Language Processing', 38);
        stmtCourses.run('EC-305', 'Microprocessors & Embedded Design', '1 Semester', 'FAC-103', '8085/8086 Architecture, Assembly Language, Peripheral Interfacing, IoT Protocols', 30);
        stmtCourses.run('ME-410', 'Fluid Dynamics & Thermals', '1 Semester', 'FAC-104', 'Bernoulli\'s Principles, Turbulent Flows, Heat Transfer Coefficients, Entropy Cycles', 25);
        stmtCourses.finalize();

        // 4. Notices
        const stmtNotices = db.prepare(`INSERT INTO notices (id, title, category, urgency, date, content) VALUES (?,?,?,?,?,?)`);
        stmtNotices.run('NOT-001', 'Semester End Theoretical Exams Schedule', 'exam', 'critical', '2026-07-04', 'The formal Semester End Exams for all streams (CSE, ECE, ME) will start on August 10, 2026. Detailed schedules, session allocations, and syllabus cutoffs are posted. Clear all pending fees before July 20 to download official hall tickets.');
        stmtNotices.run('NOT-002', 'Independence Day Recess Declaration', 'holiday', 'normal', '2026-07-02', 'The Campus will remain closed on August 15, 2026, in observance of Independence Day. The national flag hoisting ceremony will start at 08:30 AM in the central courtyard. Attendance is compulsory for hostel residents.');
        stmtNotices.run('NOT-003', 'Infosys Campus Recruitment Drive', 'placement', 'high', '2026-07-01', 'Infosys recruitment managers will hold a campus drive on August 20 for Specialist Programmer and Systems Engineer roles. Minimum eligibility criterion: 8.0 CGPA with zero active backlogs. Register via placement module before August 10.');
        stmtNotices.finalize();

        // 5. Calendar Events
        const stmtEvents = db.prepare(`INSERT INTO calendar_events (date, title, type) VALUES (?,?,?)`);
        stmtEvents.run('2026-07-05', 'Term Fees Collection Deadline', 'event');
        stmtEvents.run('2026-08-15', 'Independence Day Celebration', 'holiday');
        stmtEvents.run('2026-09-05', 'Teachers Day Event', 'event');
        stmtEvents.run('2026-08-20', 'Infosys Campus Drive', 'event');
        stmtEvents.run('2026-08-10', 'Semester End Exams Start', 'exam');
        stmtEvents.run('2026-10-02', 'Gandhi Jayanti', 'holiday');
        stmtEvents.finalize();

        // 6. Library Books
        const stmtBooks = db.prepare(`INSERT INTO library_books (isbn, title, author, available, location) VALUES (?,?,?,?,?)`);
        stmtBooks.run('978-0131103627', 'The C Programming Language', 'Kernighan & Ritchie', 14, 'Shelf A-4');
        stmtBooks.run('978-0262033848', 'Introduction to Algorithms (CLRS)', 'Cormen et al.', 8, 'Shelf A-7');
        stmtBooks.run('978-0136042594', 'Artificial Intelligence: A Modern Approach', 'Russell & Norvig', 0, 'Shelf B-2');
        stmtBooks.run('978-0071390446', 'Fluid Mechanics Fundamentals', 'Cengel & Cimbala', 5, 'Shelf C-1');
        stmtBooks.finalize();

        // 7. Scholarships
        const stmtScholarships = db.prepare(`INSERT INTO scholarships (studentId, name, cgpaRequired, status) VALUES (?,?,?,?)`);
        stmtScholarships.run('SC-2026-CSE01', 'National Merit Scholarship (MHRD)', 9.00, 'Approved');
        stmtScholarships.run('SC-2026-CSE02', 'State Technical Aid Scheme', 8.00, 'Pending');
        stmtScholarships.run('SC-2026-ECE05', 'Pragati Scholarship for Girls', 7.50, 'Rejected');
        stmtScholarships.run('SC-2026-CSE12', 'National Merit Scholarship (MHRD)', 9.00, 'Approved');
        stmtScholarships.finalize();

        // 8. Placement Drives
        const stmtPlacements = db.prepare(`INSERT INTO placement_drives (company, role, minCgpa, package, date, registered, status) VALUES (?,?,?,?,?,?,?)`);
        stmtPlacements.run('Infosys', 'Specialist Programmer', 8.00, '₹9,50,000/yr', '2026-08-20', 4, 'Upcoming');
        stmtPlacements.run('TCS', 'Digital Systems Engineer', 7.00, '₹7,00,000/yr', '2026-08-28', 2, 'Upcoming');
        stmtPlacements.run('Wipro', 'Project Engineer', 6.50, '₹4,50,000/yr', '2026-09-02', 1, 'Active');
        stmtPlacements.finalize();

        // 9. Fees
        const stmtFees = db.prepare(`INSERT INTO fees (refNo, studentId, term, amount, dueDate, status) VALUES (?,?,?,?,?,?)`);
        stmtFees.run('TXN-8809', 'SC-2026-CSE01', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Paid');
        stmtFees.run('TXN-8810', 'SC-2026-CSE02', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Pending');
        stmtFees.run('TXN-8811', 'SC-2026-ECE05', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Paid');
        stmtFees.run('TXN-8812', 'SC-2026-ME09', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Pending');
        stmtFees.run('TXN-8813', 'SC-2026-CSE12', 'Semester 3 Tuition & Labs', 52000, '2026-07-05', 'Paid');
        stmtFees.finalize();

        // 10. Exams
        const stmtExams = db.prepare(`INSERT INTO exams (code, subject, type, date, duration, room) VALUES (?,?,?,?,?,?)`);
        stmtExams.run('CS-101', 'Data Structures & Algorithms', 'Mid-Term', '2026-08-10 10:00 AM', '2 Hours', 'Exam Hall B');
        stmtExams.run('CS-202', 'Artificial Intelligence & Neural Nets', 'Mid-Term', '2026-08-12 02:00 PM', '2 Hours', 'Exam Hall A');
        stmtExams.run('EC-305', 'Microprocessors & Embedded Design', 'Mid-Term', '2026-08-10 02:00 PM', '2 Hours', 'Lab Room 102');
        stmtExams.finalize();

        // 11. Grades
        const stmtGrades = db.prepare(`INSERT INTO grades (studentId, examType, marks, grade) VALUES (?,?,?,?)`);
        stmtGrades.run('SC-2026-CSE01', 'Mid-Term', 92, 'A+');
        stmtGrades.run('SC-2026-CSE02', 'Mid-Term', 84, 'A');
        stmtGrades.run('SC-2026-ECE05', 'Mid-Term', 56, 'C');
        stmtGrades.run('SC-2026-ME09', 'Mid-Term', 74, 'B');
        stmtGrades.run('SC-2026-CSE12', 'Mid-Term', 98, 'O (Outstanding)');
        stmtGrades.finalize();

        console.log("🎉 SQLite Database 'smart_campus.db' initialized successfully with all tables and seed data!");
    });

    db.close();
})();
