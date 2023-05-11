const app = require('./src/index.js');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
