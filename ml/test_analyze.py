import asyncio
from services.gemini_analyzer import analyze_image

async def main():
    url = "https://wnrfvduiibnkfinkzimq.supabase.co/storage/v1/object/public/report-images/c3fceb0a-185f-488e-b5b3-aa7fa718f2c8_1776490344974.jpg"
    try:
        result = await analyze_image(image_url=url, category="pothole")
        print(f"Result: {result}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}")

asyncio.run(main())
