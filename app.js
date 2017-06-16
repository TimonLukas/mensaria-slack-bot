require('dotenv').config();

const util = require('./util');
const moment = require('moment');
const WebClient = require('@slack/client').WebClient;
const express = require('express');

const client = new WebClient(process.env.SLACK_TOKEN);

const PORT = process.env.SLACK_MENSA_PORT || 8020;

const app = express();

app.get('/', (request, response) => {
  util.hasRunToday().then(hasRun => {
    if (!hasRun) {
      util.getHtml().then(html => {
        const dishes = util.getDishes(html);
        if (dishes.length > 0) {
          util.writeDate();
          const dishMessage = dishes.map(dish => {
            return dish.render();
          }).join('\r\n\r\n');

          const todaysDate = moment().format('DD.MM.YYYY');
          const message = `<!channel> Das Mensa-Menü für den ${todaysDate}:\r\n\r\n${dishMessage}`;

          client.chat.postMessage('mensa', message, (error, result) => {
            if (typeof error !== 'undefined') {
              throw error;
            }
          });
        }
      });
    }
  });
});

app.listen(PORT);