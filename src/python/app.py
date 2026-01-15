from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Import our modular services
from services.bible_service import BibleService
from services.voice_service import VoiceService
from utils.reference_util import ReferenceUtil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize Services
bible_service = BibleService()
voice_service = VoiceService()
ref_util = ReferenceUtil()

# Pre-initialize KJV book names for reference matching
try:
    kjv_books = bible_service.get_book_names("kjv")
    ref_util.set_book_names(kjv_books)
    logger.info(f"Initialized with {len(kjv_books)} book names")
except Exception as e:
    logger.warning(f"Could not initialize book names: {e}")

@app.route("/embeds", methods=["POST"])
def embed():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        embedding = bible_service.model.encode(text).tolist()
        return jsonify({"embedding": embedding})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query")
    version = data.get("version", "kjv").lower()

    if not query:
        return jsonify({"error": "Missing 'query' in request."}), 400

    try:
        # 1. Try exact BCV (Book Chapter Verse) match first (Senior practice: prioritized matching)
        ref = ref_util.extract_reference(query)
        if ref:
            book, chapter, verse_num = ref
            verses, _ = bible_service.load_version(version)
            for v in verses:
                if (v["book_name"].lower() == book.lower() and
                    v["chapter"] == chapter and
                    v["verse"] == verse_num):
                    return jsonify({"results": [{
                        "id": f"{version}-{v['book_name']}-{v['chapter']}-{v['verse']}",
                        "book": v["book_name"],
                        "book_name": v["book_name"],
                        "chapter": v["chapter"],
                        "verse": v["verse"],
                        "text": v["text"],
                        "score": 1.0,
                        "match_type": "reference",
                        "version": version
                    }]})

        # 2. Fallback to semantic match
        results = bible_service.search(query, version=version)
        return jsonify({"results": results})
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Search error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/bible/books", methods=["GET"])
def get_books():
    version = request.args.get("version", "kjv").lower()
    try:
        books = bible_service.get_book_names(version)
        return jsonify({"books": books, "version": version})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route("/bible/chapters", methods=["GET"])
def get_chapters():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip()
    
    if not book:
        return jsonify({"error": "Missing 'book' parameter"}), 400

    try:
        verses, _ = bible_service.load_version(version)
        chapters = sorted(set(v["chapter"] for v in verses if v["book_name"].lower() == book.lower()))
        if not chapters:
            return jsonify({"error": "Book not found"}), 404
        return jsonify({"book": book, "chapters": chapters, "version": version})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bible/verses-selected", methods=["GET"])
def get_chapter_with_selected():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip()
    chapter = request.args.get("chapter")
    selected_verse = request.args.get("verse")

    if not book or not chapter:
        return jsonify({"error": "Missing 'book' or 'chapter' parameter"}), 400

    try:
        chapter = int(chapter)
        selected_verse = int(selected_verse) if selected_verse else None
        verses, _ = bible_service.load_version(version)
        
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bible/verse", methods=["GET"])
def get_single_verse():
    version = request.args.get("version", "kjv").lower()
    book = request.args.get("book", "").strip()
    chapter = request.args.get("chapter")
    verse_num = request.args.get("verse")

    if not (book and chapter and verse_num):
        return jsonify({"error": "Missing parameters"}), 400

    try:
        chapter, verse_num = int(chapter), int(verse_num)
        verses, _ = bible_service.load_version(version)
        for v in verses:
            if (v["book_name"].lower() == book.lower() and
                v["chapter"] == chapter and
                v["verse"] == verse_num):
                return jsonify({"verse": v, "version": version})
        return jsonify({"error": "Verse not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/bible/versions", methods=["GET"])
def get_versions():
    return jsonify({"versions": bible_service.SUPPORTED_VERSIONS})

@app.route("/voice/speak", methods=["POST"])
def speak_verse():
    data = request.get_json()
    text = data.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    success = voice_service.speak(text)
    return jsonify({"success": success})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Note: debug=True can cause double loading of models in some environments
    app.run(host="0.0.0.0", port=port, debug=False)
