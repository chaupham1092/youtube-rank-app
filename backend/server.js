const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Explicit CORS configuration to allow requests from your frontend URL
const corsOptions = {
    origin: 'https://youtube-rank-ohhvsp87a-chaupham1092s-projects.vercel.app', // Your frontend URL
    methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 10000;

// Log incoming requests for debugging
app.post('/check-rank', async (req, res) => {
    console.log('Request Body:', req.body); // Log incoming data for debugging
    const { videos, keywords } = req.body;
    const results = [];

    for (let i = 0; i < videos.length; i++) {
        const videoId = extractVideoId(videos[i]);
        const keyword = keywords[i] || '';
        console.log(`Processing video: ${videos[i]}, Keyword: ${keyword}`); // Log for debugging

        try {
            const rank = await getYouTubeRank(videoId, keyword);
            results.push({ video: videos[i], keyword, rank });
        } catch (error) {
            console.error('Error in rank check:', error); // Log error details for debugging
            results.push({ video: videos[i], keyword, rank: 'Error' });
        }
    }

    res.json({ results });
});

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
};

// Function to get YouTube rank by searching for the video on YouTube
const getYouTubeRank = async (videoId, keyword) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
    console.log('Requesting search URL:', searchUrl); // Log search URL for debugging

    try {
        const response = await axios.get(searchUrl);
        const html = response.data;
        const videoLinks = [];
        const regex = /href="\/watch\?v=([a-zA-Z0-9_-]+)/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            videoLinks.push(match[1]);
        }

        const position = videoLinks.indexOf(videoId);
        return position !== -1 ? position + 1 : 'Not Found';
    } catch (error) {
        console.error('Error fetching YouTube data:', error); // Log error when fetching YouTube data
        throw error; // Throw error to be caught in the main handler
    }
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
