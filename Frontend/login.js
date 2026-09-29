const loginForm = document.querySelector("form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const loginType = loginForm.querySelector("select").value;
        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (loginType === "Select Login Type") {
            alert("Please select Login Type.");
            return;
        }

        if (!email || !password) {
            alert("Please enter Email and Password.");
            return;
        }

        if (loginType !== "Student") {
            alert("Student Login is currently available.");
            return;
        }

        try {

            const response = await fetch(
                "https://meghna-campus-management-system-1.onrender.com/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (result.success) {

                alert("✅ Login Successful!\n\nWelcome to SVKPI Campus Portal.");

                window.location.href = "student-dashboard.html";

            } else {

                alert(
                    "❌ Login Failed\n\n" +
                    result.message
                );
            }

        } catch (error) {

            console.error("Login Error:", error);

            alert(
                "❌ Cannot connect to SVKPI server.\n\n" +
                "Please make sure Flask backend is running."
            );
        }

    });

}
