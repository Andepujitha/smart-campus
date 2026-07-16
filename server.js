require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8085;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching globally for ALL resources (HTML, CSS, JS, API)
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// Serve frontend static folder
app.use(express.static(path.join(__dirname)));

// MySQL Database Connection Pool configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_campus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;
let useMySQL = false;

// IN-MEMORY FALLBACK DATABASE (If MySQL is offline/forgot password)
const avatars = {
    admin: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    faculty: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    student: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232bbfa3'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    parent: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23d946ef'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>"
};

const memDb = {
    students: [
        { id: "SC-2026-CSE01", name: "Aarav Sharma", dept: "Computer Science Eng", cgpa: 9.1, attendance: 94.2, parent: "Rajesh Sharma", parentPhone: "+91 98765 43210", email: "aarav.s@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Eligible", placementEligible: true },
        { id: "SC-2026-CSE02", name: "Kavya Patel", dept: "Computer Science Eng", cgpa: 8.8, attendance: 71.5, parent: "Sanjay Patel", parentPhone: "+91 98234 56789", email: "kavya.p@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Pending Verification", scholarship: "Applied", placementEligible: true },
        { id: "SC-2026-ECE05", name: "Ananya Rao", dept: "Electronics & Comm", cgpa: 6.4, attendance: 62.1, parent: "Kalyan Rao", parentPhone: "+91 97654 32109", email: "ananya.r@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Ineligible", placementEligible: false },
        { id: "SC-2026-ME09", name: "Vikram Singh", dept: "Mechanical Eng", cgpa: 7.9, attendance: 88.0, parent: "Harbhajan Singh", parentPhone: "+91 99123 45678", email: "vikram.s@campus.edu", photo: avatars.student, aadhaar: "Pending Upload", certs: "Pending Upload", scholarship: "Ineligible", placementEligible: true },
        { id: "SC-2026-CSE12", name: "Rohan Das", dept: "Computer Science Eng", cgpa: 9.6, attendance: 98.4, parent: "Sujata Das", parentPhone: "+91 91234 56789", email: "rohan.d@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Approved", placementEligible: true }
    ],
    faculty: [
        { id: "FAC-101", name: "Ande Pujitha", photo: avatars.faculty, subjectAllocated: "Data Structures & Algorithms", attendance: 96.5, salary: "₹85,000/mo" },
        { id: "FAC-102", name: "Prof. S. N. Bose", photo: avatars.faculty, subjectAllocated: "Artificial Intelligence & Neural Nets", attendance: 99.1, salary: "₹92,000/mo" },
        { id: "FAC-103", name: "Dr. APJ Kalam", photo: avatars.faculty, subjectAllocated: "Microprocessors & Embedded Design", attendance: 98.4, salary: "₹1,20,000/mo" },
        { id: "FAC-104", name: "Prof. C. V. Raman", photo: avatars.faculty, subjectAllocated: "Fluid Dynamics & Thermals", attendance: 92.3, salary: "₹88,000/mo" }
    ],
    courses: [
        { code: "CS-101", name: "Data Structures & Algorithms", duration: "1 Semester", facultyId: "FAC-101", subjects: ["Arrays & Linked Lists", "Trees & Graphs", "Hashing & Search Algorithms", "Sorting Strategies"], studentsEnrolled: 42 },
        { code: "CS-202", name: "Artificial Intelligence & Neural Nets", duration: "1 Semester", facultyId: "FAC-102", subjects: ["Supervised Learning", "Deep Networks", "Reinforcement Models", "Natural Language Processing"], studentsEnrolled: 38 },
        { code: "EC-305", name: "Microprocessors & Embedded Design", duration: "1 Semester", facultyId: "FAC-103", subjects: ["8085/8086 Architecture", "Assembly Language", "Peripheral Interfacing", "IoT Protocols"], studentsEnrolled: 30 },
        { code: "ME-410", name: "Fluid Dynamics & Thermals", duration: "1 Semester", facultyId: "FAC-104", subjects: ["Bernoulli's Principles", "Turbulent Flows", "Heat Transfer Coefficients", "Entropy Cycles"], studentsEnrolled: 25 }
    ],
    notices: [
        { id: "NOT-001", title: "Semester End Theoretical Exams Schedule", category: "exam", urgency: "critical", date: "2026-07-04", content: "The formal Semester End Exams for all streams (CSE, ECE, ME) will start on August 10, 2026. Detailed schedules, session allocations, and syllabus cutoffs are posted. Clear all pending fees before July 20 to download official hall tickets." },
        { id: "NOT-002", title: "Independence Day Recess Declaration", category: "holiday", urgency: "normal", date: "2026-07-02", content: "The Campus will remain closed on August 15, 2026, in observance of Independence Day. The national flag hoisting ceremony will start at 08:30 AM in the central courtyard. Attendance is compulsory for hostel residents." },
        { id: "NOT-003", title: "Infosys Campus Recruitment Drive", category: "placement", urgency: "high", date: "2026-07-01", content: "Infosys recruitment managers will hold a campus drive on August 20 for Specialist Programmer and Systems Engineer roles. Minimum eligibility criterion: 8.0 CGPA with zero active backlogs. Register via placement module before August 10." }
    ],
    calendarEvents: [
        { date: "2026-07-05", title: "Term Fees Collection Deadline", type: "event" },
        { date: "2026-08-15", title: "Independence Day Celebration", type: "holiday" },
        { date: "2026-09-05", title: "Teachers Day Event", type: "event" },
        { date: "2026-08-20", title: "Infosys Campus Drive", type: "event" },
        { date: "2026-08-10", title: "Semester End Exams Start", type: "exam" },
        { date: "2026-10-02", title: "Gandhi Jayanti", type: "holiday" }
    ],
    library: [
        { isbn: "978-0131103627", title: "The C Programming Language", author: "Kernighan & Ritchie", available: 14, location: "Shelf A-4" },
        { isbn: "978-0262033848", title: "Introduction to Algorithms (CLRS)", author: "Cormen et al.", available: 8, location: "Shelf A-7" },
        { isbn: "978-0136042594", title: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", available: 0, location: "Shelf B-2" },
        { isbn: "978-0071390446", title: "Fluid Mechanics Fundamentals", author: "Cengel & Cimbala", available: 5, location: "Shelf C-1" }
    ],
    scholarships: [
        { studentId: "SC-2026-CSE01", name: "National Merit Scholarship (MHRD)", cgpaRequired: 9.0, status: "Approved" },
        { studentId: "SC-2026-CSE02", name: "State Technical Aid Scheme", cgpaRequired: 8.0, status: "Pending" },
        { studentId: "SC-2026-ECE05", name: "Pragati Scholarship for Girls", cgpaRequired: 7.5, status: "Rejected" },
        { studentId: "SC-2026-CSE12", name: "National Merit Scholarship (MHRD)", cgpaRequired: 9.0, status: "Approved" }
    ],
    placements: [
        { company: "Infosys", role: "Specialist Programmer", minCgpa: 8.0, package: "₹9,50,000/yr", date: "2026-08-20", registered: 4, status: "Upcoming" },
        { company: "TCS", role: "Digital Systems Engineer", minCgpa: 7.0, package: "₹7,00,000/yr", date: "2026-08-28", registered: 2, status: "Upcoming" },
        { company: "Wipro", role: "Project Engineer", minCgpa: 6.5, package: "₹4,50,000/yr", date: "2026-09-02", registered: 1, status: "Active" }
    ],
    fees: [
        { refNo: "TXN-8809", studentId: "SC-2026-CSE01", term: "Semester 3 Tuition Fee", amount: 45000, dueDate: "2026-07-05", status: "Paid" },
        { refNo: "TXN-8810", studentId: "SC-2026-CSE02", term: "Semester 3 Tuition Fee", amount: 45000, dueDate: "2026-07-05", status: "Pending" },
        { refNo: "TXN-8811", studentId: "SC-2026-ECE05", term: "Semester 3 Tuition Fee", amount: 45000, dueDate: "2026-07-05", status: "Paid" },
        { refNo: "TXN-8812", studentId: "SC-2026-ME09", term: "Semester 3 Tuition Fee", amount: 45000, dueDate: "2026-07-05", status: "Pending" },
        { refNo: "TXN-8813", studentId: "SC-2026-CSE12", term: "Semester 3 Tuition & Labs", amount: 52000, dueDate: "2026-07-05", status: "Paid" }
    ],
    exams: [
        { code: "CS-101", subject: "Data Structures & Algorithms", type: "Mid-Term", date: "2026-08-10 10:00 AM", duration: "2 Hours", room: "Exam Hall B" },
        { code: "CS-202", subject: "Artificial Intelligence & Neural Nets", type: "Mid-Term", date: "2026-08-12 02:00 PM", duration: "2 Hours", room: "Exam Hall A" },
        { code: "EC-305", subject: "Microprocessors & Embedded Design", type: "Mid-Term", date: "2026-08-10 02:00 PM", duration: "2 Hours", room: "Lab Room 102" }
    ],
    grades: [
        { studentId: "SC-2026-CSE01", examType: "Mid-Term", marks: 92, grade: "A+" },
        { studentId: "SC-2026-CSE02", examType: "Mid-Term", marks: 84, grade: "A" },
        { studentId: "SC-2026-ECE05", examType: "Mid-Term", marks: 56, grade: "C" },
        { studentId: "SC-2026-ME09", examType: "Mid-Term", marks: 74, grade: "B" },
        { studentId: "SC-2026-CSE12", examType: "Mid-Term", marks: 98, grade: "O (Outstanding)" }
    ]
};

async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        const [rows] = await pool.query('SELECT 1');
        useMySQL = true;
        console.log('✅ Connected to MySQL Database successfully.');
    } catch (err) {
        useMySQL = false;
        console.error('❌ MySQL Connection Failed: ', err.message);
        console.warn('⚠️ Server will run in memory local mode. Changes will be saved in server memory.');
    }
}

initDb();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// --- Students API ---
app.get('/api/students', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM students');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.students);
    }
});

app.post('/api/students', async (req, res) => {
    const { id, name, dept, cgpa, attendance, parent, parentPhone, email, photo } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO students (id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, placementEligible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, cgpa >= 8.0]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.students.push({
            id, name, dept, cgpa: parseFloat(cgpa), attendance: parseFloat(attendance),
            parent, parentPhone, email, photo, aadhaar: 'Pending Upload', certs: 'Pending Upload',
            scholarship: 'Ineligible', placementEligible: cgpa >= 8.0
        });
        res.json({ success: true });
    }
});

app.put('/api/students/verify-document', async (req, res) => {
    const { id, type, value } = req.body;
    if (useMySQL) {
        try {
            const field = type === 'aadhaar' ? 'aadhaar' : 'certs';
            await pool.query(`UPDATE students SET ${field} = ? WHERE id = ?`, [value, id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const s = memDb.students.find(x => x.id === id);
        if (s) {
            if (type === 'aadhaar') s.aadhaar = value;
            else s.certs = value;
        }
        res.json({ success: true });
    }
});

app.put('/api/students/attendance', async (req, res) => {
    const { id, attendance } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE students SET attendance = ? WHERE id = ?', [attendance, id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const s = memDb.students.find(x => x.id === id);
        if (s) s.attendance = parseFloat(attendance);
        res.json({ success: true });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    if (useMySQL) {
        try {
            await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.students = memDb.students.filter(x => x.id !== req.params.id);
        res.json({ success: true });
    }
});

// --- Faculty API ---
app.get('/api/faculty', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM faculty');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.faculty);
    }
});

app.post('/api/faculty', async (req, res) => {
    const { id, name, photo, subjectAllocated, attendance, salary } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO faculty (id, name, photo, subjectAllocated, attendance, salary) VALUES (?, ?, ?, ?, ?, ?)',
                [id, name, photo, subjectAllocated, attendance, salary]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.faculty.push({ id, name, photo, subjectAllocated, attendance: parseFloat(attendance), salary });
        res.json({ success: true });
    }
});

app.put('/api/faculty/allocate', async (req, res) => {
    const { id, subject } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE faculty SET subjectAllocated = ? WHERE id = ?', [subject, id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const f = memDb.faculty.find(x => x.id === id);
        if (f) f.subjectAllocated = subject;
        res.json({ success: true });
    }
});

// --- Courses API ---
app.get('/api/courses', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM courses');
            const parsed = rows.map(c => ({
                ...c,
                subjects: c.subjects.split(',').map(s => s.trim())
            }));
            res.json(parsed);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.courses);
    }
});

app.post('/api/courses', async (req, res) => {
    const { code, name, duration, facultyId, subjects } = req.body;
    const subjectsStr = Array.isArray(subjects) ? subjects.join(', ') : subjects;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO courses (code, name, duration, facultyId, subjects) VALUES (?, ?, ?, ?, ?)',
                [code, name, duration, facultyId, subjectsStr]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.courses.push({
            code, name, duration, facultyId,
            subjects: Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim()),
            studentsEnrolled: 0
        });
        res.json({ success: true });
    }
});

app.put('/api/courses/subjects', async (req, res) => {
    const { code, subjects } = req.body;
    const subjectsStr = Array.isArray(subjects) ? subjects.join(', ') : subjects;
    if (useMySQL) {
        try {
            await pool.query('UPDATE courses SET subjects = ? WHERE code = ?', [subjectsStr, code]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const c = memDb.courses.find(x => x.code === code);
        if (c) c.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim());
        res.json({ success: true });
    }
});

// --- Notices API ---
app.get('/api/notices', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM notices ORDER BY date DESC');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.notices);
    }
});

app.post('/api/notices', async (req, res) => {
    const { id, title, category, urgency, date, content } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO notices (id, title, category, urgency, date, content) VALUES (?, ?, ?, ?, ?, ?)',
                [id, title, category, urgency, date, content]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.notices.unshift({ id, title, category, urgency, date, content });
        res.json({ success: true });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    if (useMySQL) {
        try {
            await pool.query('DELETE FROM notices WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.notices = memDb.notices.filter(x => x.id !== req.params.id);
        res.json({ success: true });
    }
});

// --- Calendar API ---
app.get('/api/calendar', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM calendar_events');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.calendarEvents);
    }
});

app.post('/api/calendar', async (req, res) => {
    const { date, title, type } = req.body;
    if (useMySQL) {
        try {
            await pool.query('INSERT INTO calendar_events (date, title, type) VALUES (?, ?, ?)', [date, title, type]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.calendarEvents.push({ date, title, type });
        res.json({ success: true });
    }
});

// --- Library Books API ---
app.get('/api/library', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM library_books');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.library);
    }
});

app.post('/api/library', async (req, res) => {
    const { isbn, title, author, available, location } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO library_books (isbn, title, author, available, location) VALUES (?, ?, ?, ?, ?)',
                [isbn, title, author, available, location]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.library.push({ isbn, title, author, available: parseInt(available), location });
        res.json({ success: true });
    }
});

app.put('/api/library/borrow', async (req, res) => {
    const { isbn } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE library_books SET available = available - 1 WHERE isbn = ? AND available > 0', [isbn]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const b = memDb.library.find(x => x.isbn === isbn);
        if (b && b.available > 0) b.available--;
        res.json({ success: true });
    }
});

// --- Scholarships API ---
app.get('/api/scholarships', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM scholarships');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.scholarships);
    }
});

app.post('/api/scholarships', async (req, res) => {
    const { studentId, name, cgpaRequired } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO scholarships (studentId, name, cgpaRequired, status) VALUES (?, ?, ?, ?)',
                [studentId, name, cgpaRequired, 'Pending']
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.scholarships.push({ studentId, name, cgpaRequired: parseFloat(cgpaRequired), status: 'Pending' });
        res.json({ success: true });
    }
});

app.put('/api/scholarships/review', async (req, res) => {
    const { studentId, status } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE scholarships SET status = ? WHERE studentId = ?', [status, studentId]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const s = memDb.scholarships.find(x => x.studentId === studentId);
        if (s) s.status = status;
        res.json({ success: true });
    }
});

// --- Placement Drives API ---
app.get('/api/placements', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM placement_drives ORDER BY date ASC');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.placements);
    }
});

app.post('/api/placements', async (req, res) => {
    const { company, role, minCgpa, package, date } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO placement_drives (company, role, minCgpa, package, date, registered, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [company, role, minCgpa, package, date, 0, 'Upcoming']
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.placements.unshift({ company, role, minCgpa: parseFloat(minCgpa), package, date, registered: 0, status: 'Upcoming' });
        res.json({ success: true });
    }
});

app.put('/api/placements/register', async (req, res) => {
    const { company } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE placement_drives SET registered = registered + 1 WHERE company = ?', [company]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const p = memDb.placements.find(x => x.company === company);
        if (p) p.registered++;
        res.json({ success: true });
    }
});

// --- Fees API ---
app.get('/api/fees', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM fees');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.fees);
    }
});

app.post('/api/fees', async (req, res) => {
    const { refNo, studentId, term, amount, dueDate, status } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO fees (refNo, studentId, term, amount, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)',
                [refNo, studentId, term, amount, dueDate, status || 'Pending']
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.fees.push({ refNo, studentId, term, amount: parseInt(amount), dueDate, status: status || 'Pending' });
        res.json({ success: true });
    }
});

app.put('/api/fees/pay', async (req, res) => {
    const { refNo } = req.body;
    if (useMySQL) {
        try {
            await pool.query('UPDATE fees SET status = "Paid" WHERE refNo = ?', [refNo]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        const f = memDb.fees.find(x => x.refNo === refNo);
        if (f) f.status = 'Paid';
        res.json({ success: true });
    }
});

// --- Exams API ---
app.get('/api/exams', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM exams');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.exams);
    }
});

app.post('/api/exams', async (req, res) => {
    const { code, subject, type, date, duration, room } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO exams (code, subject, type, date, duration, room) VALUES (?, ?, ?, ?, ?, ?)',
                [code, subject, type, date, duration, room]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        memDb.exams.push({ code, subject, type, date, duration, room });
        res.json({ success: true });
    }
});

// --- Grades API ---
app.get('/api/grades', async (req, res) => {
    if (useMySQL) {
        try {
            const [rows] = await pool.query('SELECT * FROM grades');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.json(memDb.grades);
    }
});

app.post('/api/grades', async (req, res) => {
    const { studentId, examType, marks, grade } = req.body;
    if (useMySQL) {
        try {
            await pool.query(
                'INSERT INTO grades (studentId, examType, marks, grade) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks = ?, grade = ?',
                [studentId, examType, marks, grade, marks, grade]
            );
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        let g = memDb.grades.find(x => x.studentId === studentId && x.examType === examType);
        if (g) {
            g.marks = parseInt(marks);
            g.grade = grade;
        } else {
            memDb.grades.push({ studentId, examType, marks: parseInt(marks), grade });
        }
        res.json({ success: true });
    }
});

// Default route served for HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server Listen
app.listen(PORT, () => {
    console.log(`🚀 Smart Campus Backend server listening on http://localhost:${PORT}`);
});
