const { fetchPrices } = require('./priceFetcher');

// Test case
const cryptocurrencies = ['bitcoin', 'ethereum', 'ripple'];

fetchPrices(cryptocurrencies)
    .then((prices) => {
        console.log('Fetched prices:', prices);

        // Assert that the fetched prices object has the expected structure
        cryptocurrencies.forEach((crypto) => {
            if (prices[crypto]) {
                console.log(`Price of ${crypto} is fetched successfully.`);
            } else {
                console.error(`Price of ${crypto} is missing.`);
            }
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });