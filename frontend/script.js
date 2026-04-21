const API = "http://127.0.0.1:5000";

async function reviewCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const output = document.getElementById("output");

    if (!code.trim()) {
        output.innerHTML = "<p style='color:red'>Please paste some code first!</p>";
        return;
    }

    output.innerHTML = "<p style='color:#7c3aed'>⏳ Analyzing your code with AI...</p>";

    try {
        const response = await fetch(`${API}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();
        output.innerHTML = data.review || data.error;
    } catch (error) {
        output.innerHTML = "<p style='color:red'>❌ Error connecting to server!</p>";
    }
}

async function loadHistory() {
    const historySection = document.getElementById("historySection");
    const historyList = document.getElementById("historyList");

    historySection.style.display = "block";
    historyList.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`${API}/history`);
        const data = await response.json();

        if (data.length === 0) {
            historyList.innerHTML = "<p>No history yet!</p>";
            return;
        }

        historyList.innerHTML = data.map(item => `
            <div class="history-item">
                <strong>Language:</strong> ${item.language} |
                <strong>Date:</strong> ${item.created_at}<br><br>
                ${item.review.substring(0, 200)}...
            </div>
        `).join("");
    } catch (error) {
        historyList.innerHTML = "<p style='color:red'>Error loading history!</p>";
    }
}

function clearAll() {
    document.getElementById("codeInput").value = "";
    document.getElementById("output").innerHTML = "<p class='placeholder'>Your AI review will appear here...</p>";
    document.getElementById("historySection").style.display = "none";
}
