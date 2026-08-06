from pathlib import Path
import sys
import numpy as np
import faiss
from numpy.linalg import norm

sys.path.append(str(Path(__file__).resolve().parents[1]))
from common.clean import clean_title
from modelload import load_all_assets


assets = load_all_assets()
model = assets["model"]
bm25RegisteredObj = assets["bm25RegisteredObj"]
registered = assets["registeredCleanedDf"]
faissRegIndexObj = assets["faissRegIndexObj"]
registeredEmbeddingsArray = assets["registeredEmbeddingsArray"]

#receive query from user and clean it
query_placeholder = "Careline Powder Matte Lip Tint OMG BAE SRSLY YOLO LIT MOOD ZESTY RIZZ Transfer proof"
cleaned_query = clean_title(query_placeholder)

print(cleaned_query)

cleaned_embedded_query = model.encode([cleaned_query])
cleaned_embedded_query = np.array(cleaned_embedded_query, dtype="float32")
faiss.normalize_L2(cleaned_embedded_query)
processed_query = cleaned_embedded_query[0]


#tokenize the cleaned query
search_query = "Careline Powder Matte Lip Tint OMG BAE SRSLY YOLO LIT MOOD ZESTY RIZZ Transfer proof"
search_query = clean_title(search_query)
search_query_tokens = search_query.split()
search_query_scores = bm25RegisteredObj.get_scores(search_query_tokens)
top_registered_scores = np.argsort(search_query_scores)[::-1][:50]

available_title_columns = [
    "full_product_info",
    "PRODUCT_NAME",
    "Product Title",
    "product_name",
]
title_column = next((col for col in available_title_columns if col in registered.columns), None)

if title_column is None:
    raise KeyError(f"No suitable title column found in dataset. Available columns: {registered.columns.tolist()}")

index = 0

top50_candidates_Bm25 = []

for idx in top_registered_scores:
  top50_candidates_Bm25.append({
      "index" : idx,
      "title" : registered.iloc[idx][title_column],
      "BM25 score" : search_query_scores[idx]
  })


# Retrieve Candidate Embeddings
for candidate in top50_candidates_Bm25:
    idx = candidate["index"]
    candidate["embedding"] = registeredEmbeddingsArray[idx]

for candidate in top50_candidates_Bm25:
    candidate["cosine_similarity"] = np.dot(processed_query, candidate["embedding"])

print('cosine result:', top50_candidates_Bm25[0]["cosine_similarity"])

index2 = 0
top50_candidates_Bm25 = sorted(top50_candidates_Bm25, key=lambda x: x["cosine_similarity"], reverse=True)

print(f"top 10 results for '{search_query}':")
for candidate in top50_candidates_Bm25:
  if candidate['cosine_similarity'] < 0.64:
      if index2 == 0:
        print("no confident match was found.")
      break
  index2 += 1
  print(f"Rank {index2}:")
  print(candidate["cosine_similarity"])
  print(candidate["title"])
