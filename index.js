require('dotenv').config();
const fetch = require('node-fetch');
const cron = require('node-cron');
const Twitter = require('twitter');

const getFullyVaccinatedPercent = async () => {
  try {
    const response = await fetch('https://covid-vaccinatie.be/en');
    const pageHtml = await response.text();
    const html = pageHtml.match(/(?<=Fully vaccinated).*?(?=of the population)/is)[0];
    const percent = html.match(/([\d.]+?)%/)[0];

    return parseFloat(percent) / 100.0;;
  } catch {
    console.log('Could not scrape percentage');
    return null;
  }
};

const percentToAsciiProgressBar = (percent) => {
  const emptyBlock = '░';
  const fullBlock = '▓';
  const blocks = 20;
  const fullBlocks = Math.round(percent * blocks);
  const emptyBlocks = blocks - fullBlocks;

  return `${fullBlock.repeat(fullBlocks)}${emptyBlock.repeat(emptyBlocks)}`;
};

const tweet = async () => {
  const percent = await getFullyVaccinatedPercent();
  const progressBar = percentToAsciiProgressBar(percent);
  const tweet = `${progressBar} ${percent * 100}%`;

  const twitter = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
  });

  try {
    const response = await twitter.post('statuses/update', { status: tweet });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
};

cron.schedule('00 11 * * *', tweet);
