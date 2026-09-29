const svkpiAiButton = document.getElementById("svkpiAiButton");
const svkpiAiChat = document.getElementById("svkpiAiChat");
const svkpiAiClose = document.getElementById("svkpiAiClose");
const svkpiAiInput = document.getElementById("svkpiAiInput");
const svkpiAiSend = document.getElementById("svkpiAiSend");
const svkpiAiMessages = document.getElementById("svkpiAiMessages");

svkpiAiButton.addEventListener("click", function () {
    svkpiAiChat.classList.add("show");
    svkpiAiInput.focus();
});

svkpiAiClose.addEventListener("click", function () {
    svkpiAiChat.classList.remove("show");
});

function addUserMessage(message) {

    const messageBox = document.createElement("div");

    messageBox.className = "svkpi-ai-message user";

    messageBox.innerHTML = `
        <div class="svkpi-ai-message-content">
            ${escapeHtml(message)}
        </div>
    `;

    svkpiAiMessages.appendChild(messageBox);

    scrollMessages();
}

function addBotMessage(message) {

    const messageBox = document.createElement("div");

    messageBox.className = "svkpi-ai-message bot";

    messageBox.innerHTML = `
        <div class="svkpi-ai-message-icon">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="svkpi-ai-message-content">
            ${formatBotMessage(message)}
        </div>
    `;

    svkpiAiMessages.appendChild(messageBox);

    scrollMessages();
}

function formatBotMessage(message) {

    return escapeHtml(message)
        .replace(/\n/g, "<br>");
}

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

function scrollMessages() {

    svkpiAiMessages.scrollTop =
        svkpiAiMessages.scrollHeight;
}

async function sendSvkpiAiMessage() {

    const message = svkpiAiInput.value.trim();

    if (!message) {
        return;
    }

    addUserMessage(message);

    svkpiAiInput.value = "";

    svkpiAiInput.disabled = true;
    svkpiAiSend.disabled = true;

    try {

        const response = await fetch("https://meghna-campus-management-system-1.onrender.com/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();

        if (data.reply) {

            addBotMessage(data.reply);

        } else {

            addBotMessage(
                "Sorry, I could not generate a response."
            );

        }

    } catch (error) {

        console.error("SVKPI AI Error:", error);

        addBotMessage(
            "SVKPI AI server is not connected. Please start the Flask backend and try again."
        );

    } finally {

        svkpiAiInput.disabled = false;
        svkpiAiSend.disabled = false;

        svkpiAiInput.focus();
    }
}

svkpiAiSend.addEventListener(
    "click",
    sendSvkpiAiMessage
);

svkpiAiInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendSvkpiAiMessage();
        }

    }
);

