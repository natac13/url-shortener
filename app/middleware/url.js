import Url from '../models/url';
import isURL from 'validator/lib/isURL';
const domain = `localhost:3050/`;

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
  const url = req.params[1];

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

  Url.findOne({ 'idUrl': id })
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