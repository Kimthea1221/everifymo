from fastapi import FastAPI
#allow frontend running on different domain to communicate safetly to backend
from fastapi.middleware.cors import CORSMiddleware
#for validation
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#define what data extension sends
class productRequest(BaseModel):
    title: str
    platform: str
    url: str

@app.post("/check")
def check_product(product: productRequest):
    print(f"Recieved: {product.title} from {product.platform}")

    return {
        "title": product.title,
        "status": "mock_result",
        "registered": True,
        "message": "For testing purpose only. Real validation is not connected yet."
    }