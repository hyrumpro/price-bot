const { fetchMemecoins } = require('./memecoinFetcher');

const tokenAddresses = '0x2170Ed0880ac9A755fd29B2688956BD959F933F8,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c,';

fetchMemecoins(tokenAddresses)
    .then((memecoins) => {
        console.log('Fetched memecoins:', memecoins);
    })
    .catch((error) => {
        console.error('Error:', error);
    });