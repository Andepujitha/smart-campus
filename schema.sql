-- ==========================================
-- Smart Campus Schema & Seed Data Script
-- Run this script inside MySQL Workbench
-- ==========================================

CREATE DATABASE IF NOT EXISTS smart_campus;
USE smart_campus;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    attendance DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    parent VARCHAR(100) NOT NULL,
    parentPhone VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    photo TEXT NOT NULL,
    aadhaar VARCHAR(50) NOT NULL DEFAULT 'Pending Upload',
    certs VARCHAR(50) NOT NULL DEFAULT 'Pending Upload',
    scholarship VARCHAR(50) NOT NULL DEFAULT 'Ineligible',
    placementEligible BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    photo TEXT NOT NULL,
    subjectAllocated VARCHAR(150) NOT NULL,
    attendance DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    salary VARCHAR(50) NOT NULL DEFAULT '₹75,000/mo'
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    facultyId VARCHAR(50) NOT NULL,
    subjects TEXT NOT NULL, -- Stored as comma-separated values
    studentsEnrolled INT NOT NULL DEFAULT 0,
    FOREIGN KEY (facultyId) REFERENCES faculty(id) ON DELETE CASCADE
);

-- 4. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL
);

-- 5. Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- 6. Library Books Table
CREATE TABLE IF NOT EXISTS library_books (
    isbn VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    available INT NOT NULL DEFAULT 0,
    location VARCHAR(50) NOT NULL
);

-- 7. Scholarships Table
CREATE TABLE IF NOT EXISTS scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    cgpaRequired DECIMAL(3,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Placement Drives Table
CREATE TABLE IF NOT EXISTS placement_drives (
    company VARCHAR(100) PRIMARY KEY,
    role VARCHAR(100) NOT NULL,
    minCgpa DECIMAL(3,2) NOT NULL,
    package VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    registered INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Upcoming'
);

-- 9. Fees Table
CREATE TABLE IF NOT EXISTS fees (
    refNo VARCHAR(50) PRIMARY KEY,
    studentId VARCHAR(50) NOT NULL,
    term VARCHAR(150) NOT NULL,
    amount INT NOT NULL,
    dueDate DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);

-- 10. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    code VARCHAR(50) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date VARCHAR(100) NOT NULL, -- Date and time string e.g. "2026-08-10 10:00 AM"
    duration VARCHAR(50) NOT NULL,
    room VARCHAR(50) NOT NULL,
    PRIMARY KEY (code, type)
);

-- 11. Grades Table
CREATE TABLE IF NOT EXISTS grades (
    studentId VARCHAR(50) NOT NULL,
    examType VARCHAR(50) NOT NULL,
    marks INT NOT NULL DEFAULT 0,
    grade VARCHAR(50) NOT NULL DEFAULT 'F',
    PRIMARY KEY (studentId, examType),
    FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);


-- ==========================================
-- Insert Localized Indian Seed Data
-- ==========================================

-- Standard Local SVG Avatars
SET @student_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232bbfa3'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";
SET @faculty_avatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";

-- Seed Faculty
INSERT INTO faculty (id, name, photo, subjectAllocated, attendance, salary) VALUES
('FAC-101', 'Dr. Ramesh Prasad', @faculty_avatar, 'Data Structures & Algorithms', 96.50, '₹85,000/mo'),
('FAC-102', 'Prof. S. N. Bose', @faculty_avatar, 'Artificial Intelligence & Neural Nets', 99.10, '₹92,000/mo'),
('FAC-103', 'Dr. APJ Kalam', @faculty_avatar, 'Microprocessors & Embedded Design', 98.40, '₹1,20,000/mo'),
('FAC-104', 'Prof. C. V. Raman', @faculty_avatar, 'Fluid Dynamics & Thermals', 92.30, '₹88,000/mo');

-- Seed Students
INSERT INTO students (id, name, dept, cgpa, attendance, parent, parentPhone, email, photo, aadhaar, certs, scholarship, placementEligible) VALUES
('SC-2026-CSE01', 'Aarav Sharma', 'Computer Science Eng', 9.10, 94.20, 'Rajesh Sharma', '+91 98765 43210', 'aarav.s@campus.edu', @student_avatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Eligible', TRUE),
('SC-2026-CSE02', 'Kavya Patel', 'Computer Science Eng', 8.80, 71.50, 'Sanjay Patel', '+91 98234 56789', 'kavya.p@campus.edu', @student_avatar, 'Uploaded & Verified', 'Pending Verification', 'Applied', TRUE),
('SC-2026-ECE05', 'Ananya Rao', 'Electronics & Comm', 6.40, 62.10, 'Kalyan Rao', '+91 97654 32109', 'ananya.r@campus.edu', @student_avatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Ineligible', FALSE),
('SC-2026-ME09', 'Vikram Singh', 'Mechanical Eng', 7.90, 88.00, 'Harbhajan Singh', '+91 99123 45678', 'vikram.s@campus.edu', @student_avatar, 'Pending Upload', 'Pending Upload', 'Ineligible', TRUE),
('SC-2026-CSE12', 'Rohan Das', 'Computer Science Eng', 9.60, 98.40, 'Sujata Das', '+91 91234 56789', 'rohan.d@campus.edu', @student_avatar, 'Uploaded & Verified', 'Uploaded & Verified', 'Approved', TRUE);

-- Seed Courses
INSERT INTO courses (code, name, duration, facultyId, subjects, studentsEnrolled) VALUES
('CS-101', 'Data Structures & Algorithms', '1 Semester', 'FAC-101', 'Arrays & Linked Lists, Trees & Graphs, Hashing & Search Algorithms, Sorting Strategies', 42),
('CS-202', 'Artificial Intelligence & Neural Nets', '1 Semester', 'FAC-102', 'Supervised Learning, Deep Networks, Reinforcement Models, Natural Language Processing', 38),
('EC-305', 'Microprocessors & Embedded Design', '1 Semester', 'FAC-103', '8085/8086 Architecture, Assembly Language, Peripheral Interfacing, IoT Protocols', 30),
('ME-410', 'Fluid Dynamics & Thermals', '1 Semester', 'FAC-104', 'Bernoulli''s Principles, Turbulent Flows, Heat Transfer Coefficients, Entropy Cycles', 25);

-- Seed Notices
INSERT INTO notices (id, title, category, urgency, date, content) VALUES
('NOT-001', 'Semester End Theoretical Exams Schedule', 'exam', 'critical', '2026-07-04', 'The formal Semester End Exams for all streams (CSE, ECE, ME) will start on August 10, 2026. Detailed schedules, session allocations, and syllabus cutoffs are posted. Clear all pending fees before July 20 to download official hall tickets.'),
('NOT-002', 'Independence Day Recess Declaration', 'holiday', 'normal', '2026-07-02', 'The Campus will remain closed on August 15, 2026, in observance of Independence Day. The national flag hoisting ceremony will start at 08:30 AM in the central courtyard. Attendance is compulsory for hostel residents.'),
('NOT-003', 'Infosys Campus Recruitment Drive', 'placement', 'high', '2026-07-01', 'Infosys recruitment managers will hold a campus drive on August 20 for Specialist Programmer and Systems Engineer roles. Minimum eligibility criterion: 8.0 CGPA with zero active backlogs. Register via placement module before August 10.');

-- Seed Calendar Events
INSERT INTO calendar_events (date, title, type) VALUES
('2026-07-05', 'Term Fees Collection Deadline', 'event'),
('2026-08-15', 'Independence Day Celebration', 'holiday'),
('2026-09-05', 'Teachers Day Event', 'event'),
('2026-08-20', 'Infosys Campus Drive', 'event'),
('2026-08-10', 'Semester End Exams Start', 'exam'),
('2026-10-02', 'Gandhi Jayanti', 'holiday');

-- Seed Library Books
INSERT INTO library_books (isbn, title, author, available, location) VALUES
('978-0131103627', 'The C Programming Language', 'Kernighan & Ritchie', 14, 'Shelf A-4'),
('978-0262033848', 'Introduction to Algorithms (CLRS)', 'Cormen et al.', 8, 'Shelf A-7'),
('978-0136042594', 'Artificial Intelligence: A Modern Approach', 'Russell & Norvig', 0, 'Shelf B-2'),
('978-0071390446', 'Fluid Mechanics Fundamentals', 'Cengel & Cimbala', 5, 'Shelf C-1');

-- Seed Scholarships
INSERT INTO scholarships (studentId, name, cgpaRequired, status) VALUES
('SC-2026-CSE01', 'National Merit Scholarship (MHRD)', 9.00, 'Approved'),
('SC-2026-CSE02', 'State Technical Aid Scheme', 8.00, 'Pending'),
('SC-2026-ECE05', 'Pragati Scholarship for Girls', 7.50, 'Rejected'),
('SC-2026-CSE12', 'National Merit Scholarship (MHRD)', 9.00, 'Approved');

-- Seed Placement Drives
INSERT INTO placement_drives (company, role, minCgpa, package, date, registered, status) VALUES
('Infosys', 'Specialist Programmer', 8.00, '₹9,50,000/yr', '2026-08-20', 4, 'Upcoming'),
('TCS', 'Digital Systems Engineer', 7.00, '₹7,00,000/yr', '2026-08-28', 2, 'Upcoming'),
('Wipro', 'Project Engineer', 6.50, '₹4,50,000/yr', '2026-09-02', 1, 'Active');

-- Seed Fees
INSERT INTO fees (refNo, studentId, term, amount, dueDate, status) VALUES
('TXN-8809', 'SC-2026-CSE01', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Paid'),
('TXN-8810', 'SC-2026-CSE02', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Pending'),
('TXN-8811', 'SC-2026-ECE05', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Paid'),
('TXN-8812', 'SC-2026-ME09', 'Semester 3 Tuition Fee', 45000, '2026-07-05', 'Pending'),
('TXN-8813', 'SC-2026-CSE12', 'Semester 3 Tuition & Labs', 52000, '2026-07-05', 'Paid');

-- Seed Exams
INSERT INTO exams (code, subject, type, date, duration, room) VALUES
('CS-101', 'Data Structures & Algorithms', 'Mid-Term', '2026-08-10 10:00 AM', '2 Hours', 'Exam Hall B'),
('CS-202', 'Artificial Intelligence & Neural Nets', 'Mid-Term', '2026-08-12 02:00 PM', '2 Hours', 'Exam Hall A'),
('EC-305', 'Microprocessors & Embedded Design', 'Mid-Term', '2026-08-10 02:00 PM', '2 Hours', 'Lab Room 102');

-- Seed Grades
INSERT INTO grades (studentId, examType, marks, grade) VALUES
('SC-2026-CSE01', 'Mid-Term', 92, 'A+'),
('SC-2026-CSE02', 'Mid-Term', 84, 'A'),
('SC-2026-ECE05', 'Mid-Term', 56, 'C'),
('SC-2026-ME09', 'Mid-Term', 74, 'B'),
('SC-2026-CSE12', 'Mid-Term', 98, 'O (Outstanding)');
