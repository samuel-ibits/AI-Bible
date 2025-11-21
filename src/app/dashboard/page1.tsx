'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, Book, Volume2, VolumeX, Settings, Play, Pause } from 'lucide-react';

interface BibleVerse {
  id: string;
  book: string;
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

const BibleSearchSystem = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchInterval, setSearchInterval] = useState(5); // seconds
  const [isAutoSearch, setIsAutoSearch] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);



  // Simulate Bible search function
  const searchBible = async (query: string): Promise<BibleVerse[]> => {
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple keyword matching simulation
    const response = await fetch(`/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('Failed to fetch search results');
      setIsSearching(false);
    throw new Error('Failed to fetch search results');
    }

    const results = await response.json();
    setIsSearching(false);
    console.log('Search results:', results);
    return results?.data.results || [];
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
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
        
        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
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
        const words = transcript.trim().split(' ');
        const recentWords = words.slice(-10).join(' '); // Last 10 words
        
        if (recentWords.length > 3) {
          const results = await searchBible(recentWords);
          const newSearchResult: SearchResult = {
            query: recentWords,
            verses: results,
            searchTime: new Date()
          };
          
          setSearchResults(prev => [newSearchResult, ...prev.slice(0, 4)]);
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
      setTranscript('');
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
        searchTime: new Date()
      };
      
      setSearchResults(prev => [newSearchResult, ...prev.slice(0, 4)]);
      setCurrentQuery('');
    }
  };

  const clearAll = () => {
    setTranscript('');
    setSearchResults([]);
    setCurrentQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Speech AI Bible Search System
          </h1>
          <p className="text-gray-600">
            Real-time conversation analysis with intelligent Bible verse matching
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
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{Math.round(confidence * 100)}%</span>
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Auto Search:</label>
                <button
                  onClick={() => setIsAutoSearch(!isAutoSearch)}
                  className={`p-2 rounded ${
                    isAutoSearch ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
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
                  className="px-3 py-1 border rounded text-sm"
                >
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={15}>15s</option>
                </select>
              </div>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {isListening ? 'Listening for speech...' : 'Click "Start Listening" to begin'}
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
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <button
                onClick={handleManualSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Search size={16} />
                {isSearching ? 'Searching...' : 'Search'}
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
                      Query: "{result.query}" - {result.searchTime.toLocaleTimeString()}
                    </div>
                    
                    {result.verses.map((verse) => (
                      <div key={verse.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-blue-600">
                            {verse.book} {verse.chapter}:{verse.verse}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              Relevance: {Math.round(verse.score * 100)}%
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
                  <p className="text-sm">Start speaking or enter a manual search</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Status: {isListening ? 'Listening' : 'Idle'}</span>
              <span>Auto Search: {isAutoSearch ? 'Enabled' : 'Disabled'}</span>
              <span>Search Interval: {searchInterval}s</span>
            </div>
            <div className="flex items-center gap-4 text-black">
              <span>Total Searches: {searchResults.length}</span>
              <span>Words Captured: {transcript.split(' ').filter(w => w.length > 0).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibleSearchSystem;