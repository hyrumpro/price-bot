const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const DEXSCREENER_API_URL = 'https://api.dexscreener.com/latest/dex/tokens';


const http = rateLimit(axios.create(), {
    maxRequests: 300,
    perMilliseconds: 60000,
    maxRPS: 5,
});

async function fetchMemecoins(tokenAddresses) {
    try {
        const response = await http.get(`${DEXSCREENER_API_URL}/${tokenAddresses}`);
        const { pairs } = response.data;

        if (pairs && Array.isArray(pairs)) {
            const memecoins = pairs.map((pair) => ({
                chainId: pair.chainId,
                dexId: pair.dexId,
                pairAddress: pair.pairAddress,
                name: pair.baseToken.name,
                symbol: pair.baseToken.symbol,
                price: pair.priceUsd,
                volume: pair.volume.h24,
                liquidity: pair.liquidity?.usd,
                priceChange: pair.priceChange.h24,
                txns: pair.txns.h24,
                fdv: pair.fdv,
                pairCreatedAt: pair.pairCreatedAt,
            }));

            memecoins.sort((a, b) => b.pairCreatedAt - a.pairCreatedAt);

            return memecoins;
        } else {
            console.warn('No pairs found for the given token addresses');
            return [];
        }
    } catch (error) {
        console.error('Error fetching memecoins:', error);
        return [];
    }
}

module.exports = {
    fetchMemecoins,
};