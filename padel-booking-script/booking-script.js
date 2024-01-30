const puppeteer = require('puppeteer');

const loginUrl = 'https://savitarna.ratopadelioarena.lt/';
const targetUrl = 'https://savitarna.ratopadelioarena.lt/';

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Change to true for production
    const page = await browser.newPage();

    // Log in
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

    // Wait for the login form to be available
    await page.waitForSelector('#login_form_desktop', { visible: true });

    // Type into input fields using associated labels
    await page.type('#LoginForm_var_login', 'sleivys.p@gmail.com');
    await page.type('#LoginForm_var_password', 'Lakunas123#');

    // Submit the form
    await page.click('button[type=submit]');

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });

    // Navigate to the target page
    await page.goto(targetUrl);

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

    // Implement logic to check if a court is available and send an email if true
    if (availableTimes.length > 0) {
        // Implement email sending logic using Node.js's nodemailer or any other library
        console.log('Padel Court Available. Book now!', availableTimes);
    } else {
        console.log('No available courts.');
    }

    // Close the browser
    await browser.close();
})();
