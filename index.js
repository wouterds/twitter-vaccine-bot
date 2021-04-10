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

(async () => {
  console.log(await getFullyVaccinatedPercent());
})();
