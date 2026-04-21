from flask import Flask, request, jsonify
from flask_cors import CORS
from reviewer import review_code
from database import init_db, save_review, get_history

app = Flask(__name__)
CORS(app)
init_db()

@app.route("/")
def home():
    return "<h1>CodeLens is Running! ✅</h1>"

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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
