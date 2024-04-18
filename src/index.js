const express = require('express');
const { fetchPrices } = require('../fetchers/priceFetcher');
const twilio = require('twilio');
const dotenv = require('dotenv');

const app = express();
app.use(express.json());


dotenv.config();

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const cryptocurrencies = ['bitcoin', 'ethereum', 'bnb', 'ripple', 'cardano', 'dogecoin', 'polkadot', 'uniswap', 'litecoin', 'chainlink', 'solana'];

const defaultThresholds = {
    solana: { threshold: 136, direction: 'below' },
    binancecoin: { threshold: 538, direction: 'above' },
    bitcoin: { threshold: 63700, direction: 'above' },
    ethereum: { threshold: 3000, direction: 'above' },
    cardano: { threshold: 0.45, direction: 'below' }
};

const userAlerts = {};
const sentAlerts = new Set();

setInterval(async () => {
    try {
        const prices = await fetchPrices(cryptocurrencies);
        if (prices) {
            console.log('Current prices:', prices);

            for (const userId in userAlerts) {
                const alerts = userAlerts[userId];
                for (const alert of alerts) {
                    const { crypto, threshold, direction, phoneNumber } = alert;
                    const currentPrice = prices[crypto];

                    const alertKey = `${userId}-${crypto}-${threshold}-${direction}`;
                    if (!sentAlerts.has(alertKey)) {
                        if (direction === 'above' && currentPrice > threshold) {
                            console.log(`Alert triggered for ${userId}: ${crypto} price is above ${threshold}`);
                            sendSMS(phoneNumber, `Alert: ${crypto} price is above ${threshold}`);
                            sentAlerts.add(alertKey);
                        } else if (direction === 'below' && currentPrice < threshold) {
                            console.log(`Alert triggered for ${userId}: ${crypto} price is below ${threshold}`);
                            sendSMS(phoneNumber, `Alert: ${crypto} price is below ${threshold}`);
                            sentAlerts.add(alertKey);
                        }
                    }
                }
            }


            for (const crypto in defaultThresholds) {
                const { threshold, direction } = defaultThresholds[crypto];
                const currentPrice = prices[crypto];

                const alertKey = `default-${crypto}-${threshold}-${direction}`;
                if (!sentAlerts.has(alertKey)) {
                    if (direction === 'above' && currentPrice > threshold) {
                        console.log(`Default alert triggered: ${crypto} price is above ${threshold}`);
                        sendSMS('+51920523938', `Default alert: ${crypto} price is above ${threshold}`);
                        sentAlerts.add(alertKey);
                    } else if (direction === 'below' && currentPrice < threshold) {
                        console.log(`Default alert triggered: ${crypto} price is below ${threshold}`);
                        sendSMS('++51920523938', `Default alert: ${crypto} price is below ${threshold}`);
                        sentAlerts.add(alertKey);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching prices or sending alerts:', error);
    }
}, 60000);

function sendSMS(to, body) {
    client.messages
        .create({
            body: body,
            from: '+19382014484',
            to: to
        })
        .then(message => console.log(`SMS sent to ${to}. Message SID: ${message.sid}`))
        .catch(error => console.error(`Error sending SMS to ${to}:`, error));
}

app.post('/alerts', (req, res) => {
    try {
        const { userId, crypto, threshold, direction, phoneNumber } = req.body;

        if (!userAlerts[userId]) {
            userAlerts[userId] = [];
        }

        userAlerts[userId].push({ crypto, threshold, direction, phoneNumber });

        res.send('Alert set successfully');
    } catch (error) {
        console.error('Error setting alert:', error);
        res.status(500).send('Error setting alert');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

