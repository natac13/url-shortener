'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleUrls = undefined;
exports.testUrl = testUrl;
exports.getFromShort = getFromShort;

var _url = require('../models/url');

var _url2 = _interopRequireDefault(_url);

var _isURL = require('validator/lib/isURL');

var _isURL2 = _interopRequireDefault(_isURL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var domain = 'localhost:3050/';

function clientData(doc) {
  return {
    shortUrl: doc.shortUrl,
    originalUrl: doc.originalUrl
  };
}

function testUrl(req, res, next) {
  // the capture group from the regex is stored as numeric keys of the params
  // object
  // 0 being the invalid?allow=true part
  console.log(req.params);
  console.log('testURL');
  var invalid = req.params[0];
  var url = req.params[1];
  if (invalid) {
    next();
  } else {
    if ((0, _isURL2.default)(url)) {
      next();
    } else {
      res.json({
        error: 'Invalid URL input. Please input a valid URL and try again. Happy coding!'
      });
    }
  }
}

var handleUrls = exports.handleUrls = function handleUrls(req, res, next) {
  var url = req.params[1];

  _url2.default.findOne({ 'originalUrl': url }).exec().then(function findSuccess(data) {
    if (data) {
      // get a document from mongo then send to client
      res.json(clientData(data));
      next();
    } else {
      // no doc found which will usually happen
      // grab the last doc in the db
      _url2.default.find().sort({ 'idUrl': -1 }).limit(1).exec().then(function (doc) {
        var re = /https?:\/\//;

        if (!re.test(url)) {
          url = 'http://' + url;
        }

        // grab the idUrl from the last doc
        var oldestIdUrl = doc[0].idUrl;
        var newUrlId = oldestIdUrl + 1;
        // build new doc for db.
        var newUrl = new _url2.default();
        newUrl.originalUrl = url;
        newUrl.shortUrl = '' + domain + newUrlId;
        newUrl.idUrl = newUrlId;
        return newUrl.save().then(function saveSuccess() {
          res.json(clientData(newUrl));
          next();
        });
      });
    }
  }).catch(function (err) {
    console.log(err);
    res.redirect('/');
  });
};

function getFromShort(req, res, next) {
  var id = req.params.id;


  _url2.default.findOne({ 'idUrl': +id }).exec().then(function findSuccess(data) {
    if (data) {
      res.redirect(data.originalUrl);
    } else {
      res.json({
        error: 'There is no long Url that matches your shortUrl. Please create the shortUrl first then try again.'
      });
    }
  }).catch(function perror(err) {
    throw err;
    res.redirect('/');
  });
  next();
}
