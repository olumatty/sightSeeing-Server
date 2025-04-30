const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { default: axios } = require('axios')

dotenv.config()

const app = express();
const PORT = 8003;

app.use(express.json())
app.use(cors())

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', server: 'Charlie', uptime: process.uptime() });
  });

app.get('/v1/get_sight_seeing', async(req, res) => {
    try{
        const destination = req.query.destination || req.body.destination; 

        if (!destination) {
            return res.status(400).json({ error: "Destination is required" });
        }

        const options = {
            method: 'GET',
            url: 'https://real-time-tripadvisor-scraper-api.p.rapidapi.com/tripadvisor_tours_search_v2', 
            headers: {
                'content-type': 'application/json',
                'x-rapidapi-key': process.env.TOUR_API_KEY,
                'x-rapidapi-host': 'real-time-tripadvisor-scraper-api.p.rapidapi.com'
            },
            params:{ location: destination } 
        };

        const response = await axios.request(options);

        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            return res.status(404).json({ 
                error: "No sightseeing data found", 
                apiResponse: response.data 
            });
        }

        const results = response.data.data;

        const structuredResults = results.map((tour) => ({
            category:tour.category,
            description:tour.description || "N/A",
            image:tour.image || "N/A",
            title: tour.title || "N/A",
            link: tour.url || "N/A",
            price: {
                price:tour.price?.total|| "N/A",
                currency: tour.price?.currency || "USD"
            },
            rating : tour.rating
        }));

        const topResults = structuredResults
        .sort ((a, b) => b.rating - a.rating)
        .slice(0, 4);

        res.status(200).json({
            agent: 'Charlie',
            extractedInfo: destination,
            sightSeeing: topResults
        });

    } catch (error) {
        console.error("Error fetching sightSeeing details", error.message);
        if (error.response) {
            console.error("API Error Details:", error.response.status, error.response.data);
        }
        res.status(500).json({ 
            error: "Failed to fetch sightSeeing details", 
            details: error.message,
            apiError: error.response?.data || "No additional details"
        });
    }
});

app.listen(PORT, () =>{
    console.log(`The server is running on port ${PORT}`);
})