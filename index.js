const fetch = require('node-fetch');

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

(async () => {
  const percent = await getFullyVaccinatedPercent();
  const progressBar = percentToAsciiProgressBar(percent);

  console.log(`${progressBar} ${percent * 100}%`);
})();
