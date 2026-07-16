/* -------------------------------------------------------------
   Smart Campus Application Controller
   Core: Authentication, Tab Routing, State Binding, Form actions, RBAC,
         Offline LocalStorage Persistence Mode (No Database Connection Required)
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Current Active States
    let currentRole = "Admin";
    let activeStudent = db.students[0]; // Aarav Sharma
    let activeFaculty = db.faculty[0]; // Ande Pujitha
    let currentCalendarDate = new Date(2026, 6, 1); // July 2026

    // Authentication Bindings (Module 15)
    const loginForm = document.getElementById('loginForm');
    const loginOverlay = document.getElementById('loginOverlay');
    const mainAppWrapper = document.getElementById('mainAppWrapper');
    const loginErrorMsg = document.getElementById('loginErrorMessage');
    const logoutBtn = document.getElementById('appLogoutBtn');

    // Helper to persist database changes offline
    function saveToLocalStorage() {
        localStorage.setItem('smart_campus_db', JSON.stringify(db));
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('loginRole').value;
            const u = document.getElementById('loginUsername').value.trim();
            const p = document.getElementById('loginPassword').value.trim();

            // Validate Credentials Matrix
            let isValid = false;
            if (role === 'Admin' && u === 'admin' && p === 'admin123') {
                isValid = true;
            } else if (role === 'Faculty' && u === 'faculty' && p === 'faculty123') {
                isValid = true;
            } else if (role === 'Student') {
                if (u === 'student' && p === 'student123') {
                    activeStudent = db.students[0];
                    isValid = true;
                } else {
                    const std = db.students.find(s => s.id.toLowerCase() === u.toLowerCase());
                    if (std && p === 'student123') {
                        activeStudent = std;
                        isValid = true;
                    }
                }
            } else if (role === 'Parent') {
                if (u === 'parent' && p === 'parent123') {
                    activeStudent = db.students[0];
                    isValid = true;
                } else {
                    const std = db.students.find(s => s.id.toLowerCase() === u.toLowerCase());
                    if (std && p === 'parent123') {
                        activeStudent = std;
                        isValid = true;
                    }
                }
            }

            if (isValid) {
                currentRole = role;
                loginErrorMsg.classList.add('hidden');
                
                // Animate overlay slider
                loginOverlay.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s';
                loginOverlay.style.opacity = '0';
                loginOverlay.style.transform = 'translateY(-20px)';

                setTimeout(() => {
                    loginOverlay.classList.add('hidden');
                    mainAppWrapper.classList.remove('hidden');
                    
                    // Trigger active profile binds based on login
                    // activeStudent is already set during credentials check
                    
                    updateRBACLayout();
                    initRouter();
                    renderAllViews();
                    initClock();

                    // Re-render dashboard charts
                    setTimeout(() => {
                        initCharts();
                        calculateAIPredictions();
                    }, 50);

                    showToast("Authentication Approved", `Welcome back to the portal. Logged in as ${currentRole}.`, "sms");
                }, 400);
            } else {
                loginErrorMsg.classList.remove('hidden');
                // Haptic feedback shake on login card
                const card = document.querySelector('.login-card-glass');
                if (card) {
                    card.style.animation = 'shake 0.3s';
                    setTimeout(() => card.style.animation = '', 300);
                }
            }
        });
    }

    // Logout controller
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Return UI to login screen
            mainAppWrapper.classList.add('hidden');
            loginOverlay.classList.remove('hidden');
            loginOverlay.style.opacity = '1';
            loginOverlay.style.transform = 'translateY(0)';
            
            // Reset form fields
            loginForm.reset();
            loginErrorMsg.classList.add('hidden');
            
            showToast("Logged Out", "Secured logout complete. Terminal session closed.", "sms");
        });
    }

    // 1. DYNAMIC ROUTER & NAVIGATION
    function initRouter() {
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        const panels = document.querySelectorAll('.tab-panel');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute('data-tab');
                
                // Update active state in sidebar
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Switch panels
                panels.forEach(p => p.classList.remove('active'));
                const targetPanel = document.getElementById(`${targetTab}-panel`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // If switching to dashboard, initialize charts
                if (targetTab === 'dashboard') {
                    setTimeout(() => {
                        initCharts();
                        calculateAIPredictions();
                    }, 50);
                }
                
                // If switching to attendance scanner/generator, draw active QR
                if (targetTab === 'attendance') {
                    renderStudentQrPass();
                }

                renderAllViews();

                // Close notice editor or course forms if open
                document.getElementById('noticeFormCard')?.classList.add('hidden');
                document.getElementById('courseFormCard')?.classList.add('hidden');
            });
        });
    }

    // 2. ROLE-BASED LAYOUT UPDATES
    function updateRBACLayout() {
        // Toggle user profiles in sidebar based on roles
        const sidebarImg = document.getElementById('sidebarUserImg');
        const sidebarName = document.getElementById('sidebarUserName');
        const sidebarRole = document.getElementById('sidebarUserRole');
        const headerRoleDisplay = document.getElementById('headerRoleLabelDisplay');

        if (headerRoleDisplay) {
            headerRoleDisplay.textContent = currentRole;
        }

        // Apply visual updates to user banner
        sidebarRole.className = 'user-role'; // reset
        if (currentRole === "Admin") {
            sidebarImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";
            sidebarName.textContent = "Ande Pujitha";
            sidebarRole.textContent = "Administrator";
            sidebarRole.classList.add('badge-admin');
        } else if (currentRole === "Faculty" && activeFaculty) {
            sidebarImg.src = activeFaculty.photo; 
            sidebarName.textContent = activeFaculty.name;
            sidebarRole.textContent = "Senior Faculty";
            sidebarRole.classList.add('badge-faculty');
        } else if (currentRole === "Student" && activeStudent) {
            sidebarImg.src = activeStudent.photo;
            sidebarName.textContent = activeStudent.name;
            sidebarRole.textContent = `Student (${activeStudent.id})`;
            sidebarRole.classList.add('badge-student');
        } else if (currentRole === "Parent") {
            sidebarImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23d946ef'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>";
            if (activeStudent) {
                sidebarName.textContent = activeStudent.parent;
                sidebarRole.textContent = `Parent (${activeStudent.name})`;
            } else {
                sidebarName.textContent = "Rajesh Sharma";
                sidebarRole.textContent = "Parent (Aarav Sharma)";
            }
            sidebarRole.classList.add('badge-parent');
        }

        // Apply HTML accessibility bounds via data-rbac rules
        const rbacElements = document.querySelectorAll('[data-rbac]');
        rbacElements.forEach(el => {
            const allowedRoles = el.getAttribute('data-rbac').split(',');
            if (allowedRoles.includes(currentRole)) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    // 3. CLOCK & WIDGET TIME
    function initClock() {
        const timeDisplay = document.getElementById('currentTimeDisplay');
        const updateTime = () => {
            const now = new Date();
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const dayName = days[now.getDay()];
            const monthName = months[now.getMonth()];
            const dayNum = now.getDate();

            if (timeDisplay) {
                timeDisplay.innerHTML = `<i class="fa-solid fa-clock"></i> ${hours}:${minutes} - ${dayName}, ${monthName} ${dayNum}`;
            }
        };
        updateTime();
        setInterval(updateTime, 60000);
    }

    // 4. RENDERING VIEWS & POPULATION
    function renderAllViews() {
        renderNotices();
        renderAcademicCalendar();
        renderStudentsList();
        renderFacultyList();
        renderCourses();
        renderAttendanceModule();
        renderExaminations();
        renderFeeModule();
        renderLibraryModule();
        renderScholarships();
        renderPlacements();
        renderReportsModule();
    }

    // MODULE 8: NOTICE BOARD
    function renderNotices() {
        const feed = document.getElementById('noticeFeedContainer');
        if (!feed) return;
        feed.innerHTML = '';

        db.notices.forEach(notice => {
            const card = document.createElement('div');
            card.className = 'feed-card';
            card.innerHTML = `
                <div class="feed-card-header">
                    <div class="feed-card-meta">
                        <span class="badge"><i class="fa-solid fa-tag"></i> ${notice.category.toUpperCase()}</span>
                        <span><i class="fa-solid fa-calendar"></i> ${notice.date}</span>
                    </div>
                    <span class="urgency-badge urgency-${notice.urgency}">${notice.urgency}</span>
                </div>
                <h3 class="feed-card-title">${notice.title}</h3>
                <p class="feed-card-body">${notice.content}</p>
                <div class="feed-card-footer admin-only-action" data-rbac="Admin">
                    <button class="btn btn-sm btn-danger" onclick="deleteNotice('${notice.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            `;
            feed.appendChild(card);
        });
        updateRBACLayout();
    }

    // Delete Notice Handler
    window.deleteNotice = (id) => {
        const idx = db.notices.findIndex(n => n.id === id);
        if (idx > -1) {
            db.notices.splice(idx, 1);
            showToast("Notice Deleted", "Notice announcement removed from the public feed.", "sms");
            saveToLocalStorage();
        }
        renderNotices();
    };

    // Notice Form triggers
    document.getElementById('openNewNoticeBtn')?.addEventListener('click', () => {
        document.getElementById('noticeFormCard')?.classList.remove('hidden');
    });
    document.getElementById('closeNoticeFormBtn')?.addEventListener('click', () => {
        document.getElementById('noticeFormCard')?.classList.add('hidden');
    });

    document.getElementById('noticeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('noticeTitle').value;
        const category = document.getElementById('noticeCategory').value;
        const urgency = document.getElementById('noticeUrgency').value;
        const content = document.getElementById('noticeContent').value;
        const dateStr = new Date().toISOString().split('T')[0];

        const newNotice = {
            id: `NOT-00${db.notices.length + 1}`,
            title,
            category,
            urgency,
            date: dateStr,
            content
        };

        db.notices.unshift(newNotice);
        showToast("📢 Notice Published", `New circular titled "${title}" published instantly. SMS alerts pushed.`, "email");
        saveToLocalStorage();

        document.getElementById('noticeForm').reset();
        document.getElementById('noticeFormCard').classList.add('hidden');
        renderNotices();
    });

    // MODULE 12: ACADEMIC CALENDAR
    function renderAcademicCalendar() {
        const daysContainer = document.getElementById('calendarDays');
        const monthTitle = document.getElementById('calendarMonthTitle');
        const eventsList = document.getElementById('calendarEventsList');
        if (!daysContainer || !monthTitle || !eventsList) return;

        daysContainer.innerHTML = '';
        eventsList.innerHTML = '';

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthTitle.textContent = `${monthNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysContainer.appendChild(emptyDay);
        }

        for (let d = 1; d <= numDays; d++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            dayElement.innerHTML = `<span>${d}</span>`;
            
            if (d === 5 && month === 6) { // July 5 today
                dayElement.classList.add('today');
            }

            const dayEvent = db.calendarEvents.find(e => e.date === dateStr);
            if (dayEvent) {
                const dot = document.createElement('span');
                dot.className = `day-event-dot dot-${dayEvent.type}`;
                dayElement.appendChild(dot);
                
                dayElement.addEventListener('click', () => {
                    showToast("Calendar Highlight", `${dayEvent.title} (${dayEvent.type.toUpperCase()}) is scheduled for this day.`, "sms");
                });
            }
            daysContainer.appendChild(dayElement);
        }

        const filteredEvents = db.calendarEvents.filter(e => {
            const evDate = new Date(e.date);
            return evDate.getMonth() === month && evDate.getFullYear() === year;
        });

        filteredEvents.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'event-item';
            
            const dayNum = ev.date.split('-')[2];
            
            item.innerHTML = `
                <div class="event-date-badge ${ev.type}">
                    <span>${dayNum}</span>
                    <small>Aug</small>
                </div>
                <div class="event-item-details">
                    <h4>${ev.title}</h4>
                    <p><i class="fa-solid fa-hashtag"></i> Type: ${ev.type.toUpperCase()}</p>
                </div>
            `;
            eventsList.appendChild(item);
        });
    }

    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderAcademicCalendar();
    });
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderAcademicCalendar();
    });

    document.getElementById('addCalendarEventBtn')?.addEventListener('click', () => {
        const title = prompt("Enter event title:");
        if (!title) return;
        const date = prompt("Enter event date (YYYY-MM-DD):", "2026-08-15");
        if (!date) return;
        const type = prompt("Enter type (exam / holiday / event):", "holiday");
        if (!type) return;

        const newEvent = { date, title, type };
        db.calendarEvents.push(newEvent);
        showToast("Calendar Updated", `Successfully added "${title}" to academic timeline.`, "sms");
        saveToLocalStorage();
        renderAcademicCalendar();
    });

    // MODULE 2: STUDENT PROFILE MODULE & DIRECTORIES
    function renderStudentsList(query = '') {
        const container = document.getElementById('studentListContainer');
        if (!container) return;
        container.innerHTML = '';

        const filtered = db.students.filter(student => 
            student.name.toLowerCase().includes(query) || 
            student.id.toLowerCase().includes(query) || 
            student.dept.toLowerCase().includes(query)
        );

        filtered.forEach(student => {
            const card = document.createElement('div');
            card.className = `student-list-card ${activeStudent && activeStudent.id === student.id ? 'active' : ''}`;
            card.innerHTML = `
                <img src="${student.photo}" alt="${student.name}">
                <div class="student-list-card-details">
                    <h4>${student.name}</h4>
                    <p>${student.id} | ${student.dept}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                activeStudent = student;
                renderStudentsList(query);
                renderStudentDetails();
                renderStudentQrPass();
            });
            container.appendChild(card);
        });

        renderStudentDetails();
    }

    function renderStudentDetails() {
        const card = document.getElementById('studentDetailsCard');
        if (!card || !activeStudent) return;
        
        card.innerHTML = `
            <div class="profile-detail-header">
                <div class="profile-main-meta">
                    <img src="${activeStudent.photo}" alt="${activeStudent.name}">
                    <div>
                        <h3>${activeStudent.name}</h3>
                        <p>ID: ${activeStudent.id} | Registered Stream Student</p>
                    </div>
                </div>
                <div class="admin-only-action" data-rbac="Admin">
                    <button class="btn btn-sm btn-danger" onclick="expelStudent('${activeStudent.id}')"><i class="fa-solid fa-user-slash"></i> Expel Student</button>
                </div>
            </div>

            <div class="profile-grid-details">
                <div class="detail-block">
                    <h4>Academic Stream</h4>
                    <p>${activeStudent.dept}</p>
                </div>
                <div class="detail-block">
                    <h4>Cumulative CGPA</h4>
                    <p class="text-teal" style="font-weight: 700;">${activeStudent.cgpa} / 10.0</p>
                </div>
                <div class="detail-block">
                    <h4>Class Attendance Rate</h4>
                    <p>${activeStudent.attendance}%</p>
                </div>
                <div class="detail-block">
                    <h4>Official Email</h4>
                    <p>${activeStudent.email}</p>
                </div>
                <div class="detail-block">
                    <h4>Parent / Guardian Contact</h4>
                    <p>${activeStudent.parent} (${activeStudent.parentPhone})</p>
                </div>
                <div class="detail-block">
                    <h4>Scholarship Status</h4>
                    <p><span class="badge">${activeStudent.scholarship}</span></p>
                </div>
            </div>

            <div class="documents-upload-grid">
                <h4 style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">Identity Verification Documents</h4>
                
                <div class="document-item">
                    <div class="doc-info">
                        <i class="fa-solid fa-address-card"></i>
                        <div>
                            <h5>Aadhaar Identity Proof</h5>
                            <p id="docAadhaarStatus">${activeStudent.aadhaar}</p>
                        </div>
                    </div>
                    <div class="admin-only-action" data-rbac="Admin">
                        <button class="btn btn-sm btn-secondary" onclick="verifyDocument('${activeStudent.id}', 'aadhaar')">Toggle Verify</button>
                    </div>
                </div>

                <div class="document-item">
                    <div class="doc-info">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <div>
                            <h5>Academic Matriculation Certificates</h5>
                            <p id="docCertStatus">${activeStudent.certs}</p>
                        </div>
                    </div>
                    <div class="admin-only-action" data-rbac="Admin">
                        <button class="btn btn-sm btn-secondary" onclick="verifyDocument('${activeStudent.id}', 'certs')">Toggle Verify</button>
                    </div>
                </div>

                <div class="student-only-action mt-3" data-rbac="Student">
                    <label class="btn btn-sm btn-primary">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Upload Verification Document
                        <input type="file" style="display:none;" id="studentFileUploadSimulator">
                    </label>
                </div>
            </div>
        `;

        document.getElementById('studentFileUploadSimulator')?.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || "verification_doc.pdf";
            activeStudent.certs = `Uploaded: ${fileName} (Pending Review)`;
            showToast("Document Uploaded", `"${fileName}" successfully uploaded to secure vault. Registrar notified.`, "email");
            saveToLocalStorage();
            renderStudentDetails();
        });

        updateRBACLayout();
    }

    window.verifyDocument = (studentId, type) => {
        const student = db.students.find(s => s.id === studentId);
        if (!student) return;

        let val = '';
        if (type === 'aadhaar') {
            val = student.aadhaar === "Uploaded & Verified" ? "Pending Upload" : "Uploaded & Verified";
            student.aadhaar = val;
        } else {
            val = student.certs === "Uploaded & Verified" ? "Pending Upload" : "Uploaded & Verified";
            student.certs = val;
        }
        
        showToast("Verification Status Updated", `Updated verification for student ${student.name}.`, "sms");
        saveToLocalStorage();
        renderStudentDetails();
    };

    window.expelStudent = (id) => {
        if (!confirm("Are you sure you want to expel this student from the campus database?")) return;
        
        const idx = db.students.findIndex(s => s.id === id);
        if (idx > -1) db.students.splice(idx, 1);
        showToast("Student Removed", "Roster updated. Registrar and Parent notified.", "email");
        saveToLocalStorage();

        activeStudent = db.students[0];
        renderStudentsList();
    };

    document.getElementById('addNewStudentBtn')?.addEventListener('click', () => {
        const name = prompt("Student Full Name:");
        if (!name) return;
        const dept = prompt("Department (e.g. Computer Science Eng):", "Computer Science Eng");
        if (!dept) return;
        const cgpa = parseFloat(prompt("Baseline CGPA:", "8.0")) || 8.0;
        const attendance = parseFloat(prompt("Attendance %:", "90")) || 90;
        const parent = prompt("Parent Name:", "Robert Sharma");
        const parentPhone = prompt("Parent Contact Number:", "+91 99887 76655");

        const newStudent = {
            id: `SC-2026-CSE${String(db.students.length + 1).padStart(2, '0')}`,
            name,
            dept,
            cgpa,
            attendance,
            parent,
            parentPhone,
            email: `${name.toLowerCase().replace(' ', '.')}@campus.edu`,
            photo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%232bbfa3'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
            aadhaar: "Pending Upload",
            certs: "Pending Upload",
            scholarship: "Ineligible",
            placementEligible: cgpa >= 8.0
        };

        db.students.push(newStudent);
        showToast("Student Registered", `Identity token generated: ${newStudent.id}`, "email");
        saveToLocalStorage();
        renderStudentsList();
    });

    // MODULE 7: FACULTY MANAGEMENT
    function renderFacultyList(query = '') {
        const container = document.getElementById('facultyListContainer');
        if (!container) return;
        container.innerHTML = '';

        const filtered = db.faculty.filter(fac => 
            fac.name.toLowerCase().includes(query) || 
            fac.id.toLowerCase().includes(query) || 
            fac.subjectAllocated.toLowerCase().includes(query)
        );

        filtered.forEach(fac => {
            const card = document.createElement('div');
            card.className = `faculty-list-card ${activeFaculty && activeFaculty.id === fac.id ? 'active' : ''}`;
            card.innerHTML = `
                <img src="${fac.photo}" alt="${fac.name}">
                <div class="faculty-list-card-details">
                    <h4>${fac.name}</h4>
                    <p>${fac.id} | ${fac.subjectAllocated}</p>
                </div>
            `;
            card.addEventListener('click', () => {
                activeFaculty = fac;
                renderFacultyList(query);
                renderFacultyDetails();
            });
            container.appendChild(card);
        });

        renderFacultyDetails();
    }

    function renderFacultyDetails() {
        const card = document.getElementById('facultyDetailsContainer');
        if (!card || !activeFaculty) return;

        card.innerHTML = `
            <div class="profile-detail-header">
                <div class="profile-main-meta">
                    <img src="${activeFaculty.photo}" alt="${activeFaculty.name}">
                    <div>
                        <h3>${activeFaculty.name}</h3>
                        <p>ID: ${activeFaculty.id} | Senior Academic Staff</p>
                    </div>
                </div>
            </div>

            <div class="profile-grid-details">
                <div class="detail-block">
                    <h4>Allocated Core Subject</h4>
                    <p>${activeFaculty.subjectAllocated}</p>
                </div>
                <div class="detail-block">
                    <h4>Staff Attendance Rate</h4>
                    <p class="text-teal">${activeFaculty.attendance}%</p>
                </div>
                <div class="detail-block">
                    <h4>Salary Details (Optional)</h4>
                    <p>${activeFaculty.salary}</p>
                </div>
                <div class="detail-block">
                    <h4>Teaching Logs Status</h4>
                    <p><span class="badge">Syllabus Covered</span></p>
                </div>
            </div>

            <div class="admin-only-action mt-4" data-rbac="Admin">
                <button class="btn btn-sm btn-primary" onclick="allocateSubjectDialog()"><i class="fa-solid fa-plus"></i> Re-allocate Subject</button>
                <button class="btn btn-sm btn-secondary" onclick="simulateSalaryDisburse()"><i class="fa-solid fa-credit-card"></i> Pay Salary</button>
            </div>
        `;
        updateRBACLayout();
    }

    window.allocateSubjectDialog = () => {
        const subject = prompt("Assign new subject allocated syllabus:", activeFaculty.subjectAllocated);
        if (subject) {
            activeFaculty.subjectAllocated = subject;
            showToast("Syllabus Reallocated", `Subject updated to: ${subject}`, "email");
            saveToLocalStorage();
            renderFacultyDetails();
        }
    };

    window.simulateSalaryDisburse = () => {
        showToast("💸 Salary Disbursed", `Funds matching ${activeFaculty.salary} sent to ${activeFaculty.name}'s bank account.`, "email");
    };

    document.getElementById('addFacultyBtn')?.addEventListener('click', () => {
        const name = prompt("Enter Faculty Full Name:");
        if (!name) return;
        const subject = prompt("Primary Subject Specialization:", "Advanced Embedded Systems");
        if (!subject) return;
        const salary = prompt("Allocated Monthly Salary (Optional):", "₹80,000/mo");

        const newFaculty = {
            id: `FAC-10${db.faculty.length + 1}`,
            name,
            photo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/><path d='M50 22a15 15 0 1 0 15 15 15 15 0 0 0-15-15zm0 35c-20 0-35 10-35 22v3h70v-3c0-12-15-22-35-22z' fill='%23ffffff'/></svg>",
            subjectAllocated: subject,
            attendance: 100.0,
            salary: salary || "₹75,000/mo"
        };

        db.faculty.push(newFaculty);
        showToast("Faculty Registered", `Welcome onboard ${name}! Allocated subject: ${subject}`, "email");
        saveToLocalStorage();
        renderFacultyList();
    });

    // MODULE 6: COURSE MANAGEMENT
    function renderCourses() {
        const container = document.getElementById('coursesGridContainer');
        if (!container) return;
        container.innerHTML = '';

        db.courses.forEach((course, idx) => {
            const fac = db.faculty.find(f => f.id === course.facultyId) || { name: "Faculty", photo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23fa5541'/></svg>" };
            const colorClass = `color-${(idx % 4) + 1}`;
            
            const card = document.createElement('div');
            card.className = `course-card ${colorClass}`;
            
            let subjectTags = course.subjects.map(s => `<span class="subject-tag">${s}</span>`).join('');
            
            card.innerHTML = `
                <div class="course-card-header">
                    <div>
                        <h3>${course.code}: ${course.name}</h3>
                        <p class="course-duration"><i class="fa-solid fa-clock"></i> Duration: ${course.duration} (${course.studentsEnrolled} Students)</p>
                    </div>
                    <div class="admin-only-action" data-rbac="Admin">
                        <button class="btn-icon btn-sm" onclick="editCourseSubjects('${course.code}')"><i class="fa-solid fa-pen"></i></button>
                    </div>
                </div>
                
                <div class="course-subjects-list">
                    ${subjectTags}
                </div>

                <div class="course-faculty-link">
                    <img src="${fac.photo}" alt="${fac.name}">
                    <div>
                        <strong>${fac.name}</strong>
                        <p style="font-size:10px; color:var(--text-muted);">Course Coordinator</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        const drop1 = document.getElementById('attendanceSelectCourse');
        const drop2 = document.getElementById('marksEntryCourse');
        if (drop1 && drop2) {
            drop1.innerHTML = '';
            drop2.innerHTML = '';
            db.courses.forEach(c => {
                const opt = `<option value="${c.code}">${c.code} - ${c.name}</option>`;
                drop1.innerHTML += opt;
                drop2.innerHTML += opt;
            });
        }
        updateRBACLayout();
    }

    window.editCourseSubjects = (code) => {
        const course = db.courses.find(c => c.code === code);
        if (!course) return;
        const subjStr = prompt("Edit core subjects (comma separated):", course.subjects.join(', '));
        if (subjStr !== null) {
            const list = subjStr.split(',').map(s => s.trim());
            course.subjects = list;
            showToast("Course Syllabus Edited", `Subjects for ${code} updated successfully.`, "sms");
            saveToLocalStorage();
            renderCourses();
        }
    };

    document.getElementById('addNewCourseBtn')?.addEventListener('click', () => {
        const facSelect = document.getElementById('courseFaculty');
        if (facSelect) {
            facSelect.innerHTML = db.faculty.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
        }
        document.getElementById('courseFormCard')?.classList.remove('hidden');
    });

    document.getElementById('closeCourseFormBtn')?.addEventListener('click', () => {
        document.getElementById('courseFormCard')?.classList.add('hidden');
    });

    document.getElementById('courseForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const codeAndName = document.getElementById('courseName').value;
        const code = codeAndName.split(' ')[0] || "CS-NEW";
        const name = codeAndName.replace(code, '').trim() || "Advanced Elective";
        const durationNum = document.getElementById('courseDuration').value;
        const facultyId = document.getElementById('courseFaculty').value;
        const subjectsList = document.getElementById('courseSubjects').value.split(',').map(s => s.trim());

        const newCourse = {
            code,
            name,
            duration: `${durationNum} Semesters`,
            facultyId,
            subjects: subjectsList,
            studentsEnrolled: 0
        };

        db.courses.push(newCourse);
        showToast("Course Registered", `Created syllabus tracking card for ${code}: ${name}`, "email");
        saveToLocalStorage();

        document.getElementById('courseForm').reset();
        document.getElementById('courseFormCard').classList.add('hidden');
        renderCourses();
    });

    // MODULE 3: ATTENDANCE MANAGEMENT
    function renderAttendanceModule() {
        const courseDropdown = document.getElementById('attendanceSelectCourse');
        const dateInput = document.getElementById('attendanceDate');
        const tableBody = document.getElementById('dailyAttendanceTableBody');
        const absenteeContainer = document.getElementById('absenteeListContainer');

        if (!courseDropdown || !tableBody || !absenteeContainer) return;
        
        if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        tableBody.innerHTML = '';
        absenteeContainer.innerHTML = '';

        db.students.forEach(student => {
            const isAbsent = student.attendance < 75; 
            const statusLabel = isAbsent ? "Absent" : "Present";
            const btnClass = isAbsent ? "btn-danger" : "btn-accent";
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td><strong>${student.name}</strong></td>
                <td>
                    <span class="status-indicator">
                        <span class="status-dot ${isAbsent ? 'red' : 'green'}"></span> ${statusLabel}
                    </span>
                </td>
                <td>2026-07-05 09:30 AM</td>
                <td class="faculty-only-action admin-only-action" data-rbac="Admin,Faculty">
                    <button class="btn btn-sm ${btnClass}" onclick="toggleStudentAttendance('${student.id}')">Toggle Status</button>
                </td>
            `;
            tableBody.appendChild(row);

            if (isAbsent) {
                const absenteeItem = document.createElement('div');
                absenteeItem.className = 'absentee-item';
                absenteeItem.innerHTML = `
                    <div class="absentee-item-details">
                        <h4>${student.name}</h4>
                        <p>Parent: ${student.parentPhone}</p>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="alertParent('${student.id}')"><i class="fa-solid fa-comment-sms"></i> Alert</button>
                `;
                absenteeContainer.appendChild(absenteeItem);
            }
        });

        const monthlyReportBody = document.getElementById('monthlyAttendanceReportTable');
        if (monthlyReportBody) {
            monthlyReportBody.innerHTML = '';
            db.students.forEach(student => {
                const totalClasses = 60;
                const attended = Math.round((student.attendance / 100) * totalClasses);
                const absent = totalClasses - attended;
                const pct = parseFloat(student.attendance).toFixed(1);
                
                let alertColor = 'green';
                let alertMsg = 'Regular';
                if (pct < 75) {
                    alertColor = 'red';
                    alertMsg = 'De-bar Warning';
                } else if (pct < 85) {
                    alertColor = 'yellow';
                    alertMsg = 'Shortage Alert';
                }

                const mRow = document.createElement('tr');
                mRow.innerHTML = `
                    <td><strong>${student.name}</strong></td>
                    <td>${totalClasses}</td>
                    <td>${attended}</td>
                    <td>${absent}</td>
                    <td><strong style="color:var(--accent-${alertColor === 'green' ? 'teal' : (alertColor === 'red' ? 'pink' : 'yellow')});">${pct}%</strong></td>
                    <td>
                        <span class="status-indicator">
                            <span class="status-dot ${alertColor}"></span> ${alertMsg}
                        </span>
                    </td>
                `;
                monthlyReportBody.appendChild(mRow);
            });
        }

        updateRBACLayout();
    }

    window.toggleStudentAttendance = (id) => {
        const student = db.students.find(s => s.id === id);
        if (!student) return;
        
        student.attendance = student.attendance < 75 ? 90.5 : 68.2;
        saveToLocalStorage();
        renderAttendanceModule();
        calculateAIPredictions();
    };

    window.alertParent = (id) => {
        const student = db.students.find(s => s.id === id);
        if (!student) return;
        showToast("💬 SMS Dispatch Alert", `Sent attendance SMS warning to parent [${student.parent}] - Phone: ${student.parentPhone}`, "sms");
    };

    const subtabs = document.querySelectorAll('#attendance-panel .btn-tab');
    subtabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subtabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const subPanelId = `subpanel-${tab.getAttribute('data-subtab')}`;
            const subpanels = document.querySelectorAll('#attendance-panel .subtab-panel');
            subpanels.forEach(sp => sp.classList.remove('active'));
            
            const targetSp = document.getElementById(subPanelId);
            if (targetSp) targetSp.classList.add('active');
            
            if (tab.getAttribute('data-subtab') === 'qr-attendance') {
                renderStudentQrPass();
            }
        });
    });

    function renderStudentQrPass() {
        const qrNameEl = document.getElementById('studentQrName');
        const qrIdEl = document.getElementById('studentQrId');
        if (qrNameEl && qrIdEl && activeStudent) {
            qrNameEl.textContent = activeStudent.name;
            qrIdEl.textContent = `ID: ${activeStudent.id}`;
            generateQRCodeElement('attendanceQrCodeHolder', `SC_ATTENDANCE_${activeStudent.id}`);
        }
    }

    const toggleWebcamBtn = document.getElementById('toggleWebcamBtn');
    const simulateQrScanBtn = document.getElementById('simulateQrScanBtn');
    const scanLogBox = document.getElementById('scanLogBox');

    if (toggleWebcamBtn) {
        toggleWebcamBtn.addEventListener('click', () => {
            const isStreaming = toggleWebcam('scannerVideo', 'scannerFallback', 'scanLogBox', handleScanSuccess);
            toggleWebcamBtn.innerHTML = isStreaming ? `<i class="fa-solid fa-video-slash"></i> Stop Webcam` : `<i class="fa-solid fa-video"></i> Start Webcam`;
        });
    }

    if (simulateQrScanBtn) {
        simulateQrScanBtn.addEventListener('click', () => {
            simulateScan(handleScanSuccess);
        });
    }

    function handleScanSuccess(student) {
        if (scanLogBox) {
            const logItem = document.createElement('div');
            logItem.className = 'scan-log-item';
            logItem.innerHTML = `<span style="color:var(--accent-teal); font-weight:600;">[SCAN SUCCESS]</span> Recorded attendance for <strong>${student.name}</strong> (ID: ${student.id}) at ${new Date().toLocaleTimeString()}`;
            scanLogBox.prepend(logItem);
        }
        
        student.attendance = Math.min(100.0, student.attendance + 1.2);
        showToast("QR Verified", `Attendance logged for student ${student.name}`, "sms");
        saveToLocalStorage();
        renderAttendanceModule();
        calculateAIPredictions();
    }

    // MODULE 4: EXAMINATION MODULE
    function renderExaminations() {
        const examSubtabs = document.querySelectorAll('#exams-panel .btn-tab');
        examSubtabs.forEach(tab => {
            tab.addEventListener('click', () => {
                examSubtabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const subPanelId = `subpanel-${tab.getAttribute('data-subtab')}`;
                const subpanels = document.querySelectorAll('#exams-panel .subtab-panel');
                subpanels.forEach(sp => sp.classList.remove('active'));
                
                const targetSp = document.getElementById(subPanelId);
                if (targetSp) targetSp.classList.add('active');
                
                if (tab.getAttribute('data-subtab') === 'hall-tickets') {
                    renderHallTicketSelectionList();
                }
            });
        });

        const schedBody = document.getElementById('examScheduleTableBody');
        if (schedBody) {
            schedBody.innerHTML = '';
            db.exams.forEach(ex => {
                schedBody.innerHTML += `
                    <tr>
                        <td><strong>${ex.code}</strong></td>
                        <td>${ex.subject}</td>
                        <td><span class="badge">${ex.type}</span></td>
                        <td>${ex.date}</td>
                        <td>${ex.duration}</td>
                        <td><strong style="color:var(--accent-purple);">${ex.room}</strong></td>
                    </tr>
                `;
            });
        }

        const marksBody = document.getElementById('marksEntryTableBody');
        if (marksBody) {
            marksBody.innerHTML = '';
            db.students.forEach(student => {
                const record = db.grades.find(g => g.studentId === student.id) || { examType: 'Mid-Term', marks: 0, grade: 'F' };
                
                marksBody.innerHTML += `
                    <tr>
                        <td>${student.id}</td>
                        <td><strong>${student.name}</strong></td>
                        <td>${record.examType}</td>
                        <td>
                            <input type="number" class="form-select-sm marks-input" value="${record.marks}" 
                                style="width:70px; background:var(--bg-secondary); border:1px solid var(--border-color); color:white;"
                                data-sid="${student.id}"
                                ${currentRole !== 'Admin' && currentRole !== 'Faculty' ? 'disabled' : ''}>
                        </td>
                        <td><strong style="color:var(--accent-indigo);">${record.grade}</strong></td>
                        <td class="faculty-only-action admin-only-action" data-rbac="Admin,Faculty">
                            <button class="btn btn-sm btn-accent" onclick="saveGradeChange('${student.id}')"><i class="fa-solid fa-save"></i> Save</button>
                        </td>
                    </tr>
                `;
            });
        }
        updateRBACLayout();
    }

    window.saveGradeChange = (studentId) => {
        const input = document.querySelector(`.marks-input[data-sid="${studentId}"]`);
        if (!input) return;
        const marksVal = parseInt(input.value) || 0;
        
        let gradeVal = 'F';
        if (marksVal >= 90) gradeVal = 'O (Outstanding)';
        else if (marksVal >= 80) gradeVal = 'A+';
        else if (marksVal >= 70) gradeVal = 'A';
        else if (marksVal >= 60) gradeVal = 'B';
        else if (marksVal >= 50) gradeVal = 'C';
        
        let record = db.grades.find(g => g.studentId === studentId);
        if (!record) {
            record = { studentId, examType: 'Mid-Term', marks: marksVal, grade: gradeVal };
            db.grades.push(record);
        } else {
            record.marks = marksVal;
            record.grade = gradeVal;
        }

        showToast("Grade Locked", `Grade updated to ${gradeVal} for student: ${studentId}`, "email");
        saveToLocalStorage();
        renderExaminations();
        calculateAIPredictions();
    };

    document.getElementById('addExamScheduleBtn')?.addEventListener('click', () => {
        const code = prompt("Course Code:", "CS-202");
        if (!code) return;
        const subj = prompt("Subject Name:", "Artificial Intelligence");
        const type = prompt("Exam Type (e.g. Mid-Term / Final):", "Mid-Term");
        const date = prompt("Date & Time:", "2026-08-12 02:00 PM");
        const duration = prompt("Duration:", "2 Hours");
        const room = prompt("Room Hall:", "Exam Hall A");

        const newExam = { code, subject: subj, type, date, duration, room };
        db.exams.push(newExam);
        db.calendarEvents.push({ date: date.split(' ')[0], title: `${code} Exam`, type: 'exam' });

        showToast("📝 Exam Scheduled", `Pushed exam notification to Notice board. Calendar updated.`, "email");
        saveToLocalStorage();
        renderExaminations();
        renderAcademicCalendar();
    });

    let selectedHallTicketStudent = null;
    
    function renderHallTicketSelectionList() {
        const list = document.getElementById('hallTicketStudentList');
        const printArea = document.getElementById('hallTicketPrintArea');
        if (!list || !printArea) return;

        list.innerHTML = '';
        db.students.forEach(student => {
            const item = document.createElement('div');
            item.className = `hall-ticket-selection-item ${selectedHallTicketStudent && selectedHallTicketStudent.id === student.id ? 'active' : ''}`;
            item.textContent = `${student.name} (${student.id})`;
            item.addEventListener('click', () => {
                selectedHallTicketStudent = student;
                renderHallTicketSelectionList();
                renderHallTicketPreview();
            });
            list.appendChild(item);
        });
    }

    function renderHallTicketPreview() {
        const printArea = document.getElementById('hallTicketPrintArea');
        if (!printArea || !selectedHallTicketStudent) return;

        const unpaidFees = db.fees.some(f => f.studentId === selectedHallTicketStudent.id && f.status === 'Pending');
        
        if (unpaidFees && currentRole === 'Student') {
            printArea.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-lock text-pink" style="font-size: 54px;"></i>
                    <h3 style="color:#d946ef; margin-top:12px;">Hall Ticket Locked</h3>
                    <p style="color:#64748b; text-align:center; max-width:400px; margin-top:8px;">Your account has pending tuition dues (₹45,000). Please clear your balance in the Fee Management console to unlock examination hall tickets.</p>
                </div>
            `;
            return;
        }

        let scheduleRows = db.exams.map(ex => `
            <tr>
                <td>${ex.code}</td>
                <td>${ex.subject}</td>
                <td>${ex.date}</td>
                <td>${ex.room}</td>
                <td>Faculty Sign</td>
            </tr>
        `).join('');

        printArea.innerHTML = `
            <div class="hall-ticket-frame">
                <div class="hall-ticket-header">
                    <h2>SMART CAMPUS TECHNICAL UNIVERSITY</h2>
                    <p>OFFICIAL ACADEMIC ADMISSION & HALL TICKET CARD - MID-TERM EXAMS 2026</p>
                </div>
                
                <div class="hall-ticket-student-grid">
                    <div class="ticket-student-details">
                        <table>
                            <tr><td>Candidate Name:</td><td>${selectedHallTicketStudent.name}</td></tr>
                            <tr><td>Register Number:</td><td>${selectedHallTicketStudent.id}</td></tr>
                            <tr><td>Academic Branch:</td><td>${selectedHallTicketStudent.dept}</td></tr>
                            <tr><td>Semester Session:</td><td>Summer Sem 3</td></tr>
                            <tr><td>No Dues Status:</td><td style="color:green; font-weight:700;">CLEARED & VERIFIED</td></tr>
                        </table>
                    </div>
                    <div class="ticket-student-pic">
                        <img src="${selectedHallTicketStudent.photo}">
                    </div>
                </div>

                <table class="hall-ticket-schedule-table">
                    <thead>
                        <tr>
                            <th>Sub Code</th>
                            <th>Subject Descriptor</th>
                            <th>Reporting Date & Time</th>
                            <th>Hall/Room No</th>
                            <th>Invigilator Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scheduleRows}
                    </tbody>
                </table>

                <div class="hall-ticket-rules">
                    <h4>INSTRUCTIONS TO CANDIDATE:</h4>
                    <ul>
                        <li>Candidates must be in the examination hall at least 15 minutes before the start time.</li>
                        <li>Possession of calculators, slide rules, or digital items not explicitly permitted is prohibited.</li>
                        <li>This card must be produced on demand to the invigilator / examiner.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    document.getElementById('printHallTicketBtn')?.addEventListener('click', () => {
        if (!selectedHallTicketStudent) {
            alert("Please select a student template to generate hall ticket first.");
            return;
        }
        window.print();
    });

    // MODULE 5: FEE MANAGEMENT
    function renderFeeModule() {
        const filter = document.getElementById('feeStatusFilter');
        const listBody = document.getElementById('feeTransactionsTableBody');
        const consoleBox = document.getElementById('feePaymentConsole');

        if (!listBody || !consoleBox) return;

        listBody.innerHTML = '';

        let totalExpected = 0;
        let totalCollected = 0;
        let totalPending = 0;

        db.fees.forEach(txn => {
            totalExpected += txn.amount;
            if (txn.status === "Paid") {
                totalCollected += txn.amount;
            } else {
                totalPending += txn.amount;
            }

            if (filter && filter.value !== 'all' && txn.status !== filter.value) return;

            const student = db.students.find(s => s.id === txn.studentId) || { name: "Unknown Student" };

            listBody.innerHTML += `
                <tr>
                    <td><strong>${txn.refNo}</strong></td>
                    <td>${student.name} (${txn.studentId})</td>
                    <td>${txn.term}</td>
                    <td>₹${txn.amount}</td>
                    <td>${txn.dueDate}</td>
                    <td><span class="badge ${txn.status === 'Paid' ? 'bg-teal' : 'bg-danger-soft'}">${txn.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="printReceipt('${txn.refNo}')"><i class="fa-solid fa-receipt"></i> Print</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('feeExpected').textContent = `₹${totalExpected.toLocaleString('en-IN')}`;
        document.getElementById('feeCollected').textContent = `₹${totalCollected.toLocaleString('en-IN')}`;
        document.getElementById('feePending').textContent = `₹${totalPending.toLocaleString('en-IN')}`;

        if (currentRole === 'Student' && activeStudent) {
            const hasDues = db.fees.some(f => f.studentId === activeStudent.id && f.status === 'Pending');
            const pendingTxn = db.fees.find(f => f.studentId === activeStudent.id && f.status === 'Pending');

            if (hasDues && pendingTxn) {
                consoleBox.innerHTML = `
                    <div class="fee-pending-alert-card">
                        <h4>Pending Tuition Balance</h4>
                        <p>${pendingTxn.term} outstanding.</p>
                        <strong style="font-size:18px;">Amount Due: ₹${pendingTxn.amount}</strong>
                    </div>
                    <form id="onlinePaymentForm" class="standard-form mt-3">
                        <div class="form-group">
                            <label>Secure UPI ID or Card Details</label>
                            <input type="text" placeholder="aaravsharma@upi" required>
                        </div>
                        <button type="submit" class="btn btn-accent btn-block"><i class="fa-solid fa-wallet"></i> Pay Online Now (UPI)</button>
                    </form>
                `;
                
                document.getElementById('onlinePaymentForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    pendingTxn.status = 'Paid';
                    showToast("Payment Success", `Tuition fee transaction ${pendingTxn.refNo} cleared successfully. Hall tickets unlocked!`, "email");
                    saveToLocalStorage();
                    renderFeeModule();
                });
            } else {
                consoleBox.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-circle-check text-teal"></i>
                        <p>Your student account has clear balances. Excellent! No pending tuition dues found.</p>
                    </div>
                `;
            }
        } else {
            consoleBox.innerHTML = `
                <form id="manualPaymentForm" class="standard-form">
                    <div class="form-group">
                        <label>Select Student Roster</label>
                        <select id="feeRecordStudentSelect">
                            ${db.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tuition Term Description</label>
                        <input type="text" id="feeRecordDesc" value="Semester 3 Registration Fees" required>
                    </div>
                    <div class="form-group">
                        <label>Amount Charged (₹)</label>
                        <input type="number" id="feeRecordAmount" value="45000" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Record Transaction</button>
                </form>
            `;
            
            document.getElementById('manualPaymentForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const studentId = document.getElementById('feeRecordStudentSelect').value;
                const desc = document.getElementById('feeRecordDesc').value;
                const amount = parseInt(document.getElementById('feeRecordAmount').value) || 0;
                
                const newTxn = {
                    refNo: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
                    studentId,
                    term: desc,
                    amount,
                    dueDate: new Date().toISOString().split('T')[0],
                    status: 'Pending'
                };

                db.fees.push(newTxn);
                showToast("Fee Ledger Recorded", `Pushed fee payment invoice to Student profile ledger.`, "email");
                saveToLocalStorage();
                renderFeeModule();
            });
        }
        updateRBACLayout();
    }

    if (document.getElementById('feeStatusFilter')) {
        document.getElementById('feeStatusFilter').addEventListener('change', renderFeeModule);
    }

    window.printReceipt = (refNo) => {
        const txn = db.fees.find(f => f.refNo === refNo);
        if (!txn) return;
        const student = db.students.find(s => s.id === txn.studentId) || { name: "Candidate" };
        
        const receiptWindow = window.open('', '_blank', 'width=600,height=400');
        receiptWindow.document.write(`
            <html>
            <head><title>Receipt - ${refNo}</title><style>body{font-family:sans-serif; padding:40px;} .box{border:1px solid #ccc; padding:20px;} h2{border-bottom:1px solid #eee; padding-bottom:10px;}</style></head>
            <body>
                <div class="box">
                    <h2>SMART CAMPUS PAYMENT RECEIPT</h2>
                    <p><strong>Transaction Ref:</strong> ${refNo}</p>
                    <p><strong>Date:</strong> 2026-07-05</p>
                    <p><strong>Paid By:</strong> ${student.name} (${txn.studentId})</p>
                    <p><strong>Description:</strong> ${txn.term}</p>
                    <p><strong>Amount Cleared:</strong> ₹${txn.amount}.00 INR</p>
                    <p><strong>Payment Status:</strong> PAID / SECURED</p>
                    <p style="margin-top:40px; font-size:11px; color:#888;">Thank you for registering. Registrar seal verification not required for digital receipts.</p>
                </div>
            </body>
            </html>
        `);
        receiptWindow.document.close();
        receiptWindow.print();
    };

    // MODULE 13: LIBRARY MANAGEMENT
    function renderLibraryModule() {
        const listBody = document.getElementById('libraryBooksTableBody');
        const consoleBox = document.getElementById('libraryConsoleBox');
        if (!listBody || !consoleBox) return;

        listBody.innerHTML = '';
        db.library.forEach(book => {
            const statusLabel = book.available > 0 ? "Available" : "Checked Out";
            const badgeClass = book.available > 0 ? "bg-teal" : "bg-danger-soft";

            listBody.innerHTML += `
                <tr>
                    <td><strong>${book.isbn}</strong></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.available} copies</td>
                    <td>${book.location}</td>
                    <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                </tr>
            `;
        });

        if (currentRole === 'Admin') {
            consoleBox.innerHTML = `
                <form id="bookIssueForm" class="standard-form">
                    <div class="form-group">
                        <label>Issue Book (Select ISBN)</label>
                        <select id="issueBookIsbn">
                            ${db.library.map(b => `<option value="${b.isbn}" ${b.available===0?'disabled':''}>${b.title} (${b.available} left)</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Student Roster</label>
                        <select id="issueBookStudent">
                            ${db.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block"><i class="fa-solid fa-book-bookmark"></i> Issue Book Pass</button>
                </form>
            `;
            
            document.getElementById('bookIssueForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const isbn = document.getElementById('issueBookIsbn').value;
                const book = db.library.find(b => b.isbn === isbn);
                if (book && book.available > 0) {
                    book.available--;
                    showToast("Book Issued", `Dispatched "${book.title}" to student register.`, "email");
                    saveToLocalStorage();
                    renderLibraryModule();
                }
            });
        } else {
            consoleBox.innerHTML = `
                <div class="library-user-stats-card">
                    <h4>Your Library Accounts</h4>
                    <div class="library-stat-row">
                        <span>Issued Books:</span>
                        <span>1 active</span>
                    </div>
                    <div class="library-stat-row">
                        <span>Fine Outstanding:</span>
                        <span style="color:var(--accent-pink); font-weight:700;">₹150.00</span>
                    </div>
                    <div class="library-stat-row">
                        <span>Due Date:</span>
                        <span>2026-07-09</span>
                    </div>
                </div>
                <button class="btn btn-sm btn-accent btn-block" onclick="simulateFinePay()"><i class="fa-solid fa-wallet"></i> Pay Library Overdue Fine</button>
            `;
        }
        updateRBACLayout();
    }

    window.simulateFinePay = () => {
        showToast("Library Fines Cleared", "Fines cleared. Account set back to default borrowing standing.", "sms");
    };

    document.getElementById('bookSearchInput')?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const listBody = document.getElementById('libraryBooksTableBody');
        if (!listBody) return;
        
        listBody.innerHTML = '';
        db.library.forEach(book => {
            if (!book.title.toLowerCase().includes(query) && !book.author.toLowerCase().includes(query) && !book.isbn.includes(query)) return;
            const statusLabel = book.available > 0 ? "Available" : "Checked Out";
            const badgeClass = book.available > 0 ? "bg-teal" : "bg-danger-soft";

            listBody.innerHTML += `
                <tr>
                    <td><strong>${book.isbn}</strong></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.available} copies</td>
                    <td>${book.location}</td>
                    <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                </tr>
            `;
        });
    });

    document.getElementById('addBookBtn')?.addEventListener('click', () => {
        const title = prompt("Enter Book Title:");
        if (!title) return;
        const author = prompt("Author name:");
        const location = prompt("Shelf location (e.g. Shelf B-5):", "Shelf A-1");

        const newBook = {
            isbn: `978-013${Math.floor(100000 + Math.random() * 900000)}`,
            title,
            author: author || "Various Authors",
            available: 5,
            location: location || "Shelf A-1"
        };

        db.library.push(newBook);
        showToast("Book Registered", `Added catalog index for "${title}". Shelf slots assigned.`, "email");
        saveToLocalStorage();
        renderLibraryModule();
    });

    // MODULE 18: SCHOLARSHIP MANAGEMENT
    function renderScholarships() {
        const body = document.getElementById('scholarshipTableBody');
        const actionBox = document.getElementById('scholarshipActionBox');
        if (!body || !actionBox) return;

        body.innerHTML = '';
        let pending = 0;
        
        db.scholarships.forEach(sch => {
            if (sch.status === 'Pending') pending++;
            const student = db.students.find(s => s.id === sch.studentId) || { name: "Unknown", cgpa: 0.0 };

            body.innerHTML += `
                <tr>
                    <td><strong>${student.name}</strong> (${sch.studentId})</td>
                    <td>${sch.name}</td>
                    <td>${sch.cgpaRequired}</td>
                    <td><strong>${student.cgpa}</strong></td>
                    <td><span class="badge ${sch.status === 'Approved' ? 'bg-teal' : (sch.status === 'Rejected' ? 'bg-danger-soft' : '')}">${sch.status}</span></td>
                    <td class="actions-col">
                        <button class="btn btn-sm btn-primary admin-only-action" data-rbac="Admin" onclick="updateScholarship('${sch.studentId}', 'Approved')">Approve</button>
                        <button class="btn btn-sm btn-danger" data-rbac="Admin" onclick="updateScholarship('${sch.studentId}', 'Rejected')">Reject</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById('scholarshipPendingCount').textContent = `${pending} Pending`;

        if (currentRole === 'Admin') {
            actionBox.innerHTML = `
                <form id="createScholarshipForm" class="standard-form">
                    <div class="form-group">
                        <label>Create New Scholarship Scheme</label>
                        <input type="text" id="schSchemeName" placeholder="e.g. Merit-cum-Means Waiver" required>
                    </div>
                    <div class="form-group">
                        <label>Cut-off CGPA Threshold</label>
                        <input type="number" id="schSchemeCgpa" step="0.1" value="8.5" min="5.0" max="10.0" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Launch Scheme</button>
                </form>
                
                <hr style="border:none; border-top:1px solid var(--border-color); margin:20px 0;">
                
                <form id="adminApplyScholarshipForm" class="standard-form">
                    <div class="form-group">
                        <label>Apply for Student</label>
                        <select id="adminSchStudentSelect" class="form-select-sm" style="background:#090d16; border:1px solid #1e293b; color:#fff; padding:10px; width:100%;">
                            ${db.students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Scholarship Scheme</label>
                        <select id="adminSchSchemeSelect" class="form-select-sm" style="background:#090d16; border:1px solid #1e293b; color:#fff; padding:10px; width:100%;">
                            <option value="National Merit Scholarship (MHRD)">National Merit Scholarship (MHRD)</option>
                            <option value="State Technical Aid Scheme">State Technical Aid Scheme</option>
                            <option value="Pragati Scholarship for Girls">Pragati Scholarship for Girls</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-accent btn-block">Submit Application</button>
                </form>
            `;
            
            document.getElementById('createScholarshipForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('schSchemeName').value;
                const cgpa = parseFloat(document.getElementById('schSchemeCgpa').value);
                showToast("Scholarship Launched", `Academic Scheme "${name}" launched. Min CGPA: ${cgpa}`, "email");
                document.getElementById('createScholarshipForm').reset();
            });

            document.getElementById('adminApplyScholarshipForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const studentId = document.getElementById('adminSchStudentSelect').value;
                const name = document.getElementById('adminSchSchemeSelect').value;
                const student = db.students.find(s => s.id === studentId);
                const cgpaRequired = name.includes('National') ? 9.0 : (name.includes('Pragati') ? 7.5 : 8.0);
                
                const newApp = { studentId, name, cgpaRequired, status: 'Pending' };
                db.scholarships.push(newApp);
                showToast("Scholarship Applied", `Submitted application for ${student.name}.`, "email");
                saveToLocalStorage();
                renderScholarships();
            });
        } else if (activeStudent) {
            const hasApplied = db.scholarships.some(s => s.studentId === activeStudent.id);
            if (!hasApplied) {
                actionBox.innerHTML = `
                    <p class="mb-3 text-muted">Register for active tuition aid programs below.</p>
                    <form id="applyScholarshipForm" class="standard-form">
                        <div class="form-group">
                            <label>Select Aid Scheme</label>
                            <select id="applyScholarshipSelect">
                                <option value="National Merit Scholarship (MHRD)">National Merit Scholarship (MHRD) (CGPA: 9.0)</option>
                                <option value="State Technical Aid Scheme">State Technical Aid Scheme (CGPA: 8.0)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-accent btn-block">Submit Application</button>
                    </form>
                `;

                document.getElementById('applyScholarshipForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const schName = document.getElementById('applyScholarshipSelect').value;
                    const minC = schName.includes('National') ? 9.0 : 8.0;

                    const newApp = {
                        studentId: activeStudent.id,
                        name: schName,
                        cgpaRequired: minC,
                        status: 'Pending'
                    };

                    db.scholarships.push(newApp);
                    showToast("Application Received", "Your scholarship application files submitted for review.", "email");
                    saveToLocalStorage();
                    renderScholarships();
                });
            } else {
                const app = db.scholarships.find(s => s.studentId === activeStudent.id);
                actionBox.innerHTML = `
                    <div class="empty-state">
                        <i class="fa-solid fa-award text-teal" style="font-size:36px;"></i>
                        <h4>Active Application File</h4>
                        <p style="text-align:center;"><strong>Scheme:</strong> ${app.name}<br><strong>Current Status:</strong> <span class="badge">${app.status}</span></p>
                    </div>
                `;
            }
        }
        updateRBACLayout();
    }

    window.updateScholarship = (sid, status) => {
        const app = db.scholarships.find(s => s.studentId === sid);
        if (app) {
            app.status = status;
            showToast("Scholarship Reviewed", `Application status set to ${status}.`, "email");
            saveToLocalStorage();
        }
        renderScholarships();
    };

    // MODULE 14: PLACEMENT MODULE
    function renderPlacements() {
        const body = document.getElementById('placementDrivesTableBody');
        const eligibilityBox = document.getElementById('placementEligibilityBox');
        if (!body || !eligibilityBox) return;

        body.innerHTML = '';
        db.placements.forEach(drv => {
            body.innerHTML += `
                <tr>
                    <td><strong>${drv.company}</strong></td>
                    <td>${drv.role}</td>
                    <td>${drv.minCgpa}</td>
                    <td><strong style="color:var(--accent-teal);">${drv.package}</strong></td>
                    <td>${drv.date}</td>
                    <td>${drv.registered} Students</td>
                    <td><span class="badge">${drv.status}</span></td>
                </tr>
            `;
        });

        const isEligible = activeStudent ? activeStudent.cgpa >= 8.0 : false;
        const studentCgpa = activeStudent ? activeStudent.cgpa : 0.0;
        eligibilityBox.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div class="library-stat-row">
                    <span>Your CGPA:</span>
                    <strong style="color:${isEligible?'var(--accent-teal)':'var(--accent-pink)'};">${studentCgpa}</strong>
                </div>
                <div class="library-stat-row">
                    <span>Backlogs Pending:</span>
                    <strong style="color:var(--accent-teal);">0 (Clean)</strong>
                </div>
                <div class="library-stat-row">
                    <span>Resume Uploaded:</span>
                    <strong>Verified (A-Grade)</strong>
                </div>
                <hr style="border:none; border-top:1px solid var(--border-color);">
                <div class="library-stat-row" style="font-size:14px; font-weight:700;">
                    <span>Placement Eligible:</span>
                    <span style="color:${isEligible?'var(--accent-teal)':'var(--accent-pink)'};">${isEligible?'YES':'NO (CGPA < 8.0)'}</span>
                </div>
                ${isEligible ? `
                    <button class="btn btn-sm btn-accent mt-2" onclick="registerForInfosysDrive()"><i class="fa-solid fa-briefcase"></i> Apply for Infosys Drive</button>
                ` : `
                    <p style="font-size:11px; color:var(--text-muted); text-align:center;">Increase CGPA and attend workshops to qualify.</p>
                `}
            </div>
        `;
    }

    window.registerForInfosysDrive = () => {
        const drive = db.placements.find(p => p.company === 'Infosys');
        if (drive) {
            drive.registered++;
            showToast("Recruitment Applied", "Successfully registered for Infosys Campus interview shortlist.", "email");
            saveToLocalStorage();
        }
        renderPlacements();
    };

    document.getElementById('addDriveBtn')?.addEventListener('click', () => {
        const company = prompt("Enter Company Name:");
        if (!company) return;
        const role = prompt("Job Profile Role Name:", "Software Engineer");
        const minCgpa = parseFloat(prompt("Minimum CGPA criteria:", "8.0")) || 8.0;
        const packageStr = prompt("Offered CTC Package:", "₹8,00,000/yr");
        const date = prompt("Interview Date:", "2026-08-20");

        const newDrive = { company, role, minCgpa, package: packageStr, date, registered: 0, status: 'Upcoming' };
        db.placements.unshift(newDrive);
        showToast("Drive Added", `Recruitment drive for ${company} scheduled.`, "email");
        saveToLocalStorage();
        renderPlacements();
    });

    // MODULE 17: ID CARD GENERATOR
    function renderIdCardGenerator() {
        const idList = document.getElementById('idCardStudentList');
        if (!idList) return;
        idList.innerHTML = '';
        db.students.forEach(student => {
            const item = document.createElement('div');
            item.className = 'id-selection-item';
            item.textContent = `${student.name} (${student.id})`;
            item.addEventListener('click', () => {
                document.querySelectorAll('.id-selection-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                document.getElementById('idPreviewName').textContent = student.name;
                document.getElementById('idPreviewCode').textContent = student.id;
                document.getElementById('idPreviewDept').textContent = student.dept;
                document.getElementById('idPreviewImage').src = student.photo;
                
                generateQRCodeElement('idCardQrDisplay', `SC_IDPASS_${student.id}`);
            });
            idList.appendChild(item);
        });
        
        setTimeout(() => {
            const firstItem = idList.querySelector('.id-selection-item');
            if (firstItem) firstItem.click();
        }, 100);
    }

    document.getElementById('printIdCardBtn')?.addEventListener('click', () => {
        window.print();
    });

    // MODULE 9 & 20: EXPORT AND REPORT GENERATOR
    function renderReportsModule() {
        const qTable = document.getElementById('customQueryOutputTable');
        if (!qTable) return;

        document.getElementById('reportQueryBuilder')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const category = document.getElementById('reportQueryCategory').value;
            const filterField = document.getElementById('reportQueryFilterField').value;
            const limit = parseInt(document.getElementById('reportQueryLimit').value) || 10;

            let headers = [];
            let rows = [];

            if (category === 'students') {
                headers = ['ID', 'Student Name', 'Department', 'CGPA', 'Attendance'];
                let filtered = [...db.students];
                if (filterField === 'cgpa') filtered = filtered.filter(s => s.cgpa >= 8.0);
                else if (filterField === 'attendance') filtered = filtered.filter(s => s.attendance < 75);
                
                rows = filtered.slice(0, limit).map(s => [s.id, s.name, s.dept, s.cgpa, `${s.attendance}%`]);
            } else if (category === 'courses') {
                headers = ['Code', 'Course Name', 'Duration', 'Students Enrolled'];
                rows = db.courses.slice(0, limit).map(c => [c.code, c.name, c.duration, c.studentsEnrolled]);
            } else if (category === 'attendance') {
                headers = ['Student Name', 'Attendance Rate', 'Probation Status'];
                rows = db.students.slice(0, limit).map(s => [s.name, `${s.attendance}%`, s.attendance < 75 ? 'DEBARRED' : 'OK']);
            } else {
                headers = ['ISBN', 'Book Title', 'Author', 'In Library'];
                rows = db.library.slice(0, limit).map(b => [b.isbn, b.title, b.author, `${b.available} copies`]);
            }

            let tableHtml = `
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(r => `
                        <tr>
                            ${r.map(col => `<td>${col}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            `;
            qTable.innerHTML = tableHtml;
            showToast("Report Rendered", `Custom Query pulled ${rows.length} records.`, "sms");
        });
    }

    window.exportFullStudentRoster = (format) => {
        let csvContent = "data:text/csv;charset=utf-8,Student ID,Student Name,Department,CGPA,Attendance,Parent Contact\n";
        db.students.forEach(s => {
            csvContent += `${s.id},"${s.name}","${s.dept}",${s.cgpa},${s.attendance}%,"${s.parentPhone}"\n`;
        });
        
        if (format === 'csv') {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "smart_campus_roster_2026.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Roster Exported", "Student roster database exported.", "email");
        } else {
            window.print();
        }
    };

    window.exportAttendanceSummary = (format) => {
        let csvContent = "data:text/csv;charset=utf-8,Student Name,Attendance %,Status\n";
        db.students.forEach(s => {
            csvContent += `"${s.name}",${s.attendance}%,${s.attendance<75?'DEBARRED':'OK'}\n`;
        });
        
        if (format === 'csv') {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "attendance_register_compiled.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Attendance Exported", "Attendance metrics exported successfully.", "sms");
        } else {
            window.print();
        }
    };

    window.exportMarksReport = (format) => {
        let csvContent = "data:text/csv;charset=utf-8,Student ID,Mid-term Marks,Grade Assigned\n";
        db.students.forEach(s => {
            const rec = db.grades.find(g => g.studentId === s.id) || { marks: 0, grade: 'F' };
            csvContent += `${s.id},${rec.marks},"${rec.grade}"\n`;
        });

        if (format === 'csv') {
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "marksheet_grades_july2026.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Grades Spreadsheets Saved", "CSV generated. Downloaded directly.", "email");
        } else {
            window.print();
        }
    };

    // 5. AI CHATBOT HANDLERS (MODULE 11)
    const chatbotWidget = document.getElementById('aiChatbotWidget');
    const chatbotTriggerBtn = document.getElementById('chatbotTriggerBtn');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatbotBtn = document.getElementById('closeChatbotBtn');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSendBtn = document.getElementById('chatbotSendBtn');
    const chatbotMessagesContainer = document.getElementById('chatbotMessagesContainer');

    if (chatbotTriggerBtn) {
        chatbotTriggerBtn.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
        });
    }

    if (closeChatbotBtn) {
        closeChatbotBtn.addEventListener('click', () => {
            chatbotWindow.classList.add('hidden');
        });
    }

    function handleSendChatbotMessage() {
        const text = chatbotInput.value.trim();
        if (!text) return;

        const userMsgNode = document.createElement('div');
        userMsgNode.className = 'user-msg';
        userMsgNode.textContent = text;
        chatbotMessagesContainer.appendChild(userMsgNode);
        chatbotInput.value = '';
        chatbotMessagesContainer.scrollTop = chatbotMessagesContainer.scrollHeight;

        const typingNode = document.createElement('div');
        typingNode.className = 'bot-msg typing-msg';
        typingNode.innerHTML = `<i>Thinking...</i>`;
        chatbotMessagesContainer.appendChild(typingNode);
        chatbotMessagesContainer.scrollTop = chatbotMessagesContainer.scrollHeight;

        setTimeout(() => {
            chatbotMessagesContainer.removeChild(typingNode);
            const botResponseText = getChatbotResponse(text);
            const botMsgNode = document.createElement('div');
            botMsgNode.className = 'bot-msg';
            botMsgNode.innerHTML = `<p>${botResponseText}</p>`;
            chatbotMessagesContainer.appendChild(botMsgNode);
            chatbotMessagesContainer.scrollTop = chatbotMessagesContainer.scrollHeight;
        }, 1200);
    }

    if (chatbotSendBtn) {
        chatbotSendBtn.addEventListener('click', handleSendChatbotMessage);
    }
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendChatbotMessage();
            }
        });
    }

    // 6. TOAST ALERT SYSTEM (MODULE 10)
    function showToast(title, body, type) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconHtml = `<i class="fa-solid fa-envelope"></i>`; 
        if (type === 'sms') iconHtml = `<i class="fa-solid fa-comment-sms"></i>`;
        
        toast.innerHTML = `
            <div class="toast-icon">${iconHtml}</div>
            <div class="toast-body">
                <h4>${title}</h4>
                <p>${body}</p>
            </div>
        `;
        container.appendChild(toast);

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(type === 'sms' ? 800 : 500, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {}

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4700);
    }

    window.showToast = showToast;
    
    // Real-time Search Listeners (Student and Faculty directories)
    document.getElementById('studentSearchInput')?.addEventListener('input', (e) => {
        renderStudentsList(e.target.value.toLowerCase());
    });

    document.getElementById('facultySearchInput')?.addEventListener('input', (e) => {
        renderFacultyList(e.target.value.toLowerCase());
    });

    // Auto-run trigger: Initialize directory bindings
    renderIdCardGenerator();
});
