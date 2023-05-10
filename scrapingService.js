const { chromium } = require('playwright');
const redis = require('redis');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', function(err) {
    console.log('Redis error: ', err);
});

redisClient.on('ready', () => {
    console.log('Redis client connected');
});

async function load() {
    return new Promise((resolve) => {
        redisClient.on('connect', resolve);
    });
}

// Scrape function
async function scrape(url) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    const content = await page.content();
    await browser.close();
    return content;
}

// Save session to Redis
function saveSession(session) {
    redisClient.set('session', JSON.stringify(session), redis.print);
}

// Get session from Redis
async function getSession() {
    await load();
    if (!redisClient.connected) {
        console.log('Redis client not connected');
        return null;
    }
    return new Promise((resolve, reject) => {
        redisClient.get('session', (err, reply) => {
            if (err) { console.log('Error getting session from Redis:', err); reject(err); }
            resolve(JSON.parse(reply));
        });
    });
}

async function keepAlive(url, login, logout) {
    const session = await getSession();
    if (!session) {
        // Log in if not already logged in
        await login();
    } else {
        const browser = await chromium.launch();
        const context = await browser.newContext({ storageState: session });
        const page = await context.newPage();
        await page.goto(url);
        if (await logout()) {
            // If logged out, log back in
            await login();
        } else {
            // Refresh the page and scroll to keep the session alive
            await page.reload();
            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });
        }
        await browser.close();
    }
    setTimeout(() => keepAlive(url, login, logout), 5 * 60 * 1000); // Check every 5 minutes
}

module.exports = {
    scrape,
    saveSession,
    getSession,
    keepAlive,
    load
};
