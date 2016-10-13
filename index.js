/* jshint esversion:6 */

const io = require('socket.io')(3006);
const Twitter = require('node-tweet-stream');
const stream = new Twitter(require('./config.json'));

const tracker = {};

const updateTracking = (keywords) => {
  keywords.forEach((keyword) => stream.track(keyword));
};

io.on('connection', (socket) => {
  'use strict';

  let currentKeywords = ['javascript', '#js'];

  socket.emit('set', currentKeywords);

  stream.on('tweet', (tweet) => {
    if (tracker[tweet.id]) {
      return;
    }

    tracker[tweet.id] = true;
    io.emit('tweet', tweet);
  });

  stream.on('error', (error) => {
    io.emit('error', error);
  });

  stream.language('en');
  updateTracking(currentKeywords);

  socket.on('keywords', (keywords) => {
    currentKeywords.forEach((keyword) => stream.untrack(keyword));
    currentKeywords = keywords.split(',');
    updateTracking(currentKeywords);
    console.log('updated keywords:', currentKeywords);
  });
});
