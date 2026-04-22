import os
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Gemini Client
# The new SDK uses the Client class to manage authentication and model calls
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def review_code(code, language):
    """
    Sends code to Gemini 2.0 Flash for a detailed technical review.
    """
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

    try:
        # Using the new SDK syntax: client.models.generate_content
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        # In the new SDK, the text is accessed via response.text
        return response.text

    except Exception as e:
        return f"Error during code review: {str(e)}"

# Example usage (for testing purposes):
if __name__ == "__main__":
    sample_code = "print('Hello ' + name)"
    print(review_code(sample_code, "python"))