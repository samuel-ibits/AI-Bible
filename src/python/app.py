from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import os
import re

app = Flask(__name__)
model = SentenceTransformer("all-MiniLM-L6-v2")
# Cache to hold version data and embeddings
bible_versions = {}
bible_embeddings = {}

SUPPORTED_VERSIONS = ["asv", "asvs","bishops","coverdale","geneva","kjv_strongs","kjv", "net","tyndale","web"]

def load_bible(version):
    version = version.lower()
    if version not in SUPPORTED_VERSIONS:
        raise ValueError("Unsupported version")
    
    if version in bible_versions:
        return bible_versions[version], bible_embeddings[version]

    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', f"{version}.json")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            bible_data = json.load(f)
    except FileNotFoundError:
        raise ValueError(f"Bible file not found: {file_path}")
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON in file: {file_path}")

    if 'verses' not in bible_data:
        raise ValueError("Bible data missing 'verses' key")

    verses = bible_data['verses']
    
    if not verses:
        raise ValueError("No verses found in Bible data")

    print(f"Loading {len(verses)} verses for {version}...")
    print("Embedding all Bible verses...")
    texts = [v['text'] for v in verses]
    embeddings = model.encode(texts, convert_to_tensor=True)
    print("Embedding complete.")

    bible_versions[version] = verses
    bible_embeddings[version] = embeddings

    return verses, embeddings

# Preprocess book names for matching (with safe initialization)
def get_book_names(version):
    try:
        verses, _ = load_bible(version)
        return set(v["book_name"].lower() for v in verses)
    except Exception as e:
        print(f"Error loading book names for {version}: {e}")
        return set()

# Initialize book names safely
book_names = set()

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
    version = data.get("version", "kjv").lower()

    if version not in SUPPORTED_VERSIONS:
        return jsonify({"error": f"Unsupported version: {version}"}), 400

    try:
        verses, embeddings = load_bible(version)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    # Try exact match
    ref = extract_reference(query)
    if ref:
        book, chapter, verse_num = ref
        for v in verses:
            if (v["book_name"].lower() == book.lower() and
                v["chapter"] == chapter and
                v["verse"] == verse_num):
                return jsonify({"results": [{
                    "book": v["book_name"],
                    "book_name": v["book_name"],
                    "chapter": v["chapter"],
                    "verse": v["verse"],
                    "text": v["text"],
                    "score": 1.0,
                    "match_type": "reference",
                    "version": version
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
            "book_name": v["book_name"],
            "chapter": v["chapter"],
            "verse": v["verse"],
            "text": v["text"],
            "score": float(scores[idx]),
            "match_type": "semantic",
            "version": version
        })

    return jsonify({"results": results})

@app.route("/bible/books", methods=["GET"])
def get_books():
    version = request.args.get("version", "kjv").lower()
    try:
        verses, _ = load_bible(version)
        books = sorted(set(v["book_name"] for v in verses))
        return jsonify({"books": books, "version": version})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error in get_books: {e}")
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

@app.route("/bible/chapters", methods=["GET"])
def get_chapters():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip().title()
    
    if not book:
        return jsonify({"error": "Missing 'book' parameter"}), 400

    try:
        verses, _ = load_bible(version)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    chapters = sorted(set(v["chapter"] for v in verses if v["book_name"].lower() == book.lower()))
    if not chapters:
        return jsonify({"error": "Book not found"}), 404

    return jsonify({"book": book, "chapters": chapters, "version": version})

@app.route("/bible/verses-selected", methods=["GET"])
def get_chapter_with_selected():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip().title()
    chapter = request.args.get("chapter")
    selected_verse = request.args.get("verse")  # optional

    if not book or not chapter:
        return jsonify({"error": "Missing 'book' or 'chapter' parameter"}), 400

    try:
        chapter = int(chapter)
        selected_verse = int(selected_verse) if selected_verse else None
        verses, _ = load_bible(version)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    chapter_verses = []

    for v in verses:
        if v["book_name"].lower() == book.lower() and v["chapter"] == chapter:
            v_copy = v.copy()
            if selected_verse and v["verse"] == selected_verse:
                v_copy["selected"] = True
            chapter_verses.append(v_copy)

    if not chapter_verses:
        return jsonify({"error": "Chapter not found"}), 404

    return jsonify({
        "verses": chapter_verses,
        "version": version,
        "book": book,
        "chapter": chapter
    })


@app.route("/bible/verses", methods=["GET"])
def get_verses():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip().title()
    chapter = request.args.get("chapter")

    if not book or not chapter:
        return jsonify({"error": "Missing 'book' or 'chapter' parameter"}), 400

    try:
        chapter = int(chapter)
        verses, _ = load_bible(version)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    matched = [v for v in verses if v["book_name"].lower() == book.lower() and v["chapter"] == chapter]
    
    if not matched:
        return jsonify({"error": "No verses found for book/chapter"}), 404

    verse_numbers = [v["verse"] for v in matched]

    return jsonify({
        "book": book,
        "chapter": chapter,
        "verses": verse_numbers,
        "version": version
    })

@app.route("/bible/verse", methods=["GET"])
def get_single_verse():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip().title()
    chapter = request.args.get("chapter")
    verse_num = request.args.get("verse")

    if not book or not chapter or not verse_num:
        return jsonify({"error": "Missing 'book', 'chapter' or 'verse' parameter"}), 400

    try:
        chapter = int(chapter)
        verse_num = int(verse_num)
        verses, _ = load_bible(version)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    for v in verses:
        if (v["book_name"].lower() == book.lower() and
            v["chapter"] == chapter and
            v["verse"] == verse_num):
            return jsonify({"verse": v, "version": version})

    return jsonify({"error": "Verse not found"}), 404

@app.route("/bible/versions", methods=["GET"])
def get_versions():
    return jsonify({
        "versions": SUPPORTED_VERSIONS
    })

@app.route("/bible/initialize", methods=["POST"])
def initialize_book_names():
    """Initialize book names for reference matching"""
    global book_names
    version = request.get_json().get("version", "kjv") if request.get_json() else "kjv"
    try:
        book_names = get_book_names(version)
        return jsonify({"status": "Book names initialized", "count": len(book_names)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Initialize book names on startup
    try:
        book_names = get_book_names("kjv")
        print(f"Initialized with {len(book_names)} book names")
    except Exception as e:
        print(f"Warning: Could not initialize book names: {e}")
    
    app.run(host="127.0.0.1", port=5000, debug=True)