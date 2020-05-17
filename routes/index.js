var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index');
  const html = fs.readFileSync(path.resolve(__dirname, '../public/index.html'), 'utf-8')
  res.send(html)
});


module.exports = router;