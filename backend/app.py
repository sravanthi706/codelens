from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from reviewer import review_code, get_improved_code
from database import init_db, save_review, get_history
from analyzer import analyze_python_code
import os
import io

app = Flask(__name__, static_folder='../frontend')
CORS(app)
init_db()

@app.route("/")
def home():
    return send_from_directory('../frontend', 'index.html')

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory('../frontend', filename)

@app.route("/review", methods=["POST"])
def review():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")
    model = data.get("model", "llama-3.3-70b-versatile")
    depth = data.get("depth", "detailed")
    
    if not code.strip():
        return jsonify({"error": "No code provided"}), 400
        
    result = review_code(code, language, model, depth)
    save_review(language, code, result)
    return jsonify({"review": result})

@app.route("/improve", methods=["POST"])
def improve():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")
    if not code.strip():
        return jsonify({"error": "No code provided"}), 400
    result = get_improved_code(code, language)
    return jsonify({"improvement": result})

@app.route("/history", methods=["GET"])
def history():
    rows = get_history()
    history_list = [
        {"id": r[0], "language": r[1], "created_at": r[2], "review": r[3]}
        for r in rows
    ]
    return jsonify(history_list)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    code = data.get("code", "")
    language = data.get("language", "python")
    if language != "python":
        return jsonify({"analysis": "⚠️ Static analysis only available for Python!"})
    if not code.strip():
        return jsonify({"error": "No code provided"}), 400
    result = analyze_python_code(code)
    return jsonify({"analysis": result})

@app.route("/export-pdf", methods=["POST"])
def export_pdf():
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    data = request.json
    review_text = data.get("review", "")
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 20)
    c.setStrokeColorRGB(0.48, 0.22, 0.93) # Accent color #7c3aed
    c.drawString(50, 750, "CodeLens")
    c.setFont("Helvetica", 10)
    c.drawString(50, 735, "AI-Powered Code Review Report")
    c.line(50, 730, 550, 730)
    
    c.setFont("Helvetica", 9)
    y = 700
    for line in review_text.split("\n"):
        if y < 50:
            c.showPage()
            y = 750
        # Simple word wrap
        if len(line) > 90:
            c.drawString(50, y, line[:90])
            y -= 12
            c.drawString(50, y, line[90:])
        else:
            c.drawString(50, y, line)
        y -= 15
    c.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True,
                     download_name="codelens_report.pdf",
                     mimetype="application/pdf")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)