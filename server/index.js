import { createServer } from './app.js';

const port = process.env.PORT || 5173;

createServer().then(app => {
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
});
