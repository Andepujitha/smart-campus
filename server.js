require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

// SQLite Database Connection
const dbPath = path.join(__dirname, 'smart_campus.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Connection Failed: ', err.message);
    } else {
        console.log('✅ SQLite Database Connected successfully at:', dbPath);
    }
});

// Promise Helpers for SQLite
const query = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
    });
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// --- Students API ---
app.get('/api/students', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM students');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/students', async (req, res) => {
    const { id, name, dept, cgpa, attendance, parent, parentPhone, email, photo } = req.body;
    try {
        await run(
            'INSERT INTO students (id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, placementEligible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, cgpa >= 8.0 ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/students/verify-document', async (req, res) => {
    const { id, type, value } = req.body;
    try {
        const field = type === 'aadhaar' ? 'aadhaar' : 'certs';
        await run(`UPDATE students SET ${field} = ? WHERE id = ?`, [value, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/students/attendance', async (req, res) => {
    const { id, attendance } = req.body;
    try {
        await run('UPDATE students SET attendance = ? WHERE id = ?', [attendance, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/students/gpa', async (req, res) => {
    const { id, gpa } = req.body;
    try {
        await run('UPDATE students SET cgpa = ?, placementEligible = ? WHERE id = ?', [gpa, gpa >= 8.0 ? 1 : 0, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Faculty API ---
app.get('/api/faculty', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM faculty');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/faculty', async (req, res) => {
    const { id, name, photo, subjectAllocated, salary } = req.body;
    try {
        await run(
            'INSERT INTO faculty (id, name, photo, subjectAllocated, salary) VALUES (?, ?, ?, ?, ?)',
            [id, name, photo, subjectAllocated, salary || '₹75,000/mo']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Courses API ---
app.get('/api/courses', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM courses');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/courses', async (req, res) => {
    const { code, name, duration, facultyId, subjects } = req.body;
    try {
        await run(
            'INSERT INTO courses (code, name, duration, facultyId, subjects, studentsEnrolled) VALUES (?, ?, ?, ?, ?, ?)',
            [code, name, duration, facultyId, Array.isArray(subjects) ? subjects.join(', ') : subjects, 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Notices API ---
app.get('/api/notices', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM notices ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notices', async (req, res) => {
    const { id, title, category, urgency, date, content } = req.body;
    try {
        await run(
            'INSERT INTO notices (id, title, category, urgency, date, content) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, category, urgency, date, content]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Calendar API ---
app.get('/api/calendar', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM calendar_events ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/calendar', async (req, res) => {
    const { date, title, type } = req.body;
    try {
        await run(
            'INSERT INTO calendar_events (date, title, type) VALUES (?, ?, ?)',
            [date, title, type]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Library API ---
app.get('/api/library', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM library_books');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/library', async (req, res) => {
    const { isbn, title, author, available, location } = req.body;
    try {
        await run(
            'INSERT INTO library_books (isbn, title, author, available, location) VALUES (?, ?, ?, ?, ?)',
            [isbn, title, author, available, location]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/library/issue', async (req, res) => {
    const { isbn } = req.body;
    try {
        await run('UPDATE library_books SET available = available - 1 WHERE isbn = ? AND available > 0', [isbn]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Scholarships API ---
app.get('/api/scholarships', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM scholarships');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/scholarships', async (req, res) => {
    const { studentId, name, cgpaRequired } = req.body;
    try {
        await run(
            'INSERT INTO scholarships (studentId, name, cgpaRequired, status) VALUES (?, ?, ?, ?)',
            [studentId, name, cgpaRequired, 'Pending']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/scholarships/review', async (req, res) => {
    const { studentId, status } = req.body;
    try {
        await run('UPDATE scholarships SET status = ? WHERE studentId = ?', [status, studentId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Placement Drives API ---
app.get('/api/placements', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM placement_drives ORDER BY date ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/placements', async (req, res) => {
    const { company, role, minCgpa, package, date } = req.body;
    try {
        await run(
            'INSERT INTO placement_drives (company, role, minCgpa, package, date, registered, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [company, role, minCgpa, package, date, 0, 'Upcoming']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/placements/register', async (req, res) => {
    const { company } = req.body;
    try {
        await run('UPDATE placement_drives SET registered = registered + 1 WHERE company = ?', [company]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Fees API ---
app.get('/api/fees', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM fees');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/fees', async (req, res) => {
    const { refNo, studentId, term, amount, dueDate, status } = req.body;
    try {
        await run(
            'INSERT INTO fees (refNo, studentId, term, amount, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)',
            [refNo, studentId, term, amount, dueDate, status || 'Pending']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/fees/pay', async (req, res) => {
    const { refNo } = req.body;
    try {
        await run('UPDATE fees SET status = "Paid" WHERE refNo = ?', [refNo]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Exams API ---
app.get('/api/exams', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM exams');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/exams', async (req, res) => {
    const { code, subject, type, date, duration, room } = req.body;
    try {
        await run(
            'INSERT INTO exams (code, subject, type, date, duration, room) VALUES (?, ?, ?, ?, ?, ?)',
            [code, subject, type, date, duration, room]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Grades API ---
app.get('/api/grades', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM grades');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/grades', async (req, res) => {
    const { studentId, examType, marks, grade } = req.body;
    try {
        await run(
            'INSERT INTO grades (studentId, examType, marks, grade) VALUES (?, ?, ?, ?) ON CONFLICT(studentId, examType) DO UPDATE SET marks = excluded.marks, grade = excluded.grade',
            [studentId, examType, marks, grade]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
