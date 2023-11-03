var express = require('express');
var router = express.Router();
var dbHelpers = require('../helpers/db-helpers');
const { response } = require('../app');

const title = "BookMyShow";
//const admin=false;


router.get('/', function (req, res, next) {
  let admin = req.session.admin;
  console.log(admin)
  if (admin) {
    dbHelpers.getMoviesTrendingOne().then((moviesTrendingOne) => {
      console.log(moviesTrendingOne)
      dbHelpers.getMoviesTrendingTwo().then((moviesTrendingTwo) => {
        console.log(moviesTrendingTwo)
        dbHelpers.getMoviesTrendingThree().then((moviesTrendingThree) => {
          console.log(moviesTrendingThree)
          res.render('admin/view-movies', { title, moviesTrendingOne, moviesTrendingTwo, moviesTrendingThree, admin})
        })
      });
    });
  } else {
    res.render('admin/admin-login', { title })
  }

});

router.get('/add-movies-trending-one', function (req, res, next) {
  dbHelpers.checkMovieCountInTrendingOne().then((movieCount) => {
    console.log(movieCount)
    if (movieCount >= 4) {
      res.status(400).send('You cannot add more than 4 movies.');
    } else {
      res.render('admin/add-movies-trending-one', { title, admin: true })
    }

  })

})

router.get('/add-movies-trending-two', function (req, res, next) {
  dbHelpers.checkMovieCountInTrendingTwo().then((movieCount) => {
    console.log(movieCount)
    if (movieCount >= 4) {
      res.status(400).send('You cannot add more than 4 movies.');
    } else {
      res.render('admin/add-movies-trending-two', { title, admin: true })
    }
  })

})

router.get('/add-movies-trending-three', function (req, res, next) {
  dbHelpers.checkMovieCountInTrendingThree().then((movieCount) => {
    console.log(movieCount)
    if (movieCount >= 4) {
      res.status(400).send('You cannot add more than 4 movies.');
    } else {
      res.render('admin/add-movies-trending-three', { title, admin: true })
    }
  })

})

router.post('/add-movies-trending-one', function (req, res, next) {
  console.log(req.body);
  console.log(req.files.Image)
  dbHelpers.addMoviesTrendingOne(req.body, (id) => {
    console.log(id)
    let image = req.files.Image
    image.mv('./public/images/movies-trending-one/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/view-movies", { title, admin: true })
      }
      else {
        console.log(err)
      }
    })

  })
})
router.post('/add-movies-trending-two', function (req, res, next) {
  console.log(req.body);
  console.log(req.files.Image)
  dbHelpers.addMoviesTrendingTwo(req.body, (id) => {
    image = req.files.Image
    image.mv('./public/images/movies-trending-two/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/view-movies", { title, admin: true })
      }
      else {
        console.log(err)
      }
    })
  })
})
router.post('/add-movies-trending-three', (req, res, next) => {
  console.log(req.body)
  console.log(req.files.Image)
  dbHelpers.addMoviesTrendingThree(req.body, (id) => {
    image = req.files.Image
    image.mv('./public/images/movies-trending-three/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/view-movies", { title, admin: true })
      } else {
        console.log(err)
      }
    })
  })
})
router.get('/remove-movie-trending-three/:id', function (req, res, next) {
  let movie_id = req.params.id
  console.log(movie_id)
  dbHelpers.removeMoviesTrendingThree(movie_id).then((data) => {
    //console.log(data)
    res.render('admin/view-movies', { title, admin: true })
  })
})
router.get('/remove-movies-trending-two/:id', function (req, res, next) {
  let movie_id = req.params.id
  console.log(movie_id)
  dbHelpers.removeMoviesTrendingTwo(movie_id).then((data) => {
    res.render('admin/view-movies', { title, admin: true })
  })
})
router.get('/remove-movies-trending-one/:id', function (req, res, next) {
  let movie_id = req.params.id
  console.log(movie_id)
  dbHelpers.removeMoviesTrendingOne(movie_id).then((data) => {
    res.render('admin/view-movies', { title, admin: true })
  })

})
router.post('/admin-login', (req, res) => {
  console.log(req.body)
  dbHelpers.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      console.log("LoggedIn...")
      res.redirect('/admin')
    } else {
      res.redirect('/admin-login')
    }
  })
}),
router.get('/logout',(req, res)=>{
  req.session.destroy();
  res.render(('admin/admin-login'))
})
module.exports = router;
