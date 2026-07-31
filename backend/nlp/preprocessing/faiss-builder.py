#Building the faiss index
import faiss

BASE_DIR = Path(__file__).resolve().parent
asset_dir = BASE_DIR.parent / "assets"
faiss.normalize_L2(registered_embeddings)

# np.linalg.norm(registered_embeddings[0]) -- for checking if normalization is successful

d = registered_embeddings.shape[1]

registered_index = faiss.IndexFlatIP(d)

registered_index.add(registered_embeddings)

#save registered_index as index
faiss.write_index(registered_index, asset_dir / "registered.index")