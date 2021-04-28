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

    return parseFloat(percent) / 100.0;
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

let lastPercent = null;
const postTweet = async () => {
  let percent = await getFullyVaccinatedPercent();
  if (!percent) {
    for (let i = 1; i <= 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 * i));
      percent = await getFullyVaccinatedPercent();

      if (percent) {
        break;
      }
    }
  }

  if (!percent) {
    return;
  }

  if (!lastPercent) {
    lastPercent = percent;
    return;
  }

  const tweet = `${percentToAsciiProgressBar(percent)} ${Math.round(percent * 10000) / 100}%`;
  console.log(tweet);

  if (percent.toFixed(2) === lastPercent.toFixed(2)) {
    return;
  }
  percent = lastPercent;

  const twitter = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  try {
    const response = await twitter.post('statuses/update', { status: tweet });
    console.log(response);
  } catch (e) {
    console.error(e);
  }
};

(async () => {
  console.log('Twitter bot is running!');
  await postTweet();

  cron.schedule('00 * * * *', postTweet);
})();
