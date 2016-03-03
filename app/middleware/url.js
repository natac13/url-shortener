import Url from '../models/url';
import isURL from 'validator/lib/isURL';
let domain;

if (process.env.NODE_ENV != 'production') {
  domain = `localhost:3050/`;
} else {
  domain = 'https://hidden-brushlands-29088.herokuapp.com/'
}

function clientData(doc) {
  return {
    shortUrl: doc.shortUrl,
    originalUrl: doc.originalUrl
  };
}


export function testUrl(req, res, next) {
  // the capture group from the regex is stored as numeric keys of the params
  // object
  // 0 being the invalid?allow=true part
  console.log(req.params);
  console.log('testURL')
  const invalid = req.params[0];
  const url = req.params[1];
  if (invalid) {
    next();
  } else {
    if (isURL(url)) {
      next();
    } else {
      res.json({
        error: 'Invalid URL input. Please input a valid URL and try again. Happy coding!'
      });
    }
  }

}

export const handleUrls = (req, res, next) => {
  let url = req.params[1];

  Url.findOne({ 'originalUrl': url })
    .exec()
    .then(function findSuccess(data) {
      if (data) {
        // get a document from mongo then send to client
        res.json(clientData(data));
        next();
      } else {
        // no doc found which will usually happen
        // grab the last doc in the db
        Url.find().sort({ 'idUrl': -1 }).limit(1)
        .exec()
        .then((doc) => {
          const re = /https?:\/\//;

          if (!re.test(url)) {
            url = `http://${url}`;
          }

          // grab the idUrl from the last doc
          const oldestIdUrl = doc[0].idUrl;
          const newUrlId = oldestIdUrl + 1;
          // build new doc for db.
          const newUrl = new Url();
          newUrl.originalUrl = url;
          newUrl.shortUrl = `${domain}${newUrlId}`;
          newUrl.idUrl = newUrlId;
          return newUrl.save()
            .then(function saveSuccess() {
              res.json(clientData(newUrl));
              next();
            });
        });
      }
    }).catch((err) => {
        console.log(err);
        res.redirect('/');
      })
}

export function getFromShort(req, res, next) {
  const { id } = req.params;
  if (id.length > 3) {
    next()
  } else {

    Url.findOne({ 'idUrl': +id })
      .exec()
      .then(function findSuccess(data) {
        if (data) {
          res.redirect(data.originalUrl);
        } else {
          res.json({
            error: 'There is no long Url that matches your shortUrl. Please create the shortUrl first then try again.'
          });
        }
      })
      .catch(function perror(err) {
        throw err;
        res.redirect('/');
      });

  }


}