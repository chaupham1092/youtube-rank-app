const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

app.post('/check-rank', async (req, res) => {
    const { videos, keywords } = req.body;
    const results = [];

    for (let i = 0; i < videos.length; i++) {
        const videoId = extractVideoId(videos[i]);
        const keyword = keywords[i] || '';
        try {
            const rank = await getYouTubeRank(videoId, keyword);
            results.push({ video: videos[i], keyword, rank });
        } catch (error) {
            results.push({ video: videos[i], keyword, rank: 'Error' });
        }
    }

    res.json({ results });
});

const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
};

const getYouTubeRank = async (videoId, keyword) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
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
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
