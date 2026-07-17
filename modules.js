/* -------------------------------------------------------------
   Smart Campus Modules & Indian Mock Database Engine
------------------------------------------------------------- */

// Standard Local SVG Avatars
const avatars = {
    admin: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    faculty: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    student: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232bbfa3'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
    parent: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23d946ef'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>"
};

// Global Mock Database
let db = {
    students: [
        { id: "SC-2026-CSE01", name: "Aarav Sharma", dept: "Computer Science Eng", cgpa: 9.1, attendance: 94.2, parent: "Rajesh Sharma", parentPhone: "+91 98765 43210", email: "aarav.s@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Eligible", placementEligible: true },
        { id: "SC-2026-CSE02", name: "Kavya Patel", dept: "Computer Science Eng", cgpa: 8.8, attendance: 71.5, parent: "Sanjay Patel", parentPhone: "+91 98234 56789", email: "kavya.p@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Pending Verification", scholarship: "Applied", placementEligible: true },
        { id: "SC-2026-ECE05", name: "Ananya Rao", dept: "Electronics & Comm", cgpa: 6.4, attendance: 62.1, parent: "Kalyan Rao", parentPhone: "+91 97654 32109", email: "ananya.r@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Ineligible", placementEligible: false },
        { id: "SC-2026-ME09", name: "Vikram Singh", dept: "Mechanical Eng", cgpa: 7.9, attendance: 88.0, parent: "Harbhajan Singh", parentPhone: "+91 99123 45678", email: "vikram.s@campus.edu", photo: avatars.student, aadhaar: "Pending Upload", certs: "Pending Upload", scholarship: "Ineligible", placementEligible: true },
        { id: "SC-2026-CSE12", name: "Rohan Das", dept: "Computer Science Eng", cgpa: 9.6, attendance: 98.4, parent: "Sujata Das", parentPhone: "+91 91234 56789", email: "rohan.d@campus.edu", photo: avatars.student, aadhaar: "Uploaded & Verified", certs: "Uploaded & Verified", scholarship: "Approved", placementEligible: true }
    ],
    courses: [
        { code: "CS-101", name: "Data Structures & Algorithms", duration: "1 Semester", facultyId: "FAC-101", subjects: ["Arrays & Linked Lists", "Trees & Graphs", "Hashing & Search Algorithms", "Sorting Strategies"], studentsEnrolled: 42 },
        { code: "CS-202", name: "Artificial Intelligence & Neural Nets", duration: "1 Semester", facultyId: "FAC-102", subjects: ["Supervised Learning", "Deep Networks", "Reinforcement Models", "Natural Language Processing"], studentsEnrolled: 38 },
        { code: "EC-305", name: "Microprocessors & Embedded Design", duration: "1 Semester", facultyId: "FAC-103", subjects: ["8085/8086 Architecture", "Assembly Language", "Peripheral Interfacing", "IoT Protocols"], studentsEnrolled: 30 },
        { code: "ME-410", name: "Fluid Dynamics & Thermals", duration: "1 Semester", facultyId: "FAC-104", subjects: ["Bernoulli's Principles", "Turbulent Flows", "Heat Transfer Coefficients", "Entropy Cycles"], studentsEnrolled: 25 }
    ],
    faculty: [
        { id: "FAC-101", name: "Dr. Ramesh Prasad", photo: avatars.faculty, subjectAllocated: "Data Structures & Algorithms", attendance: 96.5, salary: "₹85,000/mo" },
        { id: "FAC-102", name: "Prof. S. N. Bose", photo: avatars.faculty, subjectAllocated: "Artificial Intelligence & Neural Nets", attendance: 99.1, salary: "₹92,000/mo" },
        { id: "FAC-103", name: "Dr. APJ Kalam", photo: avatars.faculty, subjectAllocated: "Microprocessors & Embedded Design", attendance: 98.4, salary: "₹1,20,000/mo" },
        { id: "FAC-104", name: "Prof. C. V. Raman", photo: avatars.faculty, subjectAllocated: "Fluid Dynamics & Thermals", attendance: 92.3, salary: "₹88,000/mo" }
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

// CHART CONFIGURATIONS (MODULE 1)
let admissionsChartObj = null;
let performanceChartObj = null;

function initCharts() {
    // 1. Monthly Admissions Chart
    const ctx1 = document.getElementById('admissionsChart');
    if (ctx1) {
        if (admissionsChartObj) admissionsChartObj.destroy();
        admissionsChartObj = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Admissions Logged',
                    data: [120, 150, 180, 220, 290, 340, 120],
                    backgroundColor: 'rgba(250, 85, 65, 0.45)',
                    borderColor: 'rgb(250, 85, 65)',
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 2. Grade Distribution / Placement odds Chart
    const ctx2 = document.getElementById('performanceChart');
    if (ctx2) {
        if (performanceChartObj) performanceChartObj.destroy();
        performanceChartObj = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['CSE', 'ECE', 'ME', 'EEE', 'CIVIL'],
                datasets: [
                    {
                        label: 'Average CGPA',
                        data: [8.8, 7.2, 7.6, 6.9, 7.0],
                        borderColor: '#fa5541',
                        backgroundColor: 'rgba(250, 85, 65, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Placement %',
                        data: [92, 74, 80, 68, 62],
                        borderColor: '#2bbfa3',
                        backgroundColor: 'rgba(43, 191, 163, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans' } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

// AI ENGINE PREDICTIONS (MODULE 19)
function calculateAIPredictions() {
    const tableBody = document.getElementById('aiPredictionTableBody');
    const insightsContainer = document.getElementById('aiInsightsContainer');
    
    if (!tableBody || !insightsContainer) return;
    
    tableBody.innerHTML = '';
    insightsContainer.innerHTML = '';

    let riskCount = 0;

    db.students.forEach(student => {
        // AI projected GPA calculation (Mock regression heuristics)
        let projectedGpa = student.cgpa;
        if (student.attendance < 75) {
            projectedGpa = Math.max(5.0, (student.cgpa - 1.2)).toFixed(2);
        } else if (student.attendance > 90) {
            projectedGpa = Math.min(10.0, (student.cgpa + 0.2)).toFixed(2);
        } else {
            projectedGpa = student.cgpa.toFixed(2);
        }

        // Placement success probability heuristics
        let placementOdds = Math.round((student.cgpa / 10) * 100);
        if (student.attendance < 75) placementOdds -= 15;
        if (student.attendance > 95) placementOdds += 5;
        placementOdds = Math.min(100, Math.max(10, placementOdds));

        // Odds styling classes
        let progressClass = 'odds-high';
        if (placementOdds < 60) progressClass = 'odds-low';
        else if (placementOdds < 80) progressClass = 'odds-mid';

        // Academic Risk flags
        let statusDotColor = 'green';
        let statusLabel = 'Good Standing';
        let isFlagged = false;
        let flagReason = '';

        if (student.attendance < 75 && student.cgpa < 7.0) {
            statusDotColor = 'red';
            statusLabel = 'Academic Probation Risk';
            isFlagged = true;
            flagReason = 'attendance drop and low CGPA';
            riskCount++;
        } else if (student.attendance < 75) {
            statusDotColor = 'yellow';
            statusLabel = 'Attendance Alert (<75%)';
            isFlagged = true;
            flagReason = 'low attendance (under 75% threshold)';
        } else if (student.cgpa < 7.0) {
            statusDotColor = 'yellow';
            statusLabel = 'Performance Warning';
            isFlagged = true;
            flagReason = 'CGPA below placement threshold';
        }

        // 1. Inject to predictions table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <img src="${student.photo}" style="width:28px; height:28px; border-radius:50%; object-fit:cover;">
                    <strong>${student.name}</strong>
                </div>
            </td>
            <td>${student.dept}</td>
            <td>${student.cgpa}</td>
            <td>${student.attendance}%</td>
            <td><strong style="color:var(--accent-indigo);">${projectedGpa}</strong></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <span>${placementOdds}%</span>
                    <div class="odds-bar"><div class="odds-progress ${progressClass}" style="width:${placementOdds}%"></div></div>
                </div>
            </td>
            <td>
                <span class="status-indicator">
                    <span class="status-dot ${statusDotColor}"></span> ${statusLabel}
                </span>
            </td>
        `;
        tableBody.appendChild(row);

        // 2. Inject Risk & Recommendations (Heuristics)
        if (isFlagged) {
            const card = document.createElement('div');
            card.className = `insight-card ${statusDotColor === 'red' ? 'danger' : 'warning'}`;
            
            let suggestion = '';
            let actionCourse = '';
            if (statusDotColor === 'red') {
                suggestion = 'Mandatory mentoring, review academic support structures immediately.';
                actionCourse = 'Course Recommendation: CS-101 Bridge Syllabus';
            } else if (student.attendance < 75) {
                suggestion = 'Generate automated warning notice. Direct QR checkin monitoring.';
                actionCourse = 'Recommended Elective: Dynamic Time Management';
            } else {
                suggestion = 'Include in active placement prep workshops, assign faculty tutor.';
                actionCourse = 'Recommended Elective: Advanced Algo & Mock Interviews';
            }

            card.innerHTML = `
                <div class="insight-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="insight-content">
                    <h4>${student.name} - Risk Flagged</h4>
                    <p><strong>Reason:</strong> Flagged due to ${flagReason}. Projected CGPA dropped to ${projectedGpa}.</p>
                    <p class="mt-3"><strong>AI Action:</strong> ${suggestion}</p>
                    <small style="color:var(--accent-teal); font-weight:600; display:block; margin-top:4px;"><i class="fa-solid fa-wand-magic-sparkles"></i> ${actionCourse}</small>
                </div>
            `;
            insightsContainer.appendChild(card);
        }
    });

    // General recommendation
    const generalCard = document.createElement('div');
    generalCard.className = 'insight-card info';
    generalCard.innerHTML = `
        <div class="insight-icon"><i class="fa-solid fa-circle-info"></i></div>
        <div class="insight-content">
            <h4>AI Course Allocator Tip</h4>
            <p>Placement trends show strong demand in cloud computing/neural nets. Recommend allocating <strong>Prof. S. N. Bose</strong> to direct additional seminars for CSE batch students.</p>
        </div>
    `;
    insightsContainer.appendChild(generalCard);
}

// QR CODE GENERATOR (MODULE 16 & 17)
function generateQRCodeElement(elementId, text) {
    const holder = document.getElementById(elementId);
    if (!holder) return;
    holder.innerHTML = '';
    
    if (typeof QRCode !== 'undefined') {
        try {
            new QRCode(holder, {
                text: text,
                width: 140,
                height: 140,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            return;
        } catch (e) {
            console.warn("QRCode.js failed to draw, using custom canvas fallback");
        }
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 140, 140);
    ctx.fillStyle = '#000000';
    
    const drawFinder = (x, y) => {
        ctx.fillRect(x, y, 40, 40);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 5, 30, 30);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 10, y + 10, 20, 20);
    };
    
    drawFinder(10, 10);
    drawFinder(90, 10);
    drawFinder(10, 90);
    
    ctx.fillRect(100, 100, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(102, 102, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(104, 104, 2, 2);
    
    let seed = 0;
    for (let char of text) {
        seed += char.charCodeAt(0);
    }
    
    const randomSeed = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
    
    for (let x = 0; x < 28; x++) {
        for (let y = 0; y < 28; y++) {
            if ((x < 10 && y < 10) || (x > 17 && y < 10) || (x < 10 && y > 17)) continue;
            if (randomSeed() > 0.5) {
                ctx.fillRect(10 + (x * 4.2), 10 + (y * 4.2), 4, 4);
            }
        }
    }
    
    holder.appendChild(canvas);
}

// WEBCAM SCANNER CONTROLS (MODULE 16)
let webStream = null;
function toggleWebcam(videoElementId, fallbackElementId, logBoxId, onScanSuccess) {
    const video = document.getElementById(videoElementId);
    const fallback = document.getElementById(fallbackElementId);
    const logBox = document.getElementById(logBoxId);
    
    if (!video) return;

    if (webStream) {
        webStream.getTracks().forEach(track => track.stop());
        webStream = null;
        video.classList.add('hidden');
        fallback.classList.remove('hidden');
        if (logBox) logBox.innerHTML = '<small class="text-muted">Webcam Scanner stopped.</small>';
        return false;
    } else {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                webStream = stream;
                video.srcObject = stream;
                video.classList.remove('hidden');
                fallback.classList.add('hidden');
                if (logBox) logBox.innerHTML = '<small class="text-teal"><i class="fa-solid fa-circle-check"></i> Camera online. Scan scanning markers...</small>';
                
                setTimeout(() => {
                    if (webStream) {
                        simulateScan(onScanSuccess);
                    }
                }, 4000);
            })
            .catch(err => {
                console.error("Camera access failed:", err);
                if (logBox) logBox.innerHTML = '<small style="color:var(--accent-pink)"><i class="fa-solid fa-circle-exclamation"></i> Camera Access Denied. Use Simulator option.</small>';
            });
        return true;
    }
}

function simulateScan(onScanSuccess) {
    const randomIndex = Math.floor(Math.random() * db.students.length);
    const student = db.students[randomIndex];
    if (onScanSuccess) {
        onScanSuccess(student);
    }
}

// AI CHATBOT RESPONSE ENGINE (MODULE 11)
function getChatbotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('admission') || msg.includes('apply')) {
        return "Admissions for academic batch 2026 are open. Requirements: 12th Standard Transcripts, JEE Mains/State score cards, and general engineering check. Review details in the <strong>Student Profile Module</strong>.";
    }
    
    if (msg.includes('fee') || msg.includes('payment') || msg.includes('pending')) {
        return "Tuition fees for the current semester is ₹45,000 due on July 5, 2026. You can review pending balances, view receipt history, or pay via mock UPI gateway in the <strong>Fee Management Panel</strong>.";
    }
    
    if (msg.includes('library') || msg.includes('book') || msg.includes('isbn')) {
        return "The library catalog currently tracks key books (CLRS Algorithms, Russell & Norvig AI, fluid dynamics). Search titles or process book checkout logs in the <strong>Library System Tab</strong>. Normal borrowing duration is 14 days.";
    }
    
    if (msg.includes('placement') || msg.includes('jobs') || msg.includes('eligibility')) {
        return "Eligible students must maintain CGPA above 8.0 with zero active backlogs to sit for top drives like Infosys or TCS. Open placement cards in the <strong>Placement Portal</strong> for schedules.";
    }
    
    if (msg.includes('exam') || msg.includes('grade') || msg.includes('marks')) {
        return "Mid-Term grade registers are live. In the <strong>Examinations Panel</strong>, students can view marks cards and administrators can generate official PDF hall tickets.";
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Namaste! I am the Smart Campus AI Companion. Ask me about course syllabi, library availability, placement drives, fee schedules, or calendar dates.";
    }

    return "I appreciate your query! As your AI Companion, I recommend reviewing the main modules inside the sidebar. For registration details, open the <strong>Student Profile Module</strong>, or inspect live grade trends on the <strong>Analytics Dashboard</strong>.";
}

// Load saved database state from localStorage if it exists (for offline persistence)
const savedDb = localStorage.getItem('smart_campus_db');
if (savedDb) {
    try {
        db = JSON.parse(savedDb);
        console.log("📁 Loaded persisted database from browser LocalStorage!");
    } catch (e) {
        console.error("Error loading localStorage DB", e);
    }
}
