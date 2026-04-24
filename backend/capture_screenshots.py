import asyncio
from playwright.async_api import async_playwright
import os

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Use a professional 1280x800 viewport
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        
        # Ensure screenshot dir exists
        os.makedirs("../frontend/assets/screenshots", exist_ok=True)
        
        # 1. Capture Main Page
        print("Capturing main.png...")
        await page.goto("http://127.0.0.1:5000")
        await page.wait_for_selector(".logo-area")
        await page.screenshot(path="../frontend/assets/screenshots/main.png")
        
        # 2. Capture Static Analysis
        print("Capturing analysis.png...")
        code = 'def hello():\n    print("Hello CodeLens")\n\nhello()'
        await page.fill("#codeInput", code)
        await page.click("button:has-text('Static Analysis')")
        await page.wait_for_selector(".analysis-pre")
        await asyncio.sleep(1) # Wait for animation
        await page.screenshot(path="../frontend/assets/screenshots/analysis.png")
        
        # 3. Capture AI Review
        print("Capturing review.png...")
        await page.click("button:has-text('AI Review')")
        # Wait for results card
        await page.wait_for_selector(".score-card-premium", timeout=60000)
        await asyncio.sleep(2) # Wait for fade-in
        await page.screenshot(path="../frontend/assets/screenshots/review.png")
        
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(capture())
