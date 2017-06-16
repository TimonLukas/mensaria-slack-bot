const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const Dish = require('./Dish');

/**
 * Gets the HTML content of the Mensaria Metropol website
 * @returns {Promise}
 */
const getHtml = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://www.stw-ma.de/speiseplan_mensaria_metropol.html').then(data => {
      if (data.status !== 200) {
        reject();
      }

      resolve(data.data);
    }).catch(error => {
      reject(error);
    });
  });
};

/**
 * Parses the HTML and extracts the dishes from it
 * @param html The HTML string from the Mensaria Metropol website
 * @returns {Array}
 */
const getDishes = html => {
  const $ = cheerio.load(html);
  const rows = $('#mensa_plan > table.t1 > tbody').children('tr');

  const dishes = rows.toArray().map((row) => {
    const children = $(row).children('td');
    const title = children.eq(0).find('b').text();

    const content = children.eq(1).find('p').children().toArray().map((val) => {
      const el = $(val);
      el.children().remove('small');
      return el.text();
    }).join(' ').replace(/\s+/g, ' ').replace(/\s,/g, ',');

    const price = children.eq(3).find('i').text();

    return new Dish(title, content, price);
  });

  return dishes;
};

const hasRunToday = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('lastrun.txt', (error, data) => {
      if (error !== null) {
        if (error.errno === -4058) {
          return resolve(false);
        }

        reject(error);
      }

      const writtenDate = data.toString();
      const nowDate = moment().format('YYYY-MM-DD');

      if (writtenDate !== nowDate) {
        return resolve(false);
      }

      return resolve(true);
    });
  });
};

const writeDate = () => {
  return new Promise((resolve, reject) => {
    const nowDate = moment().format("YYYY-MM-DD");
    fs.writeFile("lastrun.txt", nowDate, (error) => {
      if(error !== null) {
        return reject(error);
      }

      return resolve();
    });
  });
};

module.exports = {
  getHtml,
  getDishes,
  hasRunToday,
  writeDate
};