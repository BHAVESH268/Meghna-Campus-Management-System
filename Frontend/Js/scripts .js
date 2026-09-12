const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function () {

    const role = document.getElementById("role").value;

    if (role === "Student") {

        window.location.href = "student-dashboard.html";

    }

    else if (role === "Faculty") {

        window.location.href = "faculty-dashboard.html";

    }

    else if (role === "Admin") {

        window.location.href = "admin-dashboard.html";

    }

    else {

        alert("Please Select Login Type");

    }

});