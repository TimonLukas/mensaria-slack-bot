require('dotenv').config();

const util = require('./util');
const moment = require('moment');
const WebClient = require('@slack/client').WebClient;
const express = require('express');

const client = new WebClient(process.env.SLACK_TOKEN);

const PORT = process.env.SLACK_MENSA_PORT || 8020;
const CHANNEL = process.env.SLACK_MENSA_CHANNEL || '#mensa';

const app = express();

app.get('/', (request, response) => {
  response.end('');
  util.hasRunToday().then(hasRun => {
    if (!hasRun || process.env.DEBUG === 'true') {
      util.getHtml().then(html => {
        const dishes = util.getDishes(html);
        if (dishes.length > 0) {
          util.writeDate();

          const contents = dishes.map(dish => dish.contents);
          const commonElements = contents.shift().reduce((res, v) => {
            if (res.indexOf(v) === -1 && contents.every(a => a.indexOf(v) !== -1)) {
              res.push(v);
            }
            return res;
          }, []);

          const dishMessages = dishes.map(dish => {
            return dish.filteredContents(commonElements).render();
          });

          const todaysDate = moment().format('DD.MM.YYYY');
          const message = `<!channel> Das Mensa-Menü für den ${todaysDate}:\r\n• ${commonElements.join('\r\n• ')}`;

          const submitMessage = (messageQueue) => {
            client.chat.postMessage(CHANNEL, messageQueue[0], (error, result) => {
              if (typeof error !== 'undefined') {
                throw error;
              }

              if(messageQueue.length > 1) {
                submitMessage(messageQueue.slice(1));
              }
            });
          };

          if (process.env.DEBUG !== 'true') {
            client.chat.postMessage(CHANNEL, message, (error, result) => {
              if (typeof error !== 'undefined') {
                throw error;
              }

              submitMessage(dishMessages);
            });
          } else {
            console.log(message);
            console.log(dishMessages);
          }
        }
      });
    }
  });
});

app.listen(PORT);