from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.gemini_analyzer import analyze_image

router = APIRouter()


class AnalyzeRequest(BaseModel):
    image_url: str
    description: str = ""
    category: str
    latitude: float
    longitude: float


class AnalyzeResponse(BaseModel):
    accepted: bool
    severity: int | None = None
    reason: str | None = None


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Receives image_url + metadata. Downloads image, runs Gemini vision analysis,
    returns accept/reject with severity.
    """
    print(f"[API] Analyzing: category={request.category}, url={request.image_url[:80]}...")
    try:
        result = await analyze_image(
            image_url=request.image_url,
            category=request.category,
        )
        print(f"[API] Result: {result}")

        if result["is_real_photo"] and result["matches_category"]:
            return AnalyzeResponse(
                accepted=True,
                severity=result["severity"],
            )
        else:
            return AnalyzeResponse(
                accepted=False,
                reason=result.get("rejection_reason", "unknown"),
            )

    except ValueError as e:
        print(f"[API] ValueError: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"[API] Exception: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")