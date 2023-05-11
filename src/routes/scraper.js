const express = require('express');
const scraperController = require('../controllers/scraper');

const router = express.Router();

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
router.post('/scrape', scraperController.scrapeWebpage);
router.post('/session', scraperController.saveSession);
router.get('/session', scraperController.getSession);
router.get('/', scraperController.test);

module.exports = router;
