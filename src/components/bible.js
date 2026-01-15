"use client"
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import {
    Monitor,
} from "lucide-react";
const Bible = ({
    presentVerse,
    selectedVerse,
    setSelectedVerse,
    isBibleModalOpen,
    setIsBibleModalOpen,
    directSearch,
}) => {
    const [book, setBook] = useState("");
    const [chapter, setChapter] = useState("");
    const [verse, setVerse] = useState("");
    const [verseResult, setVerseResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [booksList, setBooksList] = useState([]);
    const [chaptersList, setChaptersList] = useState([]);
    const [versesList, setVersesList] = useState([]);

    const [bookError, setBookError] = useState("");
    const [chapterError, setChapterError] = useState("");
    const [verseError, setVerseError] = useState("");

    const closeBibleModal = () => {
        // setVerseResult(null);
        setError("");
        setIsBibleModalOpen(false);
    };

    const handleBibleSearch = async () => {
        if (!book || !chapter || !verse) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setError("");
        // setVerseResult(null);

        try {
            const response = await fetch(
                `api/bible/verse?book=${book}&chapter=${chapter}&verse=${verse}&version=kjv`
            );

            if (!response.ok) {
                throw new Error("Verse not found or invalid input");
            }

            const data = await response.json();
            console.log("Verse data:", data);
            setVerseResult(data?.data);
        } catch (err) {
            console.error(err);
            setError("An error occurred while fetching the verse.");
        } finally {
            setLoading(false);
        }
    };
    const getBooks = async () => {
        try {
            const response = await fetch("api/bible/books?version=kjv");
            if (!response.ok) {
                throw new Error("Failed to fetch books");
            }
            const data = await response.json();
            console.log("Books data:", data);
            return data?.data.books || [];
        } catch (error) {
            console.error("Error fetching books:", error);
            return [];
        }
    }
    const getChapters = async (book) => {
        try {
            const response = await fetch(`api/bible/chapters?book=${book}&version=kjv`);
            if (!response.ok) {
                throw new Error("Failed to fetch chapters");
            }
            const data = await response.json();
            console.log("Chapters data:", data);
            return data?.data.chapters || [];
        } catch (error) {
            console.error("Error fetching chapters:", error);
            return [];
        }
    }
    const getVerses = async (book, chapter) => {
        try {
            const response = await fetch(
                `api/bible/verses?book=${book}&chapter=${chapter}&version=kjv`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch verses");
            }
            const data = await response.json();
            console.log("Verses data:", data);
            return data?.data.verses || [];
        } catch (error) {
            console.error("Error fetching verses:", error);
            return [];
        }
    }

    useEffect(() => {
        Modal.setAppElement(document.body);
        getBooks().then(setBooksList);
    }, []);

    useEffect(() => {
        if (book && booksList.includes(book)) {
            setBookError("");
            getChapters(book).then(setChaptersList);
        } else if (book) {
            setBookError("Invalid book name");
            setChaptersList([]);
        }
        setChapter("");
        setVerse("");
        setVersesList([]);
    }, [book]);

    useEffect(() => {
        if (book && chapter && chaptersList.includes(Number(chapter))) {
            setChapterError("");
            getVerses(book, chapter).then(setVersesList);
        } else if (chapter) {
            setChapterError("Invalid chapter number");
            setVersesList([]);
        }
        setVerse("");
    }, [chapter]);

    useEffect(() => {
        if (verse && !versesList.includes(Number(verse))) {
            setVerseError("Invalid verse number");
        } else {
            setVerseError("");
        }
    }, [verse]);
    useEffect(() => {
        if (directSearch) {
            const handleDirectSearch = async () => {
                const { book, book_name, chapter, verse } = selectedVerse;
                console.log("Direct search for:", book, chapter, verse);

                setLoading(true);
                setError("");
                // setVerseResult(null);

                try {
                    const response = await fetch(
                        `api/bible/verses-selected?book=${book_name}&chapter=${chapter}&verse=${verse}&version=kjv`
                    );

                    if (!response.ok) {
                        throw new Error("Verse not found or invalid input");
                    }

                    const data = await response.json();
                    console.log("Verse data:", data);
                    setVerseResult(data?.data);
                } catch (err) {
                    console.error(err);
                    setError("An error occurred while fetching the verse.");
                } finally {
                    setLoading(false);
                }
            };
            handleDirectSearch();
        }
    }, [directSearch, selectedVerse]);
    // console.log(verseResult, "Verse Result");
    return (
        <>
            {/* Bible Modal */}
            <Modal
                isOpen={isBibleModalOpen}
                onRequestClose={closeBibleModal}
                className="fixed inset-0 flex items-center justify-center"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
            >
                <div className="bg-white rounded-lg p-6 w-96">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Search Bible Verse
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Book</label>
                            <input
                                type="text"
                                value={book}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                                    setBook(capitalized);
                                }}
                                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-blue-500"
                                placeholder="Enter book (e.g. John)"
                                list="book-suggestions"
                            />

                            {bookError && <p className="text-red-500 text-xs mt-1">{bookError}</p>}
                            <datalist id="book-suggestions">
                                {booksList.map((b) => (
                                    <option key={b} value={b} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chapter</label>
                            <input
                                type="number"
                                value={chapter}
                                onChange={(e) => setChapter(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-blue-500"
                                placeholder="e.g. 3"
                                disabled={!book || !!bookError}
                            />
                            {chapterError && <p className="text-red-500 text-xs mt-1">{chapterError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verse</label>
                            <input
                                type="number"
                                value={verse}
                                onChange={(e) => setVerse(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:ring-blue-500"
                                placeholder="e.g. 16"
                                disabled={!chapter || !!chapterError}
                            />
                            {verseError && <p className="text-red-500 text-xs mt-1">{verseError}</p>}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-2">{error}</p>
                    )}

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            onClick={closeBibleModal}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBibleSearch}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {verseResult && (
                        <div className="h-96 overflow-y-auto space-y-4">

                            <div className="mt-6 bg-gray-100 p-4 rounded">
                                {Array.isArray(verseResult.verses) ? (
                                    verseResult.verses.map((v, index) => (
                                        <p key={v.id || `${v.book_name}-${v.chapter}-${v.verse}-${index}`} className="text-gray-800 mb-2">
                                            <strong>
                                                {v.book_name} {v.chapter}:{v.verse}{" "}
                                                <button
                                                    onClick={() => {
                                                        presentVerse(v);
                                                        // setVerseResult(verseResult);
                                                        // handleVerseClick(v);
                                                    }}
                                                    className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
                                                >
                                                    <Monitor size={12} />
                                                    Present
                                                </button>
                                                {v.text}
                                            </strong>
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-800">
                                        <strong>
                                            {verseResult.verse.book_name} {verseResult.verse.chapter}:{verseResult.verse.verse}{" "}
                                            <button
                                                onClick={() => {
                                                    presentVerse(verseResult.verse);
                                                    // handleVerseClick(verseResult.verse);
                                                    // setVerseResult(verseResult);

                                                }}
                                                className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
                                            >
                                                <Monitor size={12} />
                                                Present
                                            </button>
                                            {verseResult.verse.text}
                                        </strong>
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end">

                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default Bible;
