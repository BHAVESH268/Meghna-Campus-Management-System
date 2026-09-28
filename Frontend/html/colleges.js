const svkpiAiLauncher = document.getElementById("svkpiAiLauncher");
const svkpiAiChat = document.getElementById("svkpiAiChat");
const svkpiAiClose = document.getElementById("svkpiAiClose");
const svkpiAiMinimize = document.getElementById("svkpiAiMinimize");
const svkpiAiInput = document.getElementById("svkpiAiInput");
const svkpiAiSend = document.getElementById("svkpiAiSend");
const svkpiAiMessages = document.getElementById("svkpiAiMessages");

if (svkpiAiLauncher) {
    svkpiAiLauncher.addEventListener("click", () => {
        svkpiAiChat.classList.add("active");
        svkpiAiLauncher.classList.add("hidden");
        svkpiAiInput.focus();
    });
}

if (svkpiAiClose) {
    svkpiAiClose.addEventListener("click", () => {
        svkpiAiChat.classList.remove("active");
        svkpiAiLauncher.classList.remove("hidden");
    });
}

if (svkpiAiMinimize) {
    svkpiAiMinimize.addEventListener("click", () => {
        svkpiAiChat.classList.remove("active");
        svkpiAiLauncher.classList.remove("hidden");
    });
}

function addSVKPIUserMessage(message) {
    const messageDiv = document.createElement("div");

    messageDiv.className = "svkpi-ai-message user";

    messageDiv.innerHTML = `
        <div class="svkpi-ai-bubble">
            <p>${escapeSVKPIHtml(message)}</p>
        </div>
    `;

    svkpiAiMessages.appendChild(messageDiv);
    svkpiAiMessages.scrollTop = svkpiAiMessages.scrollHeight;
}

function addSVKPIBotMessage(message) {
    const messageDiv = document.createElement("div");

    messageDiv.className = "svkpi-ai-message bot";

    messageDiv.innerHTML = `
        <div class="svkpi-ai-message-icon">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="svkpi-ai-bubble">
            <p>${escapeSVKPIHtml(message).replace(/\n/g, "<br>")}</p>
        </div>
    `;

    svkpiAiMessages.appendChild(messageDiv);
    svkpiAiMessages.scrollTop = svkpiAiMessages.scrollHeight;
}

function addSVKPIThinking() {
    const messageDiv = document.createElement("div");

    messageDiv.className = "svkpi-ai-message bot";
    messageDiv.id = "svkpiAiThinking";

    messageDiv.innerHTML = `
        <div class="svkpi-ai-message-icon">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="svkpi-ai-bubble svkpi-ai-typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    svkpiAiMessages.appendChild(messageDiv);
    svkpiAiMessages.scrollTop = svkpiAiMessages.scrollHeight;
}

function removeSVKPIThinking() {
    const thinking = document.getElementById("svkpiAiThinking");

    if (thinking) {
        thinking.remove();
    }
}

function escapeSVKPIHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

async function sendSVKPIMessage(message = null) {
    const question = message || svkpiAiInput.value.trim();

    if (!question) {
        return;
    }

    addSVKPIUserMessage(question);

    svkpiAiInput.value = "";

    addSVKPIThinking();

    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question
            })
        });

        const data = await response.json();

        removeSVKPIThinking();

        if (data.reply) {
            addSVKPIBotMessage(data.reply);
        } else {
            addSVKPIBotMessage(
                "Sorry, I could not understand the response from the SVKPI AI backend."
            );
        }

    } catch (error) {
        removeSVKPIThinking();

        addSVKPIBotMessage(
            "SVKPI AI backend is not connected. Please make sure your Flask backend is running on port 5000."
        );

        console.error("SVKPI AI Error:", error);
    }
}

if (svkpiAiSend) {
    svkpiAiSend.addEventListener("click", () => {
        sendSVKPIMessage();
    });
}

if (svkpiAiInput) {
    svkpiAiInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendSVKPIMessage();
        }
    });
}

document.querySelectorAll(".svkpi-ai-quick-options button").forEach(button => {
    button.addEventListener("click", () => {
        const question = button.getAttribute("data-question");

        if (question) {
            sendSVKPIMessage(question);
        }
    });
});