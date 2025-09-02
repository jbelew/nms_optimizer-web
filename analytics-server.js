import cors from "cors";
import express from "express";
import fetch from "node-fetch";

import "dotenv/config";

const app = express();

// Enable CORS for specific origins
const allowedOrigins = [
	"http://localhost:5173", // Vite dev server
	"http://localhost:4173", // Vite preview server (for e2e tests)
	"https://nms-optimizer.app", // Production
];
app.use(cors({ origin: allowedOrigins }));

// Explicitly handle preflight (OPTIONS) requests
// app.options('*', cors({ origin: allowedOrigins })); // Temporarily commented out to debug path-to-regexp error

app.use(express.json());

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || "G-P5VBZQ69Q9";
const GA_API_SECRET = process.env.GA_API_SECRET || "dEm7eUHHROOwljFuD2qrHg";

if (!GA_API_SECRET) {
	console.error(
		"FATAL ERROR: GA_API_SECRET is not defined. Please set it in your environment variables."
	);
	process.exit(1);
}

app.post("/api/analytics", async (req, res) => {
	console.log("Received analytics event:", req.body);
	const { client_id, eventName, eventParams } = req.body;

	if (!eventName || !client_id) {
		return res.status(400).send("Event name and client_id are required");
	}

	try {
		const response = await fetch(
			`https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
			{
				method: "POST",
				body: JSON.stringify({
					client_id: client_id,
					events: [
						{
							name: eventName,
							params: eventParams,
						},
					],
				}),
			}
		);

		if (response.ok) {
			res.status(200).send("Event forwarded to Google Analytics");
		} else {
			const errorText = await response.text();
			console.error("Google Analytics API error:", errorText);
			res.status(response.status).send("Error forwarding event to Google Analytics");
		}
	} catch (error) {
		console.error("Error sending event to Google Analytics:", error);
		res.status(500).send("Internal Server Error");
	}
});

const PORT = process.env.ANALYTICS_PORT || 3001;
app.listen(PORT, () => {
	console.log(`Analytics server running on port ${PORT}`);
});
