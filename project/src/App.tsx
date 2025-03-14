import React, { useState, useEffect } from "react";
import { Music2, RefreshCw, Check, ListMusic } from "lucide-react";
import axios from "axios";

interface GameState {
  lyrics: string;
  isLoading: boolean;
  guess: string;
  result: {
    isCorrect: boolean;
    actualSong?: string;
    message: string;
  } | null;
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    lyrics: "",
    isLoading: false,
    guess: "",
    result: null,
  });
  const [songList, setSongList] = useState<string[]>([]);
  const [showSongList, setShowSongList] = useState(false);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  useEffect(() => {
    // Fetch song list from the backend
    const fetchSongList = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/songs");
        setSongList(response.data.songs);
      } catch (error) {
        console.error("Error fetching song list:", error);
      }
    };
    fetchSongList();
  }, []);

  const generateLyrics = async (songTitle?: string) => {
    setGameState((prev) => ({ ...prev, isLoading: true, result: null }));
    try {
      const response = await axios.get("http://localhost:3000/api/lyrics", {
        params: { songTitle },
      });
      setGameState((prev) => ({
        ...prev,
        lyrics: response.data.lyrics,
        isLoading: false,
      }));
      setShowSongList(false);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      setGameState((prev) => ({
        ...prev,
        isLoading: false,
        lyrics: "Failed to generate lyrics. Please try again.",
      }));
    }
  };

  const checkAnswer = async () => {
    if (!gameState.guess.trim()) return;

    try {
      const response = await axios.post("http://localhost:3000/api/check", {
        guess: gameState.guess,
      });

      setGameState((prev) => ({
        ...prev,
        result: response.data,
      }));
    } catch (error) {
      console.error("Error checking answer:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Music2 size={48} className="text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Lyric Match</h1>
            <p className="text-purple-200">
              Can you guess the song from these lyrics?
            </p>
          </div>

          {/* Main Game Area */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            {/* Song List Toggle Button */}
            <button
              onClick={() => setShowSongList(!showSongList)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg mb-4 flex items-center justify-center gap-2 transition-colors"
            >
              <ListMusic />
              {showSongList ? "Hide Song List" : "Show Song List"}
            </button>

            {/* Song List */}
            {showSongList && (
              <div className="mb-6 bg-white/5 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {songList.map((song, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedSong(song);
                        generateLyrics(song);
                      }}
                      className="text-left px-4 py-2 rounded hover:bg-white/10 transition-colors"
                    >
                      {song}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lyrics Display */}
            <div className="mb-8">
              <button
                onClick={() => generateLyrics()}
                disabled={gameState.isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg mb-6 flex items-center justify-center gap-2 transition-colors"
              >
                {gameState.isLoading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>
                    <RefreshCw />
                    Generate Random Lyrics
                  </>
                )}
              </button>

              <div className="bg-white/5 rounded-lg p-6 min-h-[120px] text-center">
                {gameState.lyrics ? (
                  <p className="text-lg italic">{gameState.lyrics}</p>
                ) : (
                  <p className="text-purple-300">
                    Select a song or generate random lyrics
                  </p>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <input
                type="text"
                value={gameState.guess}
                onChange={(e) =>
                  setGameState((prev) => ({ ...prev, guess: e.target.value }))
                }
                placeholder="Enter the song title..."
                className="w-full bg-white/5 border border-purple-400/30 rounded-lg py-3 px-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={checkAnswer}
                disabled={!gameState.lyrics || !gameState.guess.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Check />
                Check Answer
              </button>
            </div>

            {/* Result Display */}
            {gameState.result && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  gameState.result.isCorrect
                    ? "bg-green-600/20"
                    : "bg-red-600/20"
                }`}
              >
                <p className="text-center font-semibold">
                  {gameState.result.isCorrect ? (
                    "🎉 Correct! Well done!"
                  ) : (
                    <>
                      Sorry, that's not correct. <br />
                      The song was:{" "}
                      <span className="font-bold">
                        {gameState.result.actualSong}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
