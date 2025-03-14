import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { songList } from "./songs.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY =
  "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";
let currentSong = null;

async function generateLyrics(songTitle) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Lyric Match Game",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a lyric generator. Generate a short, recognizable snippet (2-4 lines) from the given song title. Do not include the song title or artist name in the lyrics.",
          },
          {
            role: "user",
            content: `Generate a memorable lyric snippet from the song "${songTitle}". Make it challenging but recognizable.`,
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// New endpoint to get the song list
app.get("/api/songs", (req, res) => {
  res.json({ songs: songList });
});

app.get("/api/lyrics", async (req, res) => {
  try {
    let selectedSong;
    if (req.query.songTitle) {
      selectedSong = req.query.songTitle;
    } else {
      // Randomly select a song if no specific song is requested
      const randomIndex = Math.floor(Math.random() * songList.length);
      selectedSong = songList[randomIndex];
    }

    currentSong = selectedSong;
    const lyrics = await generateLyrics(currentSong);
    res.json({ lyrics });
  } catch (error) {
    console.error("Error generating lyrics:", error);
    res.status(500).json({ error: "Failed to generate lyrics" });
  }
});

app.post("/api/check", (req, res) => {
  const { guess } = req.body;

  if (!currentSong) {
    return res.status(400).json({ error: "No song is currently active" });
  }

  const isCorrect =
    guess.toLowerCase().trim() === currentSong.toLowerCase().trim();

  res.json({
    isCorrect,
    actualSong: isCorrect ? null : currentSong,
    message: isCorrect ? "Correct!" : "Incorrect. Try again!",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
