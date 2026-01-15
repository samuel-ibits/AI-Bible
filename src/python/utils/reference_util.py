import re

class ReferenceUtil:
    def __init__(self, book_names=None):
        self.book_names = book_names or set()

    def set_book_names(self, book_names):
        self.book_names = set(name.lower() for name in book_names)

    def extract_reference(self, query):
        """
        Try to extract a Bible reference (book, chapter, verse) from various formats.
        Returns (book, chapter, verse) or None.
        """
        query = query.strip().lower()

        # Try common formats like "John 3:16", "1 John 2:5", or "John3:16"
        match = re.search(r"(?:(\d)?\s*([a-zA-Z]+-?[a-zA-Z]*))\s*(\d+):(\d+)", query)
        if match:
            prefix, book, chapter, verse = match.groups()
            full_book = (prefix or "") + (" " if prefix else "") + book
            full_book = full_book.strip().lower()
            if full_book in self.book_names:
                return full_book.title(), int(chapter), int(verse)

        # Try natural language style like "Deuteronomy 28 chapter 1 verse 3"
        # Adjusted to be more flexible
        match = re.search(r"([1-3]?\s?[a-zA-Z]+-?[a-zA-Z]*)\s+chapter\s+(\d+)\s+verse\s+(\d+)", query)
        if match:
            book, chapter, verse = match.groups()
            book_lower = book.strip().lower()
            if book_lower in self.book_names:
                return book.strip().title(), int(chapter), int(verse)

        return None
