const API_KEY = "AIzaSyAHxrkPsyPPbM67iHsGvaWm-O0x1pu_lQk";  // Replace with your Google Gemini API Key
// https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent

const chatBox = document.getElementById("chat-box");

document.addEventListener("DOMContentLoaded", () => {
    const chatHistory = localStorage.getItem("chatHistory");
    if (chatHistory) {
        chatBox.innerHTML = chatHistory;
    }
    chatBox.scrollTop = chatBox.scrollHeight;
});

async function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (!userInput) return;

    // Display user message
    chatBox.innerHTML += `<div class="user-msg">${userInput}</div>`;
    updateChatHistory();
    document.getElementById("user-input").value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show "AI is typing..." indicator
    let typingIndicator = document.createElement("div");
    typingIndicator.className = "bot-msg typing-indicator";
    typingIndicator.innerHTML = "AI is typing...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        let response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userInput }] }]
            })
        });

        let data = await response.json();
        let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";

        // Remove "AI is typing..." and show formatted response
        typingIndicator.remove();
        chatBox.innerHTML += `<div class="bot-msg">${formatResponse(botReply)}</div>`;
        updateChatHistory();
    } catch (error) {
        typingIndicator.remove();
        chatBox.innerHTML += `<div class="bot-msg">Error: Unable to connect to AI</div>`;
        updateChatHistory();
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}


function updateChatHistory() {
    localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function clearChat() {
    if (confirm("Are you sure you want to clear the chat?")) {
        localStorage.removeItem("chatHistory");
        document.getElementById("chat-box").innerHTML = "";
    }
}

function formatResponse(response) {
    let formattedText = response;

    // Convert **bold text** to HTML bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic text* to HTML italic
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert new lines to proper paragraphs
    formattedText = formattedText.replace(/\n{2,}/g, "</p><p>");
    formattedText = `<p>${formattedText}</p>`; // Wrap the response in <p>

    // Convert bullet points (- or •) to <ul><li>
    formattedText = formattedText.replace(/(\n|^)[•-] (.*?)(?=\n|$)/g, "<li>$2</li>");
    formattedText = formattedText.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

    // Convert ```code blocks``` into proper HTML <pre><code>
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert inline `code` snippets
    formattedText = formattedText.replace(/`(.*?)`/g, "<code>$1</code>");

    return formattedText;
}

