const scraperService = require('../services/scraperService');

exports.test = (req, res) => {
    try {
        const status = scraperService.test();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the scraper status' });
    }
};

exports.scrapeWebpage = async (req, res) => {
    const { url } = req.body;
    try {
        const data = await scraperService.scrape(url);
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while scraping' });
    }
};

exports.saveSession = (req, res) => {
    const { session } = req.body;
    try {
        scraperService.saveSession(session);
        res.json({ message: 'Session saved' });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while saving the session' });
    }
    
};

exports.getSession = async (req, res) => {
    try {
        const session = await scraperService.getSession();
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while getting the session' });
    }
};
