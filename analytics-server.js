import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const GA_MEASUREMENT_ID = 'G-P5VBZQ69Q9'; // Google Analytics Tracking ID
const GA_API_SECRET = 'dEm7eUHHROOwljFuD2qrHg'; // Measurement Protocol API Secret

app.post('/api/analytics', async (req, res) => {
    console.log('Received analytics event:', req.body);
    const { client_id, eventName, eventParams } = req.body;

    if (!eventName || !client_id) {
        return res.status(400).send('Event name and client_id are required');
    }

    try {
        const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: client_id,
                events: [{
                    name: eventName,
                    params: eventParams,
                }],
            }),
        });

        if (response.ok) {
            res.status(200).send('Event forwarded to Google Analytics');
        } else {
            const errorText = await response.text();
            console.error('Google Analytics API error:', errorText);
            res.status(response.status).send('Error forwarding event to Google Analytics');
        }
    } catch (error) {
        console.error('Error sending event to Google Analytics:', error);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = process.env.ANALYTICS_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Analytics server running on port ${PORT}`);
});
