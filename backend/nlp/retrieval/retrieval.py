# Retrieve Candidate Embeddings

for candidate in top50_candidates_Bm25:
    idx = candidate["index"]
    candidate["embedding"] = registered_embeddings[idx]


from numpy.linalg import norm

for candidate in top50_candidates_Bm25:
    candidate["cosine_similarity"] = np.dot(processed_query, candidate["embedding"])


print('cosine result:', top50_candidates_Bm25[0]["cosine_similarity"])


index = 0
top50_candidates_Bm25 = sorted(top50_candidates_Bm25, key=lambda x: x["cosine_similarity"], reverse=True)

print(f"top 10 results for '{search_query}':")
for candidate in top50_candidates_Bm25:
  if candidate['cosine_similarity'] < 0.54:
      if index == 0:
        print("no confident match was found.")
      break
  index += 1
  print(f"Rank {index}:")
  print(candidate["cosine_similarity"])
  print(candidate["title"])

