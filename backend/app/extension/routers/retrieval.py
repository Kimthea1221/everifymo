from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from nlp.retrieval.retrieval import evaluate_match


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
        print_retrieval_summary(result)
        evaluation_result = evaluate_match(request.title)
        return {
            "verdict": evaluation_result["verdict"],
            "registered_cosine_similarity": evaluation_result["top_registered"]["faiss_score"] * 100 if evaluation_result["top_registered"] else None,
            "unregistered_cosine_similarity": evaluation_result["top_unregistered"]["faiss_score"] * 100 if evaluation_result["top_unregistered"] else None,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
