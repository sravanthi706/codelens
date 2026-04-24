import asyncio
from playwright.async_api import async_playwright
import os

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Ensure screenshot dir exists
        os.makedirs("../frontend/assets/screenshots", exist_ok=True)
        
        # 1. Capture Main Page
        print("Capturing main.png...")
        await page.goto("http://127.0.0.1:5000")
        await page.wait_for_selector(".logo-area")
        await page.screenshot(path="../frontend/assets/screenshots/main.png", full_page=True)
        
        # 2. Capture Static Analysis
        print("Capturing analysis.png...")
        code = 'def hello():\n    print("Hello CodeLens")\n\nhello()'
        await page.fill("#codeInput", code)
        await page.click("button:has-text('Static Analysis')")
        await page.wait_for_selector(".analysis-pre")
        await asyncio.sleep(1) # Wait for animation
        await page.screenshot(path="../frontend/assets/screenshots/analysis.png", full_page=True)
        
        # 3. Capture AI Review
        print("Capturing review.png...")
        await page.click("button:has-text('AI Review')")
        # Wait for results card
        await page.wait_for_selector(".result-item", timeout=60000)
        await asyncio.sleep(2) # Wait for fade-in
        await page.screenshot(path="../frontend/assets/screenshots/review.png", full_page=True)
        
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(capture())
