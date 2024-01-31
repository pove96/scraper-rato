const puppeteer = require('puppeteer');

const loginUrl = 'https://savitarna.ratopadelioarena.lt/';
const baseUrl = 'https://savitarna.ratopadelioarena.lt/reservation/short';
const placeId = 1;

async function login(page) {
    // Navigate to the login page
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the login form to be available
    await page.waitForSelector('#login_form_desktop', { visible: true });

    // Type into input fields using associated labels
    await page.type('#LoginForm_var_login', 'sleivys.p@gmail.com');
    await page.type('#LoginForm_var_password', 'Lakunas123#');

    // Submit the form
    await page.click('button[type=submit]');

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 120000 });
}

async function checkAvailableCourts(page, date) {
    // Navigate to the target page with the specified date
    const targetUrl = `${baseUrl}?sDate=${date}&iPlaceId=${placeId}`;
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });

    // Extract information about available court times
    const availableTimes = await page.evaluate(() => {
        const times = [];

        // Select elements with the first class and attributes
        const timeElements1 = document.querySelectorAll('td.kaire.empty.booking-slot-available');
        timeElements1.forEach((element) => {
            const time = element.getAttribute('data-time');
            const court = element.querySelector('a.pop').getAttribute('data-court');
            times.push({ time, court });
        });

        // Select elements with the second class and attributes
        const timeElements2 = document.querySelectorAll('td.desine.empty.booking-slot-available');
        timeElements2.forEach((element) => {
            const time = element.getAttribute('data-time');
            const court = element.querySelector('a.pop').getAttribute('data-court');
            times.push({ time, court });
        });

        return times;
    });

    return availableTimes;
}

async function navigateToNextDay(page) {
    try {
        // Click on the next day button using page.evaluate
        await page.evaluate(() => {
            const nextButton = document.querySelector('th[data-action="next"]');
            nextButton.click();
        });

        // Wait for the calendar to update
        await page.waitForFunction(() => {
            const activeDay = document.querySelector('.datepicker-days .day.active');
            return activeDay && activeDay.getAttribute('data-day') !== null;
        });

        // Optional: Wait for a short additional time to ensure the calendar is fully updated
        await page.waitForTimeout(1000);
    } catch (error) {
        console.error("Error during navigation:", error);
    }
}







async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await login(page);

        // Get today's date
        const today = new Date();

        // Check available courts for today
        const todayFormatted = today.toISOString().split('T')[0];
        const todayAvailableCourts = await checkAvailableCourts(page, todayFormatted);

        if (todayAvailableCourts.length > 0) {
            console.log(`Padel Court Available on ${todayFormatted}. Book now!`, todayAvailableCourts);
        } else {
            console.log(`No available courts on ${todayFormatted}.`);
        }

        // Navigate to the next day
        await navigateToNextDay(page);

        // Get the next day's date
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        const nextDayFormatted = nextDay.toISOString().split('T')[0];

        // Check available courts for the next day
        const nextDayAvailableCourts = await checkAvailableCourts(page, nextDayFormatted);

        if (nextDayAvailableCourts.length > 0) {
            console.log(`Padel Court Available on ${nextDayFormatted}. Book now!`, nextDayAvailableCourts);
        } else {
            console.log(`No available courts on ${nextDayFormatted}.`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

main();
