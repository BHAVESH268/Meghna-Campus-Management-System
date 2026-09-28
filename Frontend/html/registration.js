const registrationForm = document.getElementById("registrationForm");

registrationForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const enrollment = document.getElementById("enrollment").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const department = document.getElementById("department").value;
    const semester = document.getElementById("semester").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    if (
        !fullName ||
        !enrollment ||
        !email ||
        !mobile ||
        !department ||
        !semester ||
        !password ||
        !confirmPassword
    ) {
        alert("Please fill all fields.");
        return;
    }

    if (!terms) {
        alert("Please accept the Terms & Conditions.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
    }

    if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    const studentData = {
        fullName: fullName,
        enrollment: enrollment,
        email: email,
        mobile: mobile,
        department: department,
        semester: semester,
        password: password,
        confirmPassword: confirmPassword
    };

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(studentData)
            }
        );

        const result = await response.json();

        if (result.success) {

            alert(
                "✅ Registration Successful!\n\n" +
                "Your SVKPI Student Account has been created."
            );

            window.location.href = "login.html";

        } else {

            alert(
                "❌ Registration Failed\n\n" +
                result.message
            );
        }

    } catch (error) {

        console.error("Registration Error:", error);

        alert(
            "❌ Cannot connect to SVKPI server.\n\n" +
            "Please make sure Flask backend is running."
        );
    }

});