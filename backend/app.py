from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from reviewer import review_code
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
    if not code.strip():
        return jsonify({"error": "No code provided"}), 400
    result = review_code(code, language)
    save_review(language, code, result)
    return jsonify({"review": result})

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
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "CodeLens - AI Code Review Report")
    c.setFont("Helvetica", 10)
    y = 720
    for line in review_text.split("\n"):
        if y < 50:
            c.showPage()
            y = 750
        c.drawString(50, y, line[:100])
        y -= 15
    c.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True,
                     download_name="codelens_report.pdf",
                     mimetype="application/pdf")

if __name__ == "__main__":
    app.run(debug=True, port=5000)