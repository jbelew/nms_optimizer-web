/**
 * @file Entrypoint for the production Node.js server.
 * @remarks This script imports the pre-configured Express application and starts the HTTP server.
 * It uses the `PORT` environment variable if available, otherwise defaulting to 3000.
 * @author jbelew
 * @license GPL-3.0
 */

import app from './app.js';

/**
 * The network port on which the server listens for incoming requests.
 * @remarks Defaults to `3000` if the `PORT` environment variable is not defined.
 * @type {number|string}
 * @default 3000
 * @category Server
 */
const PORT = process.env.PORT || 3000;

/**
 * Start the Express server and log the listening status.
 * @remarks Binds to all network interfaces on the specified `PORT`.
 * @see {@link app} for the Express application logic.
 */
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
