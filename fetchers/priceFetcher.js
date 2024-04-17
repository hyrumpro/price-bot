const axios = require('axios');
const cheerio = require('cheerio');

async function fetchPrices(cryptocurrencies) {
    try {
        const prices = {};

        for (const crypto of cryptocurrencies) {
            const url = `https://coinmarketcap.com/currencies/${crypto}/`;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const priceElement = $('span.sc-f70bb44c-0.jxpCgO');
            const price = parseFloat(priceElement.text().replace(/[^0-9.]/g, ''));

            prices[crypto] = price;
        }

        return prices;
    } catch (error) {
        console.error('Error fetching prices:', error);
        return null;
    }
}

module.exports = {
    fetchPrices,
};