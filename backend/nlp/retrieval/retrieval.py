from pathlib import Path
import sys
import numpy as np
import faiss

sys.path.append(str(Path(__file__).resolve().parent))
sys.path.append(str(Path(__file__).resolve().parents[1]))

from nlp.common.clean import clean_title
from nlp.retrieval.modelload import load_all_assets


def run_retrieval_pipeline(title: str, top_k: int = 5):
    if not title or not title.strip():
        raise ValueError("title is required")

    assets = load_all_assets()
    model = assets["model"]
    bm25_registered_obj = assets["bm25RegisteredObj"]
    registered = assets["registeredCleanedDf"]
    registered_embeddings_array = assets["registeredEmbeddingsArray"]

    cleaned_query = clean_title(title)
    cleaned_embedded_query = model.encode([cleaned_query])
    cleaned_embedded_query = np.array(cleaned_embedded_query, dtype="float32")
    faiss.normalize_L2(cleaned_embedded_query)
    processed_query = cleaned_embedded_query[0]

    search_query_tokens = cleaned_query.split()
    search_query_scores = bm25_registered_obj.get_scores(search_query_tokens)
    top_registered_scores = np.argsort(search_query_scores)[::-1][: max(top_k, 50)]

    available_title_columns = [
        "full_product_info",
        "PRODUCT_NAME",
        "Product Title",
        "product_name",
    ]
    title_column = next((col for col in available_title_columns if col in registered.columns), None)

    if title_column is None:
        raise KeyError(f"No suitable title column found in dataset. Available columns: {registered.columns.tolist()}")

    top_candidates = []
    for idx in top_registered_scores:
        top_candidates.append({
            "index": int(idx),
            "title": registered.iloc[idx][title_column],
            "bm25_score": float(search_query_scores[idx]),
            "embedding": registered_embeddings_array[idx],
        })

    for candidate in top_candidates:
        candidate["cosine_similarity"] = float(np.dot(processed_query, candidate["embedding"]))

    ranked_candidates = sorted(top_candidates, key=lambda item: item["cosine_similarity"], reverse=True)
    ranked_candidates = [
        {
            "title": candidate["title"],
            "cosine_similarity": candidate["cosine_similarity"],
        }
        for candidate in ranked_candidates[:top_k]
    ]

    return {
        "query": title,
        "cleaned_query": cleaned_query,
        "results": ranked_candidates,
    }
