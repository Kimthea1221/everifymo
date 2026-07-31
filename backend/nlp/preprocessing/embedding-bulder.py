
import pandas as pd
import numpy as np
import SentenceTransformer

# Load the SBERT model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

#Create a precomputed sbert embeddings
BASE_DIR = Path(__file__).resolve().parent
asset_dir = BASE_DIR.parent / "assets"

registered = pd.read_pickle(asset_dir / "Registered_cleaned.pkl")

registered_embeddings = model.encode(registered['full_product_info'].tolist())

#save registered_embeddings as npy
np.save(asset_dir / "registered_embeddings.npy", registered_embeddings)

print(registered_embeddings.shape)