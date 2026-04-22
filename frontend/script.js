const API = "http://127.0.0.1:5000";

async function reviewCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const output = document.getElementById("output");
    const loader = document.getElementById("loader");
    const outputCard = document.getElementById("outputCard");

    if (!code.trim()) {
        alert("Please paste some code first!");
        return;
    }

    loader.style.display = "block";
    outputCard.style.display = "none";

    try {
        const response = await fetch(`${API}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();
        loader.style.display = "none";
        outputCard.style.display = "block";
        output.innerHTML = formatReview(data.review || data.error);

    } catch (error) {
        loader.style.display = "none";
        outputCard.style.display = "block";
        output.innerHTML = "<p style='color:red'>❌ Error connecting to server!</p>";
    }
}

function formatReview(text) {
    return text
        .replace(/🐛 BUGS:/g, "<span style='color:#ff6b6b;font-weight:bold;font-size:1.1rem'>🐛 BUGS:</span>")
        .replace(/⚡ TIME COMPLEXITY:/g, "<span style='color:#ffd93d;font-weight:bold;font-size:1.1rem'>⚡ TIME COMPLEXITY:</span>")
        .replace(/🔒 SECURITY ISSUES:/g, "<span style='color:#ff9f43;font-weight:bold;font-size:1.1rem'>🔒 SECURITY ISSUES:</span>")
        .replace(/✅ SUGGESTIONS:/g, "<span style='color:#00ff88;font-weight:bold;font-size:1.1rem'>✅ SUGGESTIONS:</span>")
        .replace(/⭐ OVERALL SCORE:/g, "<span style='color:#a29bfe;font-weight:bold;font-size:1.1rem'>⭐ OVERALL SCORE:</span>");
}

async function loadHistory() {
    const historySection = document.getElementById("historySection");
    const historyList = document.getElementById("historyList");

    historySection.style.display = "block";
    historyList.innerHTML = "<p style='padding:20px;color:#666'>Loading...</p>";

    try {
        const response = await fetch(`${API}/history`);
        const data = await response.json();

        if (data.length === 0) {
            historyList.innerHTML = "<p style='padding:20px;color:#666'>No history yet!</p>";
            return;
        }

        historyList.innerHTML = data.map(item => `
            <div class="history-item">
                <strong>${item.language.toUpperCase()}</strong> &nbsp;|&nbsp;
                <span style="color:#666;font-size:0.85rem">${item.created_at}</span>
                <p style="margin-top:8px;color:#a0a0c0;font-size:0.9rem">
                    ${item.review.substring(0, 150)}...
                </p>
            </div>
        `).join("");

    } catch (error) {
        historyList.innerHTML = "<p style='padding:20px;color:red'>Error loading history!</p>";
    }
}

function closeHistory() {
    document.getElementById("historySection").style.display = "none";
}

async function exportPDF() {
    const output = document.getElementById("output").innerText;

    if (!output.trim()) {
        alert("No review to export!");
        return;
    }

    try {
        const response = await fetch(`${API}/export-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review: output })
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codelens_review.pdf";
        a.click();

    } catch (error) {
        alert("Error exporting PDF!");
    }
}

function clearAll() {
    document.getElementById("codeInput").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("outputCard").style.display = "none";
    document.getElementById("historySection").style.display = "none";
    document.getElementById("loader").style.display = "none";
}
async function analyzeCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const analysisSection = document.getElementById("analysisSection");
    const analysisOutput = document.getElementById("analysisOutput");

    if (!code.trim()) {
        alert("Please paste some code first!");
        return;
    }

    analysisSection.style.display = "block";
    analysisOutput.innerHTML = "⏳ Running static analysis...";

    try {
        const response = await fetch(`${API}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();
        analysisOutput.innerHTML = data.analysis || data.error;

    } catch (error) {
        analysisOutput.innerHTML = "❌ Error running analysis!";
    }
}

function closeAnalysis() {
    document.getElementById("analysisSection").style.display = "none";
}