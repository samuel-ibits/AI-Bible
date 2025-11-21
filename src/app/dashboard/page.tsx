"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Search,
  Book,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Pause,
  Monitor,
  Eye,
} from "lucide-react";
import Bible from "../../components/bible";
interface BibleVerse {
  id: string;
  book: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
  score: number;
  timestamp: Date;
}

interface SearchResult {
  query: string;
  verses: BibleVerse[];
  searchTime: Date;
}

interface PresentationSettings {
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  theme: "light" | "dark" | "blue" | "green" | "red";
  showReference: boolean;
  showQuery: boolean;
  fontFamily: string;
  backgroundImage: string;
}

const BibleSearchSystem = () => {
  const [isListening, setIsListening] = useState(false);
  const [directSearch, setDirectSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchInterval, setSearchInterval] = useState(5); // seconds
  const [isAutoSearch, setIsAutoSearch] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  const [presentationWindow, setPresentationWindow] = useState<Window | null>(
    null
  );

  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [openBibleModal, setOpenBibleModal] = useState(false);
  const [presentationSettings, setPresentationSettings] =
    useState<PresentationSettings>({
      fontSize: 32,
      backgroundColor: "#1a1a1a",
      textColor: "#ffffff",
      theme: "dark",
      showReference: true,
      showQuery: false,
      fontFamily: "'Arial', sans-serif",
      backgroundImage: "",
    });

  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate Bible search function
  const searchBible = async (query: string): Promise<BibleVerse[]> => {
    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple keyword matching simulation
    const response = await fetch(`/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("Failed to fetch search results");
      setIsSearching(false);
      throw new Error("Failed to fetch search results");
    }

    const results = await response.json();
    setIsSearching(false);
    console.log("Search results:", results);
    return results?.data.results || [];
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript((prev) => prev + finalTranscript); // Only append final transcript
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Handle periodic search
  useEffect(() => {
    if (isAutoSearch && transcript && isListening) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        const words = transcript.trim().split(" ");
        const recentWords = words.slice(-10).join(" "); // Last 10 words

        if (recentWords.length > 3) {
          const results = await searchBible(recentWords);
          const newSearchResult: SearchResult = {
            query: recentWords,
            verses: results,
            searchTime: new Date(),
          };

          setSearchResults((prev) => [newSearchResult, ...prev.slice(0, 4)]);
        }
      }, searchInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transcript, isAutoSearch, searchInterval, isListening]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleManualSearch = async () => {
    if (currentQuery.trim()) {
      const results = await searchBible(currentQuery);
      const newSearchResult: SearchResult = {
        query: currentQuery,
        verses: results,
        searchTime: new Date(),
      };

      setSearchResults((prev) => [newSearchResult, ...prev.slice(0, 4)]);
      setCurrentQuery("");
    }
  };

  const clearAll = () => {
    setTranscript("");
    setSearchResults([]);
    setCurrentQuery("");
  };

  // Presentation functions
  const openPresentationWindow = () => {
    const newWindow = window.open(
      "",
      "_blank",
      "width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,location=no,status=no"
    );
    if (newWindow) {
      setPresentationWindow(newWindow);
      setIsPresentationOpen(true);
      updatePresentationContent(newWindow);
    }
  };

  const closePresentationWindow = () => {
    if (presentationWindow) {
      presentationWindow.close();
      setPresentationWindow(null);
      setIsPresentationOpen(false);
    }
  };

  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case "light":
        return { backgroundColor: "#ffffff", textColor: "#1a1a1a" };
      case "dark":
        return { backgroundColor: "#1a1a1a", textColor: "#ffffff" };
      case "blue":
        return { backgroundColor: "#1e3a8a", textColor: "#ffffff" };
      case "green":
        return { backgroundColor: "#166534", textColor: "#ffffff" };
      case "red":
        return { backgroundColor: "#b30000", textColor: "#ffffff" };
      default:
        return {
          backgroundColor: presentationSettings.backgroundColor,
          textColor: presentationSettings.textColor,
        };
    }
  };
  const themeStyles = getThemeStyles(presentationSettings.theme);
  const bgImageStyle = presentationSettings.backgroundImage
    ? `background-image: url('${presentationSettings.backgroundImage}');
       background-size: cover;
       background-position: center;`
    : `background-color: ${themeStyles.backgroundColor};`;

  const updatePresentationContent = (window: Window) => {
    if (!window) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bible Verse Presentation</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              ${bgImageStyle}
              color: ${themeStyles.textColor};
              font-family: ${presentationSettings.fontFamily};
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              text-align: center;
              box-sizing: border-box;
            }
            .verse-container {
              max-width: 90%;
              line-height: 1.6;
              // background: rgba(0, 0, 0, 0.4); /* add contrast if needed */
              padding: 20px;
              border-radius: 10px;
            }
            .verse-text {
              font-size: ${presentationSettings.fontSize}px;
              margin-bottom: 30px;
              font-weight: 300;
            }
            .verse-reference {
              font-size: ${presentationSettings.fontSize * 0.6}px;
              font-weight: 600;
              opacity: 0.9;
              margin-bottom: 20px;
            }
            .query-info {
              font-size: ${presentationSettings.fontSize * 0.4}px;
              opacity: 0.7;
              font-style: italic;
            }
            .no-verse {
              font-size: ${presentationSettings.fontSize * 0.8}px;
              opacity: 0.6;
            }
          </style>
        </head>
        <body>
          <div class="verse-container">
            ${
              selectedVerse
                ? `
              <div class="verse-text">${selectedVerse.text}</div>
              ${
                presentationSettings.showReference
                  ? `<div class="verse-reference">${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}</div>`
                  : ""
              }
              ${
                presentationSettings.showQuery && searchResults[0]
                  ? `<div class="query-info">Search: "${searchResults[0].query}"</div>`
                  : ""
              }
            `
                : `
              <div class="no-verse">No verse selected for presentation</div>
            `
            }
          </div>
        </body>
      </html>
    `;

    window.document.open();
    window.document.write(content);
    window.document.close();
  };

  // Update presentation when settings or selected verse changes
  useEffect(() => {
    if (presentationWindow && !presentationWindow.closed) {
      updatePresentationContent(presentationWindow);
    } else if (presentationWindow && presentationWindow.closed) {
      setIsPresentationOpen(false);
      setPresentationWindow(null);
    }
  }, [selectedVerse, presentationSettings]);

  const presentVerse = (verse: BibleVerse) => {
    setSelectedVerse(verse);
    if (!isPresentationOpen) {
      openPresentationWindow();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Speech AI Bible Search & Presentation System
          </h1>
          <p className="text-gray-600">
            Real-time conversation analysis with intelligent Bible verse
            matching and presentation
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Speech Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening ? "Stop Listening" : "Start Listening"}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpenBibleModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Open Bible
            </button>

            <Bible
              directSearch={directSearch}
              presentVerse={presentVerse}
              selectedVerse={selectedVerse}
              setSelectedVerse={setSelectedVerse}
              isBibleModalOpen={openBibleModal}
              setIsBibleModalOpen={setOpenBibleModal}
            />

            {/* Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Auto Search:</label>
                <button
                  onClick={() => setIsAutoSearch(!isAutoSearch)}
                  className={`p-2 rounded ${
                    isAutoSearch
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isAutoSearch ? <Play size={16} /> : <Pause size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Interval (s):</label>
                <select
                  value={searchInterval}
                  onChange={(e) => setSearchInterval(Number(e.target.value))}
                  className="px-3 py-1 border rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1s</option>
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={15}>15s</option>
                </select>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded ${
                  isMuted
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Presentation Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                <Monitor size={16} className="text-purple-600" />
                <span className="text-sm text-purple-600">
                  {isPresentationOpen ? "Presenting" : "Ready to Present"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Transcript */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Mic className="text-blue-500" size={20} />
                Live Transcript
              </h2>
              <div className="flex items-center gap-2">
                {isListening && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-500">Recording</span>
                  </div>
                )}
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="h-48 overflow-y-auto bg-gray-50 rounded-lg p-4 border">
              {transcript ? (
                <p className="text-gray-800 leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-gray-400 italic">
                  {isListening
                    ? "Listening for speech..."
                    : 'Click "Start Listening" to begin'}
                </p>
              )}
            </div>

            {/* Manual Search */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Enter manual search query..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <button
                onClick={handleManualSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={16} />
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Book className="text-green-500" size={20} />
              Bible Search Results
              {isSearching && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h2>

            <div className="h-96 overflow-y-auto space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Query: "{result.query}" -{" "}
                      {result.searchTime.toLocaleTimeString()}
                    </div>

                    {result.verses.map((verse) => (
                      <div
                        key={verse.id}
                        className="mb-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-blue-600 mb-2">
                            {verse.book} {verse.chapter}:{verse.verse}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => presentVerse(verse)}
                              className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors flex items-center gap-1"
                            >
                              <Monitor size={12} />
                              Present
                            </button>
                            <button
                              onClick={() => {
                                setOpenBibleModal(true);
                                setDirectSearch(true);
                                setSelectedVerse(verse);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                              <Book size={12} />
                              Bible
                            </button>
                            <span className="text-xs text-gray-500">
                              {Math.round(verse.score * 100)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${verse.score * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {verse.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-800 py-8">
                  <Book size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No search results yet</p>
                  <p className="text-sm">
                    Start speaking or enter a manual search
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Presentation Control Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Settings className="text-purple-500" size={20} />
                Presentation
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    showPreview
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Eye size={12} />
                  Preview
                </button>
                {isPresentationOpen ? (
                  <button
                    onClick={closePresentationWindow}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <Monitor size={16} />
                    Close
                  </button>
                ) : (
                  <button
                    onClick={openPresentationWindow}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                  >
                    <Monitor size={16} />
                    Open
                  </button>
                )}
              </div>
            </div>

            {/* Presentation Settings */}
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    value={presentationSettings.theme}
                    onChange={(e) =>
                      setPresentationSettings((prev) => ({
                        ...prev,
                        theme: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="red">Red</option>
                  </select>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={presentationSettings.fontFamily}
                    onChange={(e) =>
                      setPresentationSettings({
                        ...presentationSettings,
                        fontFamily: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">
                      Times New Roman
                    </option>
                    <option value="'Courier New', monospace">
                      Courier New
                    </option>
                    <option value="'Georgia', serif">Georgia</option>
                    <option value="'Roboto', sans-serif">Roboto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size ({presentationSettings.fontSize} px)
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    value={presentationSettings.fontSize}
                    onChange={(e) =>
                      setPresentationSettings((prev) => ({
                        ...prev,
                        fontSize: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500"></span>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Image
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPresentationSettings({
                            ...presentationSettings,
                            backgroundImage: reader.result as string,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={presentationSettings.showReference}
                    onChange={(e) =>
                      setPresentationSettings((prev) => ({
                        ...prev,
                        showReference: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Show Reference</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={presentationSettings.showQuery}
                    onChange={(e) =>
                      setPresentationSettings((prev) => ({
                        ...prev,
                        showQuery: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Show Query</span>
                </label>
              </div>
            </div>

            {/* Currently Selected Verse */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected for Presentation:
              </h3>
              {selectedVerse ? (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-600 text-sm mb-1">
                    {selectedVerse.book_name} {selectedVerse.chapter}:
                    {selectedVerse.verse}
                  </div>
                  <p className="text-gray-700 text-sm">{selectedVerse.text}</p>
                  <button
                    onClick={() => setSelectedVerse(null)}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Clear Selection
                  </button>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No verse selected
                </p>
              )}
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </h3>
                <div
                  className="text-center"
                  style={{
                    ...(presentationSettings.backgroundImage
                      ? {
                          backgroundImage: `url(${presentationSettings.backgroundImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          backgroundColor: getThemeStyles(
                            presentationSettings.theme
                          ).backgroundColor,
                        }),
                    color: getThemeStyles(presentationSettings.theme).textColor,
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    fontFamily: presentationSettings.fontFamily,
                    borderRadius: "0.5rem",
                    padding: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  {selectedVerse ? (
                    <>
                      <div
                        style={{
                          fontSize: `${presentationSettings.fontSize * 0.5}px`,
                          marginBottom: "15px",
                          fontWeight: "300",
                        }}
                      >
                        {selectedVerse.text}
                      </div>
                      {presentationSettings.showReference && (
                        <div
                          style={{
                            fontSize: `${
                              presentationSettings.fontSize * 0.3
                            }px`,
                            fontWeight: "600",
                            opacity: 0.9,
                            marginBottom: "10px",
                          }}
                        >
                          {selectedVerse.book_name} {selectedVerse.chapter}:
                          {selectedVerse.verse}
                        </div>
                      )}
                      {presentationSettings.showQuery && searchResults[0] && (
                        <div
                          style={{
                            fontSize: `${
                              presentationSettings.fontSize * 0.2
                            }px`,
                            opacity: 0.7,
                            fontStyle: "italic",
                          }}
                        >
                          Search: "{searchResults[0].query}"
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: `${presentationSettings.fontSize * 0.4}px`,
                        opacity: 0.6,
                      }}
                    >
                      No verse selected for presentation
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Status: {isListening ? "Listening" : "Idle"}</span>
              <span>Auto Search: {isAutoSearch ? "Enabled" : "Disabled"}</span>
              <span>Search Interval: {searchInterval}s</span>
              <span className="flex items-center gap-1">
                <Monitor size={14} />
                Presentation: {isPresentationOpen ? "Active" : "Ready"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-black">
              <span>Total Searches: {searchResults.length}</span>
              <span>
                Words Captured:{" "}
                {transcript.split(" ").filter((w) => w.length > 0).length}
              </span>
              <span>
                Selected:{" "}
                {selectedVerse
                  ? `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`
                  : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleSearchSystem;
