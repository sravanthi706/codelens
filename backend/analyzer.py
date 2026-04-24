import subprocess
import tempfile
import os

def analyze_python_code(code):
    try:
        # Write code to temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', 
                                          delete=False) as f:
            f.write(code)
            temp_file = f.name

        # Run pylint
        result = subprocess.run(
            ['python', '-m', 'pylint', temp_file, 
             '--output-format=text',
             '--score=yes'],
            capture_output=True,
            text=True
        )

        output = result.stdout + result.stderr

        # Strip local paths for a cleaner output
        output = output.replace(temp_file, "code.py")

        # Clean up temp file
        os.unlink(temp_file)

        if not output.strip():
            return "✅ No issues found by static analyzer!"

        return output

    except Exception as e:
        return f"Static analysis error: {str(e)}"