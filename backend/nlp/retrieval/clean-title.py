#Marketplace Title preparation for FAISS#
#Query Embeddings Creation


query_placeholder = "Careline Powder Matte Lip Tint OMG BAE SRSLY YOLO LIT MOOD ZESTY RIZZ Transfer proof" #dito ka mag lagay ng sample product title

cleaned_query = clean_title(query_placeholder)

# print(cleaned_query)

cleaned_embedded_query = model.encode([cleaned_query])

cleaned_embedded_query = np.array(cleaned_embedded_query, dtype="float32")

faiss.normalize_L2(cleaned_embedded_query)

processed_query = cleaned_embedded_query[0]




#### top 50 USING BM25 ####
#Marketplace Title preparation for BM25#

#Query Preparation
#Marketplace Title (supposed extracted)
search_query = "Careline Powder Matte Lip Tint OMG BAE SRSLY YOLO LIT MOOD ZESTY RIZZ Transfer proof" #dito ka ulit mag lagay ng sample product title

#Cleaning the Query
search_query = clean_title(search_query)

#Tokenization of the cleaned query
search_query_tokens = search_query.split()

#Compute BM25 scores
search_query_scores = bm25_registered.get_scores(search_query_tokens)

#Ranking the scores and Selecting the top 5
top_registered_scores = np.argsort(search_query_scores)[::-1][:50]

#Print the results
index = 0

'''if len(top_registered_scores) == 0:
    print(f"no name '{search_query}' in the dataset.")
else:
  print(f"top 50 results for '{search_query}':")
  for idx in top_registered_scores:
      index += 1
      print(f"Rank {index}:")
      print(idx)
      print(registered.loc[idx, 'full_product_info'])
      print(search_query_scores[idx])'''


top50_candidates_Bm25 = []

for idx in top_registered_scores:
  top50_candidates_Bm25.append({
      "index" : idx,
      "title" : registered.loc[idx, 'full_product_info'],
      "BM25 score" : search_query_scores[idx]
  })


  