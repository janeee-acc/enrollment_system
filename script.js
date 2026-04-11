/**
 * Course Enrollment Simulator - Object-Oriented Programming Implementation
 * Main Classes: Student, Course, Enrollment
 */

// ========== COURSE CLASS ==========
class Course {
  constructor(code, title, capacity, prerequisites = []) {
    this.code = code;
    this.title = title;
    this.capacity = capacity;
    this.prerequisites = prerequisites;
    this.enrolledCount = 0;
  }

  isFull() {
    return this.enrolledCount >= this.capacity;
  }

  addStudent() {
    if (!this.isFull()) {
      this.enrolledCount++;
      return true;
    }
    return false;
  }

  removeStudent() {
    if (this.enrolledCount > 0) {
      this.enrolledCount--;
      return true;
    }
    return false;
  }

  hasPrerequisites() {
    return this.prerequisites.length > 0;
  }

  getPrerequisites() {
    return this.prerequisites;
  }
}

// ========== STUDENT CLASS ==========
class Student {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.enrolledCourses = []; // Array of {code, enrollmentDate}
    this.grades = {}; // { courseCode: grade }
  }

  enrollCourse(course, prerequisitesMet = true) {
    if (this.enrolledCourses.some(ec => ec.code === course.code)) {
      return { success: false, message: `${course.code} is already in enrolled courses.` };
    }

    if (!prerequisitesMet) {
      return { success: false, message: `Cannot enroll: Missing prerequisites for ${course.code}.` };
    }

    if (course.isFull()) {
      return { success: false, message: `${course.code} is at full capacity.` };
    }

    if (course.addStudent()) {
      this.enrolledCourses.push({
        code: course.code,
        enrollmentDate: new Date()
      });
      return { success: true, message: `${course.code} added to enrolled courses successfully.` };
    }

    return { success: false, message: `Failed to enroll in ${course.code}.` };
  }

  dropCourse(course) {
    const index = this.enrolledCourses.findIndex(ec => ec.code === course.code);
    if (index > -1) {
      course.removeStudent();
      this.enrolledCourses.splice(index, 1);
      return { success: true, message: `${course.code} dropped from enrolled courses.` };
    }
    return { success: false, message: `${course.code} not found in enrolled courses.` };
  }

  setGrade(courseCode, grade) {
    const normalized = parseFloat(grade);
    // Numerical GPA on Philippine style: 1.0 best, 3.0 lowest passing, 4.0/5.0 failing
    if (!isNaN(normalized) && normalized >= 1.0 && normalized <= 5.0) {
      this.grades[courseCode] = normalized;
      return true;
    }
    return false;
  }

  getGrade(courseCode) {
    return this.grades[courseCode] != null ? this.grades[courseCode] : null;
  }

  hasPassingGrade(courseCode) {
    const grade = this.getGrade(courseCode);
    return grade != null && grade <= 3.0;
  }

  getEnrolledCourses() {
    return this.enrolledCourses.map(ec => ec.code);
  }

  getEnrolledCoursesWithDates() {
    return [...this.enrolledCourses];
  }

  getEnrolledCoursesCount() {
    return this.enrolledCourses.length;
  }
}

// ========== ENROLLMENT CLASS ==========
class Enrollment {
  constructor(student, course) {
    this.student = student;
    this.course = course;
    this.enrollmentDate = new Date();
  }

  isValid() {
    return this.student && this.course && 
           this.student.enrolledCourses.includes(this.course.code);
  }

  getStudent() {
    return this.student;
  }

  getCourse() {
    return this.course;
  }

  getEnrollmentDate() {
    return this.enrollmentDate;
  }
}

// ========== COURSE CATALOG (Global) ==========
const courseCatalog = [
  new Course('ICT 103', 'Fundamentals of Programming', 40),
  new Course('GE 3 SS', 'The Contemporary World', 40),
  new Course('ICT 106', 'System Fundamentals', 40, ['ICT 105']),
  new Course('ENG 3', 'Technical Writing with Oral Communication', 40),
  new Course('ICT 105', 'Discrete Structure 1', 40, ['ICT 103']),
  new Course('PE 2', 'PATHFIT 2: Exercise-Based Fitness Activities', 40, ['PE 1']),
  new Course('GE 2 SS', 'Readings in Philippine History', 40),
  new Course('NSTP 2-CWTS', 'NSTP 2-Civic Welfare Training Service', 40, ['NSTP 1-CWTS']),
  new Course('PE 1', 'PATHFIT 1: Movement Competency Training', 40),
  new Course('GE 5 ENG', 'Purposive Communication', 40),
  new Course('NSTP 1-CWTS', 'NSTP 1-Civic Welfare Training Service', 40),
  new Course('CS 1', 'Programming Logic Formulation', 40),
  new Course('GE ELEC 10', 'Philippine Popular Culture', 40),
  new Course('GE 4 MATH', 'Mathematics in the Modern World', 40),
  new Course('ICT 102', 'Introduction to Computing', 40),
  new Course('GE 8 SS', 'Ethics', 40),
  new Course('GE 1 SS', 'Understanding the Self', 40)
];

// Initialize student with enrollment data
let currentStudent = new Student(1, 'John Doe');
let courseToDrop = null;

// ========== UI HELPER FUNCTIONS ==========
function getCourseInfo(code) {
  return courseCatalog.find(c => c.code === code);
}

function navigate(index) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));

  if (index === 0) document.getElementById("dashboard").classList.remove("hidden");
  if (index === 1) document.getElementById("available").classList.remove("hidden");
  if (index === 2) document.getElementById("enrolled").classList.remove("hidden");

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar').classList.remove('sidebar-open');
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('sidebar-open');
}

// Ensure mobile nav starts closed on small screens
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 1024) {
    document.querySelector('.sidebar').classList.remove('sidebar-open');
  }
});

function updateCourseCard(code) {
  const course = getCourseInfo(code);
  if (!course) return;

  const card = document.querySelector(`.course-card[data-course="${code}"]`);
  if (card) {
    card.querySelector('.count-value').textContent = `${course.enrolledCount} / ${course.capacity}`;
  }
}

function updateAllCourseCards() {
  courseCatalog.forEach(c => updateCourseCard(c.code));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function checkPrerequisitesMet(code) {
  const course = getCourseInfo(code);
  if (!course || !course.hasPrerequisites()) return true;

  const prerequisites = course.getPrerequisites();
  for (let prereq of prerequisites) {
    if (!currentStudent.hasPassingGrade(prereq)) {
      return false;
    }
  }
  return true;
}

function getPrerequisiteMessage(code) {
  const course = getCourseInfo(code);
  if (!course || !course.hasPrerequisites()) return '';

  const prerequisites = course.getPrerequisites();
  const missing = prerequisites.filter(p => !currentStudent.hasPassingGrade(p));
  
  if (missing.length > 0) {
    return `Required: ${missing.join(', ')} with passing grade`;
  }
  return '';
}

function enroll(code) {
  const course = getCourseInfo(code);
  if (!course) return;

  const prerequisitesMet = checkPrerequisitesMet(code);
  const result = currentStudent.enrollCourse(course, prerequisitesMet);

  if (!result.success) {
    showToast(result.message);
    return;
  }

  updateCourseCard(code);
  updateList();
  showToast(result.message);
}

function dropCourse(index) {
  const enrolledCourses = currentStudent.getEnrolledCoursesWithDates();
  const enrollment = enrolledCourses[index];
  
  if (enrollment) {
    const course = getCourseInfo(enrollment.code);
    if (course) {
      courseToDrop = { course, index };
      document.getElementById('dropMessage').textContent = `Are you sure you want to drop ${course.code}: ${course.title}?`;
      const modal = document.getElementById('dropModal');
      modal.classList.add('show');
    }
  }
}

function updateList() {
  const tableBody = document.getElementById('enrolledTableBody');
  tableBody.innerHTML = '';

  const enrolledCourses = currentStudent.getEnrolledCoursesWithDates();
  
  if (enrolledCourses.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="4" style="text-align: center; padding: 40px; color: #666; font-style: italic;">
        No courses enrolled yet. Visit the Available Courses section to enroll.
      </td>
    `;
    tableBody.appendChild(emptyRow);
  } else {
    enrolledCourses.forEach((enrollment, index) => {
      const course = getCourseInfo(enrollment.code);
      const enrollmentDate = enrollment.enrollmentDate.toLocaleDateString();
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="enrolled-course-code">${enrollment.code}</div>
        </td>
        <td>
          <div class="enrolled-course-title">${course ? course.title : 'Unknown Course'}</div>
        </td>
        <td>
          <div class="enrolled-date">${enrollmentDate}</div>
        </td>
        <td>
          <button class="drop-btn" onclick="dropCourse(${index})">Drop Course</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  document.getElementById('enrolledCount').innerText = currentStudent.getEnrolledCoursesCount();
}

function openGradeModal() {
  const modal = document.getElementById('gradeModal');
  modal.classList.add('show');
  
  // Populate with existing grades
  const inputs = document.querySelectorAll('.grade-input');
  inputs.forEach(input => {
    const code = input.dataset.course;
    const grade = currentStudent.getGrade(code);
    if (grade) {
      input.value = grade;
    }
  });
}

function closeGradeModal() {
  const modal = document.getElementById('gradeModal');
  modal.classList.remove('show');
}

function closeDropModal() {
  const modal = document.getElementById('dropModal');
  modal.classList.remove('show');
  courseToDrop = null;
}

function confirmDrop() {
  if (courseToDrop) {
    const { course, index } = courseToDrop;
    const result = currentStudent.dropCourse(course);
    updateCourseCard(course.code);
    updateList();
    showToast(result.message);
    closeDropModal();
  }
}

function saveGrades() {
  const inputs = document.querySelectorAll('.grade-input');
  let saved = 0;
  let hasErrors = false;

  inputs.forEach(input => {
    const code = input.dataset.course;
    const gradeValue = input.value.trim();
    
    if (gradeValue) {
      const grade = parseFloat(gradeValue);
      if (isNaN(grade) || grade < 1.0 || grade > 5.0) {
        input.style.borderColor = '#dc3545';
        hasErrors = true;
      } else {
        input.style.borderColor = '#28a745';
        if (currentStudent.setGrade(code, grade)) {
          saved++;
        }
      }
    } else {
      input.style.borderColor = '#ddd';
      // Remove grade if empty
      delete currentStudent.grades[code];
    }
  });

  if (hasErrors) {
    showToast('Please enter valid grades between 1.0 and 5.0');
    return;
  }

  if (saved > 0) {
    showToast(`Grades saved successfully (${saved} course(s)).`);
    closeGradeModal();
  } else {
    showToast('No grades were entered.');
  }
}

function updateDashboard() {
  const welcome = document.querySelector('#dashboard .card h3');
  if (welcome) {
    welcome.textContent = `Welcome, ${currentStudent.name}!`;
  }
}

// Course search functionality
function initializeCourseSearch() {
  const searchInput = document.getElementById('courseSearch');
  if (searchInput) {
    // Real-time search as user types
    searchInput.addEventListener('input', function() {
      filterCourses(this.value.toLowerCase());
    });
    
    // Allow search on Enter key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

function performSearch() {
  const searchInput = document.getElementById('courseSearch');
  if (searchInput) {
    const searchTerm = searchInput.value.toLowerCase();
    filterCourses(searchTerm);
    
    // Add visual feedback
    const searchBtn = document.querySelector('.search-btn');
    searchBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      searchBtn.style.transform = 'scale(1)';
    }, 150);
  }
}

function filterCourses(searchTerm) {
  const courseCards = document.querySelectorAll('.course-card');
  
  courseCards.forEach(card => {
    const courseCode = card.dataset.course.toLowerCase();
    const courseTitle = card.querySelector('.course-title').textContent.toLowerCase();
    const courseH3 = card.querySelector('h3').textContent.toLowerCase();
    
    // Check if search term matches course code, title, or h3 text
    const matches = courseCode.includes(searchTerm) || 
                   courseTitle.includes(searchTerm) || 
                   courseH3.includes(searchTerm);
    
    if (matches || searchTerm === '') {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  updateDashboard();
  updateAllCourseCards();
  updateList();
  navigate(0);
  
  // Initialize course search functionality
  initializeCourseSearch();
});