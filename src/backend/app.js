const express = require('express');
const enforce = require('express-sslify');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (process.env.PORT.toString() !== '4321') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

app.use(express.static(path.join(__dirname, '../../build')));
app.use(favicon(path.join(__dirname, '../../build', 'favicon.ico')));

app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build/index.html'));
});

module.exports = app;
