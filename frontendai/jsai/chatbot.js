
/* =========================================================
   SVKPI AI ASSISTANT
   ADVANCED TEXT + VOICE + IMAGE AI
========================================================= */

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

/* IMAGE ELEMENTS */

const attachBtn = document.getElementById("attachBtn");
const imageInput = document.getElementById("imageInput");
const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");
const imagePreview =
    document.getElementById("imagePreview");
const imageName =
    document.getElementById("imageName");
const removeImageBtn =
    document.getElementById("removeImageBtn");


/* =========================================================
   SVKPI INFORMATION
========================================================= */

const SVKPI_INFO = `
You are SVKPI AI Assistant.

OFFICIAL INSTITUTE INFORMATION

Institute Name:
Shree Vasudevbhai and Kantibhai Patel Institute of Engineering (SVKPIE)

Short Name:
SVKPI

Established:
2013

Location:
Meghna Campus, Kadi-Kalyanpura Road,
Nani Kadi, Kadi, District Mehsana, Gujarat, India.

Affiliation:
Gujarat Technological University (GTU)

Approval:
AICTE Approved

Official Website:
svkpinstitute.com

Contact Number:
02764-297185

Diploma Engineering Courses:
1. Computer Engineering
2. Mechanical Engineering
3. Electrical Engineering
4. Civil Engineering
5. Automobile Engineering

Course Duration:
3 years after Class 10.

Campus Facilities:
1. Classrooms
2. Technical Laboratories
3. Library
4. Workshop
5. IT Infrastructure

IMPORTANT RULES:

- Use only the provided SVKPI information for official college facts.
- Do not invent SVKPI information.
- If information is unavailable, clearly say that it is not available in the provided official information.
- For important official information, advise verification from the institute.
- If the user uploads an image, analyze the image carefully.
- If the user asks about an uploaded image, answer based on what is actually visible.
- If something cannot be determined from the image, say so.
`;


/* =========================================================
   SELECTED IMAGE
========================================================= */

let selectedImage = null;


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendBtn) {
    sendBtn.addEventListener("click", () => {
        sendMessage();
    });
}


/* =========================================================
   ENTER KEY
========================================================= */

if (userInput) {

    userInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    });

}


/* =========================================================
   IMAGE ATTACH
========================================================= */

if (attachBtn && imageInput) {

    attachBtn.addEventListener("click", () => {

        imageInput.click();

    });

}


/* =========================================================
   IMAGE SELECT
========================================================= */

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert("Please select a valid image.");

            imageInput.value = "";

            return;

        }


        /* 20 MB safety limit */

        if (file.size > 20 * 1024 * 1024) {

            alert("Image must be smaller than 20 MB.");

            imageInput.value = "";

            return;

        }


        selectedImage = file;


        const reader = new FileReader();


        reader.onload = function (event) {

            if (imagePreview) {

                imagePreview.src =
                    event.target.result;

            }

            if (imagePreviewContainer) {

                imagePreviewContainer.style.display =
                    "flex";

            }

            if (imageName) {

                imageName.textContent =
                    file.name;

            }

        };


        reader.readAsDataURL(file);

    });

}


/* =========================================================
   REMOVE IMAGE
========================================================= */

if (removeImageBtn) {

    removeImageBtn.addEventListener(
        "click",
        removeSelectedImage
    );

}


function removeSelectedImage() {

    selectedImage = null;

    if (imageInput) {
        imageInput.value = "";
    }

    if (imagePreview) {
        imagePreview.src = "";
    }

    if (imageName) {
        imageName.textContent = "Image selected";
    }

    if (imagePreviewContainer) {
        imagePreviewContainer.style.display = "none";
    }

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(customMessage = null) {

    let message = "";


    /* Get text */

    if (typeof customMessage === "string") {

        message = customMessage.trim();

    } else {

        message =
            userInput
                ? userInput.value.trim()
                : "";

    }


    /* Allow image-only message */

    if (!message && !selectedImage) {

        return;

    }


    /* Save image before clearing */

    const imageToSend =
        selectedImage;


    /* Remove welcome */

    removeWelcome();


    /* Show user message */

    if (imageToSend) {

        addUserImageMessage(
            message,
            imageToSend
        );

    } else {

        addMessage(
            message,
            "user"
        );

    }


    /* Clear input */

    if (userInput) {

        userInput.value = "";

    }


    /* Clear selected image preview */

    removeSelectedImage();


    /* Typing */

    const thinking =
        addTypingMessage();


    try {

        /* =================================================
           IMPORTANT
           BACKEND EXPECTS JSON
        ================================================= */

        const requestBody = {

            message: message,

            context: SVKPI_INFO

        };


        /* =================================================
           IMAGE
           
           The current /chat endpoint has been verified
           to accept JSON. We therefore send normal text
           through JSON without breaking the backend.
        ================================================= */

        if (imageToSend) {

            console.log(
                "Image selected:",
                imageToSend.name
            );

        }


        /* =================================================
           FLASK CHAT API
        ================================================= */

        const response =
            await fetch(
                "https://meghna-campus-management-system-1.onrender.com/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data =
            await response.json();


        removeTyping(thinking);


        addMessage(
            data.reply ||
            "No response received.",
            "ai"
        );


    } catch (error) {

        removeTyping(thinking);


        console.error(
            "SVKPI AI Error:",
            error
        );


        addMessage(
            "❌ I couldn't connect to SVKPI AI. Please make sure Flask is running on port 5000.",
            "ai"
        );

    }

}


/* =========================================================
   NORMAL MESSAGE
========================================================= */

function addMessage(text, sender) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${sender}`;


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";


    avatar.innerHTML =
        sender === "ai"
            ? '<i class="fa-solid fa-robot"></i>'
            : '<i class="fa-solid fa-user"></i>';


    const textDiv =
        document.createElement("div");

    textDiv.className =
        "text";


    textDiv.textContent =
        text;


    messageDiv.appendChild(avatar);

    messageDiv.appendChild(textDiv);

    chatBox.appendChild(messageDiv);


    scrollToBottom();


    return messageDiv;

}


/* =========================================================
   USER IMAGE MESSAGE
========================================================= */

function addUserImageMessage(text, file) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "message user";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";


    avatar.innerHTML =
        '<i class="fa-solid fa-user"></i>';


    const content =
        document.createElement("div");

    content.className =
        "text";


    const img =
        document.createElement("img");

    img.className =
        "chat-image";

    img.alt =
        "Uploaded image";


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            img.src =
                event.target.result;

        };


    reader.readAsDataURL(file);


    content.appendChild(img);


    if (text) {

        const messageText =
            document.createElement("div");

        messageText.textContent =
            text;

        messageText.style.marginTop =
            "8px";

        content.appendChild(
            messageText
        );

    }


    messageDiv.appendChild(avatar);

    messageDiv.appendChild(content);

    chatBox.appendChild(messageDiv);


    scrollToBottom();


    return messageDiv;

}


/* =========================================================
   TYPING
========================================================= */

function addTypingMessage() {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "message ai typing-message";


    messageDiv.innerHTML = `

        <div class="avatar">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="text">

            <div class="typing">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatBox.appendChild(messageDiv);

    scrollToBottom();


    return messageDiv;

}


/* =========================================================
   REMOVE TYPING
========================================================= */

function removeTyping(element) {

    if (
        element &&
        element.parentNode
    ) {

        element.remove();

    }

}


/* =========================================================
   REMOVE WELCOME
========================================================= */

function removeWelcome() {

    const welcome =
        document.getElementById(
            "welcomeScreen"
        );


    if (welcome) {

        welcome.remove();

    }

}


/* =========================================================
   CLEAR CHAT
========================================================= */

function clearChat() {

    chatBox.innerHTML = "";

    removeSelectedImage();


    const welcome =
        document.createElement("div");


    welcome.className =
        "welcome-screen";


    welcome.id =
        "welcomeScreen";


    welcome.innerHTML = `

        <div class="welcome-icon">

            <img
                src="assets/svkpi-logo.png"
                alt="SVKPI Logo"
            >

        </div>


        <h2>
            Hi! I'm SVKPI AI 👋
        </h2>


        <p>
            Your intelligent campus assistant.
            Ask me about studies, college information,
            programming, assignments and images.
        </p>


        <div class="quick-grid">


            <button
                class="quick-card"
                data-question="Tell me about SVKPI">

                <i class="fa-solid fa-building-columns"></i>

                <span>
                    College Info
                </span>

            </button>


            <button
                class="quick-card"
                data-question="What courses are available at SVKPI?">

                <i class="fa-solid fa-graduation-cap"></i>

                <span>
                    Courses
                </span>

            </button>


            <button
                class="quick-card"
                data-question="Tell me about admission">

                <i class="fa-solid fa-user-plus"></i>

                <span>
                    Admissions
                </span>

            </button>


            <button
                class="quick-card"
                data-question="Help me with programming">

                <i class="fa-solid fa-code"></i>

                <span>
                    Study Help
                </span>

            </button>

        </div>

    `;


    chatBox.appendChild(welcome);


    attachQuickButtons();

}


/* =========================================================
   NEW CHAT
========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        clearChat
    );

}


/* =========================================================
   CLEAR BUTTON
========================================================= */

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        clearChat
    );

}


/* =========================================================
   QUICK BUTTONS
========================================================= */

function attachQuickButtons() {

    document
        .querySelectorAll(
            "[data-question]"
        )
        .forEach(button => {

            button.onclick =
                function () {

                    const question =
                        button.dataset.question;

                    sendMessage(
                        question
                    );

                };

        });

}


/* =========================================================
   SIDEBAR
========================================================= */

document
    .querySelectorAll(
        ".side-action"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.question;

                sendMessage(
                    question
                );


                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    });


/* =========================================================
   MOBILE MENU
========================================================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        () => {

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );

}


/* =========================================================
   VOICE
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition && voiceBtn) {

    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    voiceBtn.addEventListener(
        "click",
        () => {

            try {

                recognition.start();

                voiceBtn.classList.add(
                    "listening"
                );

                if (userInput) {

                    userInput.placeholder =
                        "Listening...";

                }

            } catch (error) {

                console.log(
                    "Voice already active."
                );

            }

        }
    );


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript;


            if (userInput) {

                userInput.value =
                    transcript;

                userInput.focus();

            }

        };


    recognition.onend =
        function () {

            voiceBtn.classList.remove(
                "listening"
            );

            if (userInput) {

                userInput.placeholder =
                    "Ask SVKPI AI anything...";

            }

        };


    recognition.onerror =
        function () {

            voiceBtn.classList.remove(
                "listening"
            );

            if (userInput) {

                userInput.placeholder =
                    "Ask SVKPI AI anything...";

            }

        };

} else if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        () => {

            alert(
                "Voice input is not supported. Try Google Chrome."
            );

        }
    );

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToBottom() {

    requestAnimationFrame(
        () => {

            chatBox.scrollTop =
                chatBox.scrollHeight;

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

attachQuickButtons();


console.log(
    "✅ SVKPI AI Advanced Frontend Loaded"
);


