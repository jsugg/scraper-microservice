const redis = require('redis');
const { chromium } = require('playwright');

// Redis configuration
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', function(err) {
    console.log('Redis error: ', err);
});


/// Session handling with Redis ///

// Wait for Redis to connect
async function load() {
    return new Promise((resolve) => {
        redisClient.on('connect', resolve);
    });
}

// Get session from Redis
/* async function getSession() {
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
} */

// Save session to Redis
function saveSession(session) {
    redisClient.set('session', JSON.stringify(session), redis.print);
}

// Get session from Redis
function getSession() {
    return new Promise((resolve, reject) => {
        redisClient.get('session', (err, reply) => {
            if (err) reject(err);
            resolve(JSON.parse(reply));
        });
    });
} 

function closeSession() {
    // Close session logic here
    redisClient.quit();
}

/// General functions ///

// Test function
function test() {
    return { message: 'Scraper microservice is working' };
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


/// Project-specific functions ///

// Log in to website and save session
async function login() {
    await load();
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://example.com/');
    // Perform login actions here...
    const session = await context.storageState();
    await browser.close();
    this.saveSession(session);
}
  
async function logout() {
    const session = await this.getSession();
    if (session) {
        // Perform logout actions here actions here
    }
}

async function keepAlive(url, login, logout) {
    const session = await getSession();
    if (!session) {
        // Log in if not already logged in
        await this.login();
    } else {
        const browser = await chromium.launch();
        const context = await browser.newContext({ storageState: session });
        const page = await context.newPage();
        await page.goto(url);
        if (await logout()) {
            // If logged out, log back in
            await this.login();
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

/// Export functions ///

module.exports = {
    test,
    scrape,
    saveSession,
    getSession,
    closeSession,
    keepAlive,
    login,
    logout
};
