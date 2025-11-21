from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import os
import re


app = Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")
# Load Bible JSON
with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'kjv.json'), 'r', encoding='utf-8') as f:
    bible_data = json.load(f)

verses = bible_data['verses']
texts = [v['text'] for v in verses]

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Embed all verses once at startup
print("Embedding all Bible verses...")
embeddings = model.encode(texts, convert_to_tensor=True)
print("Embedding complete.")


# Preprocess book names for matching
book_names = set(v["book_name"].lower() for v in verses)

def extract_reference(query):
    """
    Try to extract a Bible reference (book, chapter, verse) from various formats.
    Returns (book, chapter, verse) or None.
    """
    query = query.strip().lower()

    # Try common formats like "John 3:16" or "1 John 2:5"
    match = re.search(r"(?:(\d)?\s*([a-zA-Z]+))\s+(\d+):(\d+)", query)
    if match:
        prefix, book, chapter, verse = match.groups()
        full_book = (prefix or "") + " " + book
        full_book = full_book.strip()
        if full_book in book_names:
            return full_book.title(), int(chapter), int(verse)

    # Try natural language style like "Deuteronomy 28 chapter 1 verse 3"
    match = re.search(r"([1-3]?\s?[a-zA-Z]+)\s+chapter\s+(\d+)\s+verse\s+(\d+)", query)
    if match:
        book, chapter, verse = match.groups()
        book = book.strip()
        if book.lower() in book_names:
            return book.title(), int(chapter), int(verse)

    return None

# @app.route("/embed", methods=["POST"])
# def embed():
#     data = request.json
#     inputs = data.get("inputs", [])
#     embeddings = model.encode(inputs).tolist()
#     return jsonify({ "embeddings": embeddings })

@app.route("/embeds", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    embedding = model.encode(text).tolist()
    return jsonify({"embedding": embedding})




@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query")

    if not query:
        return jsonify({"error": "Missing 'query' in request."}), 400

    # Try exact BCV match first
    ref = extract_reference(query)
    if ref:
        book, chapter, verse_num = ref
        for v in verses:
            if (v["book_name"].lower() == book.lower() and
                v["chapter"] == chapter and
                v["verse"] == verse_num):
                return jsonify({"results": [{
                    "book": v["book_name"],
                    "chapter": v["chapter"],
                    "verse": v["verse"],
                    "text": v["text"],
                    "score": 1.0,
                    "match_type": "reference"
                }]})

    # Fallback to semantic match
    query_vec = model.encode([query], convert_to_tensor=True)
    scores = cosine_similarity(query_vec, embeddings)[0]
    top_n = 5
    best_indices = np.argsort(scores)[::-1][:top_n]

    results = []
    for idx in best_indices:
        v = verses[idx]
        results.append({
            "book": v["book_name"],
            "chapter": v["chapter"],
            "verse": v["verse"],
            "text": v["text"],
            "score": float(scores[idx]),
            "match_type": "semantic"
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

