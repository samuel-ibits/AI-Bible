import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import torch

class BibleService:
    def __init__(self, model_name="all-MiniLM-L6-v2", base_dir=None):
        self.base_dir = base_dir or os.path.dirname(os.path.dirname(__file__))
        self.model_dir = os.path.join(self.base_dir, 'models', model_name)
        self.cache_dir = os.path.join(self.base_dir, 'cache')
        self.data_dir = os.path.join(self.base_dir, '..', 'data')
        
        # Ensure directories exist
        os.makedirs(self.model_dir, exist_ok=True)
        os.makedirs(self.cache_dir, exist_ok=True)

        print(f"Loading model from {self.model_dir}...")
        # SentenceTransformer will download to self.model_dir if not present
        self.model = SentenceTransformer(model_name, cache_folder=os.path.dirname(self.model_dir))
        
        self.bible_versions = {}
        self.bible_embeddings = {}
        self.SUPPORTED_VERSIONS = ["asv", "asvs", "bishops", "coverdale", "geneva", "kjv_strongs", "kjv", "net", "tyndale", "web"]

    def load_version(self, version):
        version = version.lower()
        if version not in self.SUPPORTED_VERSIONS:
            if version + ".json" not in os.listdir(self.data_dir):
                 raise ValueError(f"Unsupported version: {version}")
        
        if version in self.bible_versions:
            return self.bible_versions[version], self.bible_embeddings[version]

        file_path = os.path.join(self.data_dir, f"{version}.json")
        cache_path = os.path.join(self.cache_dir, f"{version}_embeddings.npy")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                bible_data = json.load(f)
        except FileNotFoundError:
            raise ValueError(f"Bible file not found: {file_path}")

        verses = bible_data['verses']
        for v in verses:
            if 'id' not in v:
                v['id'] = f"{version}-{v['book_name']}-{v['chapter']}-{v['verse']}"
        texts = [v['text'] for v in verses]

        # Load or generate embeddings
        if os.path.exists(cache_path):
            print(f"Loading cached embeddings for {version}...")
            embeddings = np.load(cache_path)
            # Convert to torch tensor if we want to maintain previous behavior (cosine_similarity expects it or numpy)
            embeddings = torch.from_numpy(embeddings)
        else:
            print(f"Generating embeddings for {version} (this may take a while)...")
            embeddings = self.model.encode(texts, convert_to_tensor=True)
            # Save to disk
            np.save(cache_path, embeddings.cpu().numpy())
            print(f"Cached embeddings to {cache_path}")

        self.bible_versions[version] = verses
        self.bible_embeddings[version] = embeddings
        return verses, embeddings

    def get_book_names(self, version):
        verses, _ = self.load_version(version)
        return sorted(list(set(v["book_name"] for v in verses)))

    def search(self, query, version="kjv", top_n=5):
        verses, embeddings = self.load_version(version)
        
        query_vec = self.model.encode([query], convert_to_tensor=True)
        
        # Using pure numpy/torch for similarity to reduce dependency on sklearn
        # Cosine similarity: (A . B) / (||A|| * ||B||)
        # SentenceTransformer embeddings are usually normalized, so we can just use dot product
        
        # If using torch:
        from sentence_transformers import util
        scores = util.cos_sim(query_vec, embeddings)[0]
        
        # Get top N
        top_results = torch.topk(scores, k=min(top_n, len(scores)))
        
        results = []
        for score, idx in zip(top_results.values, top_results.indices):
            v = verses[idx.item()]
            results.append({
                "id": f"{version}-{v['book_name']}-{v['chapter']}-{v['verse']}",
                "book": v["book_name"],
                "book_name": v["book_name"],
                "chapter": v["chapter"],
                "verse": v["verse"],
                "text": v["text"],
                "score": float(score),
                "match_type": "semantic",
                "version": version
            })
        return results
