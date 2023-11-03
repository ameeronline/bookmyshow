var express = require('express');
var router = express.Router();
var dbHelpers= require('../helpers/db-helpers')
var userHelpers=require('../helpers/user-helpers');
const { response, resource } = require('../app');


/* GET home page. */
let title="BookMyShow";
router.get('/', function(req, res, next) {
  let user=req.session.user;
  console.log(user)

  dbHelpers.getMoviesTrendingOne().then((moviesTrendingOne)=>{
    dbHelpers.getMoviesTrendingTwo().then((moviesTrendingTwo)=>{
      dbHelpers.getMoviesTrendingThree().then((moviesTrendingThree)=>{
        res.render('index', {title, moviesTrendingOne, moviesTrendingTwo, moviesTrendingThree, user})
      })
    })
  })
});

const verifyLogin=(req, res, next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

router.get('/movie-info-trending-one/:id', function(req,res, next){
  movie_id=req.params.id
  //console.log(movie_id)
  userHelpers.getMoviedetailsTrendingOne(movie_id).then((movieDetails)=>{
    res.render('user/movie-info-trending-one',{title, movieDetails, user:req.session.user})
  })
});

router.get('/movie-info-trending-two/:id', function(req,res, next){
  movie_id=req.params.id
  console.log(movie_id)
  userHelpers.getMoviedetailsTrendingTwo(movie_id).then((movieDetails)=>{
    res.render('user/movie-info-trending-two',{title, movieDetails, user:req.session.user})
  })
});

router.get('/movie-info-trending-three/:id', function(req,res, next){
  movie_id=req.params.id
  console.log(movie_id)
  userHelpers.getMoviedetailsTrendingThree(movie_id).then((movieDetails)=>{
    res.render('user/movie-info-trending-three',{title, movieDetails, user:req.session.user})
  })
});

router.get('/login', function(req, res, next){
  if(req.session.loggedIn==true){
    res.redirect('/')
  }else{
    res.render('user/login', {title,"LoginErr": req.session.userLoginErr})
    req.session.userLoginErr=false;
  }
})
router.get('/sign-up', function(req, res, next){
  res.render('user/sign-up', {title})
})
router.get('/seat-booking/:id', (req, res, next)=>{
  const movie_id=req.params.id;
  console.log(movie_id)
  userHelpers.getBookingDetails(movie_id).then((blockedSeats)=>{
    console.log(blockedSeats);
    res.render('user/seat-booking', {title, movie_id, blockedSeats, user:req.session.user})
  })
  
})

router.use(express.json());
router.post('/seat-booking-info',(req, res, next)=>{
  const bookingInfo = req.body;
  console.log(bookingInfo)
  res.send(JSON.stringify('Data received on the server.'));
  // userHelpers.storeBookingInfo(bookingInfo).then((response)=>{
  //   console.log(response)
  // })
})

router.post('/sign-up', (req, res, next)=>{
  console.log(req.body)
  const userData = req.body
  userHelpers.doSignUp(userData).then((response)=>{
    console.log(response);
  })
})

router.post('/login', (req, res, next)=>{
  console.log("User Trying to Login...")
  console.log(req.body)
  const loginData = req.body;
  userHelpers.doLogin(loginData).then((response)=>{
    console.log(response)
    if(response.status){
      req.session.loggedIn=true;
      req.session.user=response.user;
      console.log("LoggedIn...")
      res.redirect('/')
    }else{
      req.session.userLoginErr=true;
      res.redirect('/login')
    }
  })

})
router.get('/account-info',(req, res, next)=>{
  res.render('user/account-info',{title})
})
router.get('/logout', (req, res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/bookings/:id',verifyLogin,(req, res, next)=>{
  console.log(req.params.id)
  userHelpers.getUserBookings(req.params.id).then((userBookings)=>{
    res.render('user/bookings',{title, user:req.session.user, userBookings})
  })
})

router.post('/place-order', (req, res, next)=>{
  const orderDetails = req.body;
  console.log(orderDetails)
  //res.send(JSON.stringify('Data received on the server.'));
  userHelpers.placeOrder(orderDetails).then((orderId)=>{
    console.log(orderId)
    while(orderId){
      userHelpers.generateRazorPay(orderId, orderDetails).then((response)=>{
        res.json(response) //Passess the order created by RazorPay
      })
    }
  })
})
router.post('/verify-payment',(req, res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment Successfull')
      res.json({status:true})
    })

  }).catch((err)=>{
    console.log(err)
    res.json({status:false, errMsg:''})
  })
})



module.exports = router;