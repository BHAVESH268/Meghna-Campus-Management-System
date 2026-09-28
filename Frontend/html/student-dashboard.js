document.addEventListener("DOMContentLoaded", function () {

    // ================================
    // GET LOGGED-IN STUDENT
    // ================================

    const studentData = sessionStorage.getItem("loggedInStudent");

    // If student is not logged in
    if (!studentData) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    const student = JSON.parse(studentData);


    // ================================
    // STUDENT DATA
    // ================================

    const fullName = student.fullName || "Student";
    const enrollment = student.enrollment || "---";
    const email = student.email || "---";
    const department = student.department || "---";
    const semester = student.semester || "---";


    // ================================
    // INITIAL
    // ================================

    const initial = fullName
        .charAt(0)
        .toUpperCase();


    // ================================
    // TOPBAR STUDENT NAME
    // ================================

    const avatar = document.querySelector(".student-avatar");

    if (avatar) {
        avatar.textContent = initial;
    }


    const studentMiniName =
        document.querySelector(".student-mini strong");

    if (studentMiniName) {
        studentMiniName.textContent = fullName;
    }


    const studentMiniDepartment =
        document.querySelector(".student-mini span");

    if (studentMiniDepartment) {
        studentMiniDepartment.textContent = department;
    }


    // ================================
    // WELCOME MESSAGE
    // ================================

    const welcomeTitle =
        document.querySelector(".welcome h2");

    if (welcomeTitle) {

        welcomeTitle.textContent =
            `Welcome, ${fullName} 👋`;

    }


    // ================================
    // STUDENT INFORMATION
    // ================================

    const profileRows =
        document.querySelectorAll(".profile-row");

    if (profileRows.length >= 4) {

        profileRows[0].querySelector("strong").textContent =
            fullName;

        profileRows[1].querySelector("strong").textContent =
            enrollment;

        profileRows[2].querySelector("strong").textContent =
            department;

        profileRows[3].querySelector("strong").textContent =
            semester;
    }


    // ================================
    // LOGOUT
    // ================================

    const logoutButton =
        document.querySelector(".logout a");

    if (logoutButton) {

        logoutButton.addEventListener("click", function (event) {

            event.preventDefault();

            const confirmLogout =
                confirm("Are you sure you want to logout?");

            if (!confirmLogout) {
                return;
            }

            sessionStorage.removeItem("loggedInStudent");

            window.location.href = "login.html";

        });

    }


    // ================================
    // PROFILE QUICK ACCESS
    // ================================

    const facilityCards =
        document.querySelectorAll(".facility-card");

    facilityCards.forEach(function (card) {

        const title =
            card.querySelector("h3");

        if (!title) {
            return;
        }

        if (title.textContent.trim() === "My Profile") {

            card.addEventListener("click", function (event) {

                event.preventDefault();

                alert(
                    "Student Profile\n\n" +
                    "Name: " + fullName + "\n" +
                    "Enrollment: " + enrollment + "\n" +
                    "Email: " + email + "\n" +
                    "Department: " + department + "\n" +
                    "Semester: " + semester
                );

            });

        }

    });


    // ================================
    // CONSOLE CHECK
    // ================================

    console.log(
        "✅ Student Dashboard Loaded"
    );

    console.log(
        "Logged-in Student:",
        student
    );

});
const studentData = JSON.parse(
    sessionStorage.getItem("loggedInStudent")
);

if (!studentData) {
    window.location.href = "login.html";
}

// Student information show કરવી
document.querySelector(".student-avatar").textContent =
    studentData.fullName.charAt(0).toUpperCase();

document.querySelector(".student-mini strong").textContent =
    studentData.fullName;

document.querySelector(".student-mini span").textContent =
    studentData.department;

// Welcome message
document.querySelector(".welcome h2").textContent =
    `Welcome ${studentData.fullName} 👋`;

// Profile information
const profileRows = document.querySelectorAll(".profile-row");

profileRows[0].querySelector("strong").textContent =
    studentData.fullName;

profileRows[1].querySelector("strong").textContent =
    studentData.enrollment;

profileRows[2].querySelector("strong").textContent =
    studentData.department;

profileRows[3].querySelector("strong").textContent =
    studentData.semester;


// Logout
const logoutButton = document.querySelector(".logout a");

logoutButton.addEventListener("click", function (event) {

    event.preventDefault();

    sessionStorage.removeItem("loggedInStudent");

    window.location.href = "login.html";
});