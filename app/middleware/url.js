import Url from '../models/url';
const domain = `localhost:3050/`;

export const handleUrls = (req, res, next) => {
  const url = req.params[0];

  Url.findOne({ 'originalUrl': url })
    .exec()
    .then(function findSuccess(data) {
      if (data) {
        // get a document from mongo then send to client
        res.json(data);
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
              res.json(newUrl);
              next();
            });
        });
      }
    }).catch((err) => {
          console.log(err);
        })
}

export function getFromShort(req, res, next) {
  const { id } = req.params;

  Url.findOne({ 'idUrl': id })
    .exec()
    .then(function findSuccess(data) {
      if (data) {
        // console.log('the redirect');
        // console.log(data.originalUrl);
        res.redirect(data.originalUrl);
      } else {
        res.json({
          error: 'There is no long Url that matches your shortUrl. Please create the shortUrl first then try again.'
        });
      }
    })
    .catch(function perror(err) {
      throw err;
    });
    next();

}