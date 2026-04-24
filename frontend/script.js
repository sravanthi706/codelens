const API = "http://127.0.0.1:5000";

// Global Settings State
let settings = {
    model: "llama-3.3-70b-versatile",
    depth: "detailed",
    accent: "#7c3aed",
    saveHistory: true
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    checkServerStatus();
    setInterval(checkServerStatus, 10000);
});

async function checkServerStatus() {
    const dot = document.getElementById("statusDot");
    const text = document.getElementById("statusText");
    try {
        const res = await fetch(`${API}/history`);
        if (res.ok) {
            dot.className = "status-dot online";
            text.innerText = "System Online";
        }
    } catch (e) {
        dot.className = "status-dot offline";
        text.innerText = "System Offline";
    }
}

function loadSettings() {
    const saved = localStorage.getItem('codelens_settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    
    // Apply UI Settings
    document.getElementById('settingModel').value = settings.model;
    document.getElementById('settingSaveHistory').checked = settings.saveHistory;
    document.querySelector(`input[name="depth"][value="${settings.depth}"]`).checked = true;
    applyAccent(settings.accent);
}

function saveSettings() {
    settings.model = document.getElementById('settingModel').value;
    settings.saveHistory = document.getElementById('settingSaveHistory').checked;
    settings.depth = document.querySelector('input[name="depth"]:checked').value;
    
    localStorage.setItem('codelens_settings', JSON.stringify(settings));
    
    // Visual feedback
    const saveBtn = document.querySelector('#settingsSection .btn-primary');
    const originalText = saveBtn.innerText;
    saveBtn.innerText = "✅ Saved!";
    setTimeout(() => { saveBtn.innerText = originalText; }, 2000);
    
    showSection('editor'); // Go back to dashboard
}

function setAccent(color) {
    settings.accent = color;
    applyAccent(color);
}

function applyAccent(color) {
    document.documentElement.style.setProperty('--accent-primary', color);
    
    // Update active state in color picker
    document.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('active');
        if (s.style.backgroundColor === color || rgbToHex(s.style.backgroundColor) === color) {
            s.classList.add('active');
        }
    });
}

function rgbToHex(rgb) {
    if (!rgb) return "";
    const vals = rgb.match(/\d+/g);
    if (!vals) return rgb;
    return "#" + vals.map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function showSection(sectionId) {
    // Update Nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });

    // Hide all
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';

    // Show target
    if (sectionId === 'editor') {
        document.getElementById('editorSection').style.display = 'block';
    } else if (sectionId === 'history') {
        document.getElementById('historySection').style.display = 'block';
        loadHistory();
    } else if (sectionId === 'settings') {
        document.getElementById('settingsSection').style.display = 'block';
    }
}

async function reviewCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const output = document.getElementById("output");
    const loader = document.getElementById("loader");
    const resultsArea = document.getElementById("resultsArea");

    if (!code.trim()) { alert("Please paste some code first!"); return; }

    loader.style.display = "flex";
    resultsArea.style.display = "none";

    try {
        const response = await fetch(`${API}/review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code, 
                language,
                model: settings.model,
                depth: settings.depth
            })
        });
        const data = await response.json();
        loader.style.display = "none";
        resultsArea.style.display = "block";
        output.innerHTML = formatReview(data.review || data.error);
    } catch (error) {
        loader.style.display = "none";
        resultsArea.style.display = "block";
        output.innerHTML = "<p style='color:var(--error)'>❌ Error connecting to server!</p>";
    }
}

function formatReview(text) {
    if (!text || typeof text !== 'string') return "No review content available.";

    const sections = {
        bugs: { title: "Bugs & Errors", icon: "bug", color: "var(--error)", content: "" },
        complexity: { title: "Complexity", icon: "zap", color: "var(--warning)", content: "" },
        security: { title: "Security", icon: "shield-alert", color: "#fb923c", content: "" },
        suggestions: { title: "Suggestions", icon: "lightbulb", color: "var(--success)", content: "" },
        score: { title: "Overall Score", icon: "star", color: "var(--accent-secondary)", content: "" },
        summary: { title: "AI Summary", icon: "file-text", color: "var(--accent-primary)", content: "" }
    };

    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach(line => {
        if (line.includes("🐛 BUGS:")) currentSection = "bugs";
        else if (line.includes("⚡ TIME COMPLEXITY:")) currentSection = "complexity";
        else if (line.includes("🔒 SECURITY ISSUES:")) currentSection = "security";
        else if (line.includes("✅ SUGGESTIONS:")) currentSection = "suggestions";
        else if (line.includes("⭐ OVERALL SCORE:")) currentSection = "score";
        else if (line.includes("📝 SUMMARY:")) currentSection = "summary";
        else if (currentSection && line.trim()) {
            sections[currentSection].content += line.trim() + " ";
        }
    });

    // Parse numeric score
    let scoreMatch = sections.score.content.match(/(\d+)\s*\/\s*10/);
    let scoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 5;
    let percentage = scoreValue * 10;
    let strokeDash = (percentage / 100) * 283; // 2 * PI * R (R=45)

    let html = "";
    
    // Render Score Card First
    html += `
        <div class="result-item score-card-premium" style="grid-column: 1 / -1">
            <div class="score-visual">
                <svg viewBox="0 0 100 100">
                    <circle class="score-bg" cx="50" cy="50" r="45"></circle>
                    <circle class="score-fill" cx="50" cy="50" r="45" style="stroke-dasharray: ${strokeDash} 283"></circle>
                    <text x="50" y="55" class="score-text">${scoreValue}</text>
                    <text x="50" y="70" class="score-subtext">/ 10</text>
                </svg>
            </div>
            <div class="score-info">
                <h3><i data-lucide="award"></i> Code Quality Analysis</h3>
                <p class="summary-text">${sections.summary.content || "Code analysis complete."}</p>
                <div class="score-labels">
                    <span class="badge ${scoreValue > 7 ? 'good' : scoreValue > 4 ? 'avg' : 'bad'}">
                        ${scoreValue > 7 ? 'Excellent' : scoreValue > 4 ? 'Needs Work' : 'Critical'}
                    </span>
                </div>
            </div>
        </div>
    `;

    // Render other sections
    for (const key in sections) {
        if (key === 'score' || key === 'summary') continue;
        const s = sections[key];
        html += `
            <div class="result-item">
                <h3 style="color: ${s.color}"><i data-lucide="${s.icon}"></i> ${s.title}</h3>
                <p>${s.content.trim() || "No significant issues found."}</p>
            </div>
        `;
    }
    
    setTimeout(() => lucide.createIcons(), 10);
    return html;
}

async function improveCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const improveSection = document.getElementById("improveSection");
    const improveOutput = document.getElementById("improveOutput");
    const loader = document.getElementById("loader");

    if (!code.trim()) { alert("Please paste some code first!"); return; }

    loader.style.display = "flex";
    improveSection.style.display = "none";

    try {
        const response = await fetch(`${API}/improve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code, 
                language,
                model: settings.model
            })
        });
        const data = await response.json();
        loader.style.display = "none";
        improveSection.style.display = "block";
        improveOutput.innerHTML = formatImprovement(data.improvement || data.error);
    } catch (error) {
        loader.style.display = "none";
        improveSection.style.display = "block";
        improveOutput.innerHTML = "<p style='color:var(--error)'>❌ Error connecting to AI server!</p>";
    }
}

function formatImprovement(text) {
    const parts = text.split(/📌 ISSUE \d+:/);
    let html = "";

    parts.forEach((part, i) => {
        if (!part.trim()) return;
        
        const beforeMatch = part.match(/❌ BEFORE:([\s\S]*?)✅ AFTER:/);
        const afterMatch = part.match(/✅ AFTER:([\s\S]*)/);
        const issueTitle = part.split('❌ BEFORE:')[0].trim();

        if (beforeMatch && afterMatch) {
            html += `
                <div class="improvement-card">
                    <div class="issue-header">Issue ${i}: ${issueTitle}</div>
                    <div class="diff-view">
                        <div class="diff-box before">
                            <label>Before</label>
                            <pre><code>${beforeMatch[1].trim()}</code></pre>
                        </div>
                        <div class="diff-box after">
                            <label>After</label>
                            <pre><code>${afterMatch[1].trim()}</code></pre>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    return html || `<div class="result-item">${text}</div>`;
}

async function analyzeCode() {
    const code = document.getElementById("codeInput").value;
    const language = document.getElementById("language").value;
    const resultsArea = document.getElementById("resultsArea");
    const output = document.getElementById("output");

    if (!code.trim()) { alert("Please paste some code first!"); return; }

    resultsArea.style.display = "block";
    output.innerHTML = "<div class='loader-mini'></div> Running static analysis...";

    try {
        const response = await fetch(`${API}/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language })
        });
        const data = await response.json();
        output.innerHTML = `
            <div class="result-item" style="grid-column: 1 / -1">
                <h3><i data-lucide="search"></i> Static Analysis</h3>
                <pre class="analysis-pre">${data.analysis || data.error}</pre>
            </div>
        `;
        lucide.createIcons();
    } catch (error) {
        output.innerHTML = "❌ Error running analysis!";
    }
}

let fullHistory = [];

async function loadHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "<div class='loader-mini'></div> Loading your history...";

    try {
        const response = await fetch(`${API}/history`);
        fullHistory = await response.json();
        renderHistoryItems(fullHistory);
    } catch (error) {
        historyList.innerHTML = "<p style='padding:20px;color:var(--error)'>Error loading history!</p>";
    }
}

function renderHistoryItems(items) {
    const historyList = document.getElementById("historyList");
    if (items.length === 0) {
        historyList.innerHTML = "<p style='padding:20px;color:var(--text-secondary)'>No matching history found.</p>";
        return;
    }

    historyList.innerHTML = items.map(item => `
        <div class="history-card" onclick="viewHistoryItem(${item.id})">
            <div class="history-meta">
                <span class="lang-tag">${item.language}</span>
                <span class="date-tag">${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <div class="history-preview">${item.review.substring(0, 150)}...</div>
        </div>
    `).join("");
}

function filterHistory() {
    const searchTerm = document.getElementById("historySearch").value.toLowerCase();
    const filterLang = document.getElementById("historyFilter").value;

    const filtered = fullHistory.filter(item => {
        const matchesSearch = item.review.toLowerCase().includes(searchTerm);
        const matchesLang = filterLang === "all" || item.language.toLowerCase() === filterLang;
        return matchesSearch && matchesLang;
    });

    renderHistoryItems(filtered);
}

function closeImprove() { document.getElementById("improveSection").style.display = "none"; }

function clearAll() {
    document.getElementById("codeInput").value = "";
    document.getElementById("output").innerHTML = "";
    document.getElementById("resultsArea").style.display = "none";
    document.getElementById("improveSection").style.display = "none";
    document.getElementById("loader").style.display = "none";
}

async function exportPDF() {
    const output = document.getElementById("output").innerText;
    if (!output.trim()) { alert("No review to export!"); return; }

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

function resetSettings() {
    localStorage.removeItem('codelens_settings');
    location.reload();
}

// Custom Dropdown Logic
function toggleDropdown() {
    const options = document.getElementById('langOptions');
    options.classList.toggle('show');
}

function selectLang(val, label, icon) {
    // Update hidden input
    document.getElementById('language').value = val;
    
    // Update display
    document.getElementById('selectedLangDisplay').innerHTML = `
        <i data-lucide="${icon}" style="margin-right: 8px;"></i> 
        <span>${label}</span>
    `;
    
    // Update active state
    document.querySelectorAll('.custom-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.textContent.trim() === label) {
            opt.classList.add('selected');
        }
    });
    
    // Close dropdown
    toggleDropdown();
    
    // Re-create icons
    lucide.createIcons();
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.custom-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const options = document.getElementById('langOptions');
        if (options) options.classList.remove('show');
    }
});
