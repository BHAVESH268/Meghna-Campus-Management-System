/* =========================================================
   SVKPI AI ASSISTANT
   ADVANCED FRONTEND + SVKPI INFORMATION
========================================================= */

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");


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

IMPORTANT RULE:

When the user asks about SVKPI, college information,
courses, facilities, contact details, location,
affiliation, approval or website, use the information
provided above.

Do not invent information that is not provided.

For important official information, advise the user
to verify it from the institute's official website.
`;


/* =========================================================
   SEND BUTTON
========================================================= */

/*
   IMPORTANT:
   Do NOT write:

   sendBtn.addEventListener("click", sendMessage);

   because the browser passes PointerEvent to sendMessage().
*/

sendBtn.addEventListener("click", () => {
    sendMessage();
});


/* =========================================================
   ENTER KEY
========================================================= */

userInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(customMessage = null) {

    let message = "";

    /*
       If quick button sends a question,
       customMessage will be a STRING.

       If normal Send button / Enter is used,
       customMessage will be null.
    */

    if (typeof customMessage === "string") {

        message = customMessage.trim();

    } else {

        message = userInput.value.trim();

    }


    if (!message) {
        return;
    }


    /* Remove welcome screen */

    removeWelcome();


    /* Show user message */

    addMessage(message, "user");


    /* Clear input */

    userInput.value = "";


    /* Show typing */

    const thinking = addTypingMessage();


    try {

        /* =================================================
           CONNECT TO FLASK BACKEND
        ================================================= */

        const response = await fetch(
            "http://127.0.0.1:5000/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: message,

                    context: SVKPI_INFO

                })
            }
        );


        /* Check server response */

        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        /* Convert response to JSON */

        const data = await response.json();


        /* Remove typing indicator */

        removeTyping(thinking);


        /* Show AI response */

        addMessage(
            data.reply || "No response received.",
            "ai"
        );


    } catch (error) {

        /* Remove typing indicator */

        removeTyping(thinking);


        console.error(
            "❌ AI Error:",
            error
        );


        /* Show error */

        addMessage(
            "❌ I couldn't connect to the SVKPI AI backend. Please make sure Flask is running on port 5000.",
            "ai"
        );

    }

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(text, sender) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        `message ${sender}`;


    /* Avatar */

    const avatar =
        document.createElement("div");

    avatar.className = "avatar";


    avatar.innerHTML =
        sender === "ai"
            ? '<i class="fa-solid fa-robot"></i>'
            : '<i class="fa-solid fa-user"></i>';


    /* Message text */

    const textDiv =
        document.createElement("div");

    textDiv.className = "text";

    textDiv.textContent = text;


    /* Add elements */

    messageDiv.appendChild(avatar);

    messageDiv.appendChild(textDiv);

    chatBox.appendChild(messageDiv);


    /* Scroll */

    scrollToBottom();


    return messageDiv;

}


/* =========================================================
   TYPING INDICATOR
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
   CLEAR / NEW CHAT
========================================================= */

function clearChat() {

    chatBox.innerHTML = "";


    const welcome =
        document.createElement("div");


    welcome.className =
        "welcome-screen";


    welcome.id =
        "welcomeScreen";


    welcome.innerHTML = `

        <div class="welcome-icon">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>

        <h2>New conversation 👋</h2>

        <p>
            Ask SVKPI AI anything about your campus,
            studies, programming or assignments.
        </p>

        <div class="quick-grid">

            <button
                class="quick-card"
                data-question="Tell me about SVKPI"
            >

                <i class="fa-solid fa-building-columns"></i>

                <span>College Info</span>

            </button>


            <button
                class="quick-card"
                data-question="What courses are available at SVKPI?"
            >

                <i class="fa-solid fa-graduation-cap"></i>

                <span>Courses</span>

            </button>


            <button
                class="quick-card"
                data-question="Tell me about admission"
            >

                <i class="fa-solid fa-user-plus"></i>

                <span>Admissions</span>

            </button>


            <button
                class="quick-card"
                data-question="Help me with programming"
            >

                <i class="fa-solid fa-code"></i>

                <span>Study Help</span>

            </button>

        </div>

    `;


    chatBox.appendChild(welcome);


    /* Reconnect quick buttons */

    attachQuickButtons();

}


/* =========================================================
   NEW CHAT / CLEAR BUTTON
========================================================= */

newChatBtn.addEventListener(
    "click",
    clearChat
);


clearBtn.addEventListener(
    "click",
    clearChat
);


/* =========================================================
   QUICK BUTTON HANDLER
========================================================= */

function attachQuickButtons() {

    document
        .querySelectorAll("[data-question]")
        .forEach(button => {

            button.onclick = function () {

                const question =
                    button.dataset.question;


                /*
                   Always send STRING.
                   This prevents PointerEvent problem.
                */

                sendMessage(question);

            };

        });

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

menuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


/* =========================================================
   SIDEBAR ACTION BUTTONS
========================================================= */

document
    .querySelectorAll(".side-action")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.question;


                sendMessage(question);


                sidebar.classList.remove(
                    "open"
                );

            }
        );

    });


/* =========================================================
   VOICE INPUT
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    /* Start voice */

    voiceBtn.addEventListener(
        "click",
        () => {

            recognition.start();


            voiceBtn.classList.add(
                "listening"
            );


            userInput.placeholder =
                "Listening...";

        }
    );


    /* Voice result */

    recognition.onresult =
        function (event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            userInput.value =
                transcript;


            userInput.focus();

        };


    /* Voice ended */

    recognition.onend =
        function () {

            voiceBtn.classList.remove(
                "listening"
            );


            userInput.placeholder =
                "Ask SVKPI AI anything...";

        };


    /* Voice error */

    recognition.onerror =
        function () {

            voiceBtn.classList.remove(
                "listening"
            );


            userInput.placeholder =
                "Ask SVKPI AI anything...";

        };

} else {

    voiceBtn.addEventListener(
        "click",
        () => {

            alert(
                "Voice input is not supported by this browser. Try Google Chrome."
            );

        }
    );

}


/* =========================================================
   SCROLL TO BOTTOM
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
    "✅ SVKPI AI Assistant Frontend Loaded"
);