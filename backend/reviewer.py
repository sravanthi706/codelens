import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def review_code(code, language):
    prompt = f"""
    You are an expert code reviewer. Analyze the following {language} code and provide:

    1. 🐛 BUGS: List any bugs or errors found
    2. ⚡ TIME COMPLEXITY: Big-O analysis
    3. 🔒 SECURITY ISSUES: Any vulnerabilities
    4. ✅ SUGGESTIONS: How to improve the code
    5. ⭐ OVERALL SCORE: Rate the code out of 10

    Code:
```{language}
    {code}
```

    Be specific, clear, and beginner-friendly.
    """
    response = model.generate_content(prompt)
    return response.text

def get_improved_code(code, language):
    prompt = f"""
    You are an expert code reviewer.
    Show BEFORE and AFTER comparison for this {language} code.
    Format your response EXACTLY like this:

    📌 ISSUE 1: [describe the issue]

    ❌ BEFORE:
    [original problematic code]
    ✅ AFTER:
    [improved code]
    Show maximum 3 most important improvements only.

    Code to analyze:
```{language}
    {code}
```
    """
    response = model.generate_content(prompt)
    return response.text

