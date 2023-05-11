const express = require('express');
const swaggerUi = require('swagger-ui-express');
const prometheusClient = require('prom-client');
const scraperRoutes = require('./routes/scraper');
const middleware = require('./middleware');
const swaggerDocs = require('./config/swagger');

const app = express();

// Prometheus metrics endpoint
const collectDefaultMetrics = prometheusClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });


middleware(app); // Apply middleware: helmet, rate limiting, JSON, CORS

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/', scraperRoutes); // Use scraper routes
app.get('/metrics', async (req, res) => {
    try {
        const metrics = await prometheusClient.register.metrics();
        res.set('Content-Type', prometheusClient.register.contentType);
        res.end(metrics);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the metrics' });
    }
});

module.exports = app;
