/**
 * @file The main entry point for the Node.js server.
 * Imports the Express app and starts listening on the configured port.
 */
import './sentry.js';
import app from './app.js';

/**
 * The port number for the server to listen on.
 * Defaults to 3000 if not provided by the environment.
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Starts the Express server.
 */
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
