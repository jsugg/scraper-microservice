const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const prometheusClient = require('prom-client');
const scrapingService = require('./scrapingService');
const { chromium } = require('playwright');

// Setup express app
const app = express();

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Scraping Microservice API",
            version: "1.0.0",
            description: "A simple API for a web scraping microservice",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Middleware for security
app.use(helmet());

// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Middleware for handling JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Sample endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'Scraping microservice is working' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));

/**
 * @openapi
 * /scrape:
 *   post:
 *     description: Request to scrape a webpage
 *     parameters:
 *       - in: body
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
// Scraping endpoint
app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    try {
        const data = await scrapingService.scrape(url);
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while scraping' });
    }
});

// Save session endpoint
app.post('/session', (req, res) => {
    const { session } = req.body;
    scrapingService.saveSession(session);
    res.json({ message: 'Session saved' });
});

// Get session endpoint
app.get('/session', async (req, res) => {
    try {
        const session = await scrapingService.getSession();
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the session' });
    }
});

async function login() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://example.com/');
    // Perform login actions here
    const session = await context.storageState();
    await browser.close();
    scrapingService.saveSession(session);
}
  
async function logout() {
    const session = await scrapingService.getSession();
    if (session) {
        // Perform logout actions here actions here
    }
}
  
const url = 'http://example.com'; // Replace with your actual URL
scrapingService.keepAlive(url, login, logout); // Replace login and logout with your actual login and logout functions

// Prometheus metrics endpoint
const collectDefaultMetrics = prometheusClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

app.get('/metrics', async (req, res) => {
    try {
        const metrics = await prometheusClient.register.metrics();
        res.set('Content-Type', prometheusClient.register.contentType);
        res.end(metrics);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the metrics' });
    }
});

