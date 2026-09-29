# ADDED: imports and local artifact loading for standalone module execution.
import pickle
import re
import sys
from collections import Counter
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR.parent.parent))

import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from nlp.common.clean import clean_title


ASSET_DIR = BASE_DIR.parent / "assets"

finetuned_model = SentenceTransformer(str(BASE_DIR.parent / "finetuned_sbert"))

with open(ASSET_DIR / "bm25_registered.pkl", "rb") as file:
    bm25_registered = pickle.load(file)

with open(ASSET_DIR / "bm25_unregistered.pkl", "rb") as file:
    bm25_unregistered = pickle.load(file)

registered_index = faiss.read_index(str(ASSET_DIR / "faiss_registered.index"))
unregistered_index = faiss.read_index(str(ASSET_DIR / "faiss_unregistered.index"))

sbert_registered_embeddings_finetuned = np.load(
    ASSET_DIR / "sbert_registered_embeddings_finetuned.npy"
)
sbert_unregistered_embeddings_finetuned = np.load(
    ASSET_DIR / "sbert_unregistered_embeddings_finetuned.npy"
)

registered = pd.read_pickle(ASSET_DIR / "Registered_cleaned.pkl")
unregistered = pd.read_pickle(ASSET_DIR / "Unregistered_cleaned.pkl")


VOCAB = Counter()
for col in ("PRODUCT_NAME", "BRAND_NAME"):
    for t in registered[col].dropna():
        VOCAB.update(str(t).split())

MIN_TOKENS = 3
MIN_KNOWN_RATIO = 0.4

BRAND_INDEX = {str(b): list(v) for b, v in registered.groupby("BRAND_NAME").indices.items()}

BRAND_BONUS = 0.05
BRAND_THRESHOLD = 0.65


def _is_gibberish_token(t):
    if len(t) > 3 and not re.search(r"[aeiouy]", t):
        return True
    if re.search(r"(.)\1{3,}", t):
        return True
    return False


def validate_query(query):
    toks = clean_title(query).split()

    if len(toks) < MIN_TOKENS:
        return False, "Title too short to verify"

    alpha = [t for t in toks if re.search(r"[a-z]", t)]
    if len(alpha) < 2:
        return False, "Not enough readable words"

    if sum(_is_gibberish_token(t) for t in alpha) / len(alpha) > 0.5:
        return False, "Text looks like gibberish"

    if sum(t in VOCAB for t in alpha) / len(alpha) < MIN_KNOWN_RATIO:
        return False, "Unrecognized words"

    return True, None


def trim_listing_title(text):
    return re.split(r"\s[-–|]\s", text, maxsplit=1)[0].strip()


def brand_row_indices(cleaned_query):
    toks = cleaned_query.split()
    rows = []
    for n in range(1, 5):
        for i in range(len(toks) - n + 1):
            g = " ".join(toks[i:i + n])
            if len(g) >= 3 and g in BRAND_INDEX:
                rows.extend(BRAND_INDEX[g])
    return list(dict.fromkeys(rows))


def score_brand_rows(cleaned_query, rows):
    qv = finetuned_model.encode([cleaned_query]).astype("float32")
    faiss.normalize_L2(qv)
    q_tokens = set(cleaned_query.split())
    scored = []
    for idx in rows:
        cos = float(np.dot(qv[0], sbert_registered_embeddings_finetuned[idx]))
        name_tokens = set(str(registered.loc[idx, "PRODUCT_NAME"]).split())
        contain = len(name_tokens & q_tokens) / max(len(name_tokens), 1)
        score = min(1.0, max(cos, 0.5 * cos + 0.5 * contain) + BRAND_BONUS)
        scored.append({
            "index": idx,
            "title": registered.loc[idx, "full_product_info"],
            "faiss_score": score,
            "cosine": cos,
            "containment": contain,
            "brand_match": True
        })
    return sorted(scored, key=lambda x: x["faiss_score"], reverse=True)


# UNCHANGED: original retrieval helpers and functions.
def add_missing_cosine_scores(combined, embeddings, query_vec):
    """Fill in cosine similarity for candidates that BM25 found but FAISS didn't surface."""
    q = query_vec[0]
    for idx, scores in combined.items():
        if "faiss_score" not in scores:
            scores["faiss_score"] = float(np.dot(q, embeddings[idx]))
    return combined


def retrieve(query, protected_vocab=None):
    cleaned_query = clean_title(query)
    query_tokens = cleaned_query.split()

    query_vec = finetuned_model.encode([cleaned_query]).astype("float32")
    faiss.normalize_L2(query_vec)

    # ---- Registered ----
    bm25_scores_reg = bm25_registered.get_scores(query_tokens)
    bm25_top_idx_reg = np.argsort(bm25_scores_reg)[::-1][:50]

    faiss_scores_reg, faiss_top_idx_reg = registered_index.search(query_vec, 50)
    faiss_top_idx_reg = faiss_top_idx_reg[0]
    faiss_scores_reg = faiss_scores_reg[0]

    combined_reg = {}
    for idx, score in zip(bm25_top_idx_reg, bm25_scores_reg[bm25_top_idx_reg]):
        combined_reg[int(idx)] = {"bm25_score": float(score)}
    for idx, score in zip(faiss_top_idx_reg, faiss_scores_reg):
        combined_reg.setdefault(int(idx), {})["faiss_score"] = float(score)

    combined_reg = add_missing_cosine_scores(combined_reg, sbert_registered_embeddings_finetuned, query_vec)

    candidates_reg = []
    for idx, scores in combined_reg.items():
        candidates_reg.append({
            "index": idx,
            "title": registered.loc[idx, 'full_product_info'],
            **scores
        })

    # ---- Unregistered ----
    bm25_scores_unreg = bm25_unregistered.get_scores(query_tokens)
    bm25_top_idx_unreg = np.argsort(bm25_scores_unreg)[::-1][:50]

    faiss_scores_unreg, faiss_top_idx_unreg = unregistered_index.search(query_vec, 50)
    faiss_top_idx_unreg = faiss_top_idx_unreg[0]
    faiss_scores_unreg = faiss_scores_unreg[0]

    combined_unreg = {}
    for idx, score in zip(bm25_top_idx_unreg, bm25_scores_unreg[bm25_top_idx_unreg]):
        combined_unreg[int(idx)] = {"bm25_score": float(score)}
    for idx, score in zip(faiss_top_idx_unreg, faiss_scores_unreg):
        combined_unreg.setdefault(int(idx), {})["faiss_score"] = float(score)

    combined_unreg = add_missing_cosine_scores(combined_unreg, sbert_unregistered_embeddings_finetuned, query_vec)

    candidates_unreg = []
    for idx, scores in combined_unreg.items():
        candidates_unreg.append({
            "index": idx,
            "title": unregistered.loc[idx, 'Product Title'],
            **scores
        })

    return {
        "query": query,
        "query_tokens": query_tokens,
        "registered": candidates_reg,
        "unregistered": candidates_unreg
    }


def evaluate_match(query):
    threshold = 0.7
    search_query = trim_listing_title(query)

    valid, reason = validate_query(search_query)
    if not valid:
        print(f"Query: {query}")
        print(f"\n  → VERDICT: NO MATCH ({reason})")
        return {
            "query": query,
            "verdict": "no_match",
            "reason": reason,
            "score": None,
            "threshold": threshold,
            "brand_conflict_flagged": False,
            "top_registered": None,
            "top_unregistered": None,
            "top5_registered": []
        }

    cleaned_query = clean_title(search_query)
    result = retrieve(search_query)

    brand_rows = brand_row_indices(cleaned_query)
    brand_flag = False

    if brand_rows:
        ranked_registered = score_brand_rows(cleaned_query, brand_rows)
        active_threshold = BRAND_THRESHOLD
    else:
        ranked = sorted(result["registered"], key=lambda x: x.get("faiss_score", 0), reverse=True)
        ranked_registered = [c for c in ranked if not brand_conflicts(search_query, c["index"], registered)]
        brand_flag = not ranked_registered and bool(ranked)
        active_threshold = threshold

    top_registered = ranked_registered[0] if ranked_registered else None
    top_unregistered = max(result["unregistered"], key=lambda x: x.get("faiss_score", 0), default=None)

    # ---- Top 5 registered candidates, for visibility only — does not affect verdict ----
    top5_registered = ranked_registered[:5]

    reg_score = top_registered["faiss_score"] if top_registered else -1
    unreg_score = top_unregistered["faiss_score"] if top_unregistered else -1

    print(f"Query: {query}")

    print(f"\n  Top 5 REGISTERED candidates:")
    for i, c in enumerate(top5_registered, 1):
        print(f"    {i}. {c['title']} (score: {c.get('faiss_score', 0):.4f})")

    reg_qualifies = reg_score >= active_threshold
    unreg_qualifies = unreg_score >= threshold

    if not reg_qualifies and not unreg_qualifies:
        print(f"\n  → VERDICT: NO CONFIDENT MATCH")
        verdict = "no_match"
        winning_score = max(reg_score, unreg_score)
    elif reg_qualifies and not unreg_qualifies:
        print(f"\n  → VERDICT: REGISTERED (confidence: {reg_score:.4f})")
        verdict = "registered"
        winning_score = reg_score
    elif unreg_qualifies and not reg_qualifies:
        print(f"\n  → VERDICT: UNREGISTERED (confidence: {unreg_score:.4f})")
        verdict = "unregistered"
        winning_score = unreg_score
    else:
        if reg_score + (0.1 if brand_rows else 0) >= unreg_score:
            print(f"\n  → VERDICT: REGISTERED")
            verdict = "registered"
            winning_score = reg_score
        else:
            print(f"\n  → VERDICT: UNREGISTERED")
            verdict = "unregistered"
            winning_score = unreg_score

    return {
        "query": query,
        "verdict": verdict,
        "reason": None,
        "score": winning_score,
        "threshold": active_threshold,
        "brand_conflict_flagged": brand_flag,
        "top_registered": top_registered,
        "top_unregistered": top_unregistered,
        "top5_registered": top5_registered
    }

    # ===== Brand-conflict check — Track 1 ===== #


def brand_conflicts(query, candidate_index, registered_df):
    """
    Checks whether the top registered candidate's actual brand name
    appears anywhere in the query text. Returns True if there's a conflict
    (brand missing from query — likely a false match).
    """
    brand = registered.loc[candidate_index, "BRAND_NAME"]

    if not isinstance(brand, str) or not brand.strip():
        return False

    brand_clean = brand.strip().lower()
    query_clean = clean_title(query)

    # simple substring check — brand name must appear somewhere in the query
    return brand_clean not in query_clean


if __name__ == "__main__":
    extracted_title = " ".join(sys.argv[1:]).strip()
    result = evaluate_match(extracted_title)