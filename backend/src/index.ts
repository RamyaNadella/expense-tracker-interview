import logger from './logger.js';
import app from './app.js';
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
