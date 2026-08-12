from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from nlp.retrieval.retrieval import run_retrieval_pipeline


class RetrievalRequest(BaseModel):
    title: str
    top_k: int = 5


router = APIRouter()


@router.post("/verify")
async def verify(request: RetrievalRequest):
    if not request.title or not request.title.strip():
        raise HTTPException(status_code=400, detail="title is required")

    try:
        result = run_retrieval_pipeline(request.title, top_k=request.top_k)
        print(f"Retrieval result: {result}")
        return {"status": "unregistered", **result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
