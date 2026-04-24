from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def review_code(code, language, model="llama-3.3-70b-versatile", depth="detailed"):
    depth_prompt = {
        "concise": "Provide a very brief, high-level review highlighting only the most critical issues.",
        "detailed": "Provide a thorough analysis with explanations for each point.",
        "step-by-step": "Explain each issue and suggestion in a simple, step-by-step manner suitable for a complete beginner."
    }

    prompt = f"""
    You are an expert code reviewer. Analyze the following {language} code.
    Level of detail: {depth_prompt.get(depth, depth_prompt['detailed'])}

    Provide your response in this EXACT format:
    🐛 BUGS: [List major bugs or logical errors]
    ⚡ TIME COMPLEXITY: [State complexity and highlight the specific loop or recursion that triggers it]
    🔒 SECURITY ISSUES: [Highlight vulnerabilities like hardcoded secrets or path traversal]
    ✅ SUGGESTIONS: [Specific actionable improvements]
    ⭐ OVERALL SCORE: [Score out of 10, e.g., 7/10]
    📝 SUMMARY: [A concise 2-line summary of the code quality and the single most important fix]

    Code:
    ```{language}
    {code}
    ```
    """
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

def get_improved_code(code, language, model="llama-3.3-70b-versatile"):
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
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
