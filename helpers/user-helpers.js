var db = require('../config/connections')
var collection = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const Razorpay = require('razorpay');
const crypto = require('crypto')

// var instance = new Razorpay({
//     key_id: 'rzp_test_uA5ewq63QE8rD8',
//     key_secret: 'nr35Bfe85vubRREoznebTKKR',
// });

module.exports = {
    getMoviedetailsTrendingOne: (movie_id) => {
        console.log(movie_id)
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.TRENDING_ONE).findOne({ _id: new objectId(movie_id) }).then((movieDetails) => {
                resolve(movieDetails)
                console.log(movieDetails)
            })

        })
    },
    getMoviedetailsTrendingTwo: (movie_id) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.TRENDING_TWO).findOne({ _id: new objectId(movie_id) }).then((movieDetails) => {
                resolve(movieDetails)
                console.log(movieDetails)
            })

        })
    },
    getMoviedetailsTrendingThree: (movie_id) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.TRENDING_THREE).findOne({ _id: new objectId(movie_id) }).then((movieDetails) => {
                resolve(movieDetails)
                console.log(movieDetails)
            })

        })
    },
    storeBookingInfo: (bookingDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKING_INFO).insertOne(bookingDetails).then((response) => {
                resolve(response)
            })
        })
    },
    getBookingDetails: (movieId) => {
        console.log(movieId)
        const query = { movieId: movieId };
        return new Promise(async (resolve, reject) => {
            try {
                const bookingDetails = await db.get().collection(collection.BOOKING_INFO)
                    .find(query)
                    .toArray();

                //console.log(bookingDetails[0].seatNumbers); // Log the data for debugging purposes
                if (bookingDetails.length > 0) {
                    blockedSeats = [];
                    blockedSeats = bookingDetails.map((value) => value.seatNumbers);
                    //console.log(blockedSeats);
                    resolve(blockedSeats);

                } else {
                    resolve([]);
                }


            } catch (error) {
                reject(error);
            }
        });
    },
    doSignUp: (userData) => {
        console.log(userData)
        const dataToHash = userData.password;
        const saltRounds = 10;
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hashSync(dataToHash, saltRounds);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve(response.insertedId)
            })
        })
    },
    doLogin: (loginData) => {
        console.log(loginData)
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: loginData.email })
            if (user) {
                bcrypt.compare(loginData.password, user.password).then((status) => {
                    if (status) {
                        console.log("Login Success!");
                        response.user = user;
                        response.status = true;
                        resolve(response)
                    } else {
                        console.log("Login Failed.");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("Login Failed.");
                resolve({ status: false })
            }
        })

    },
    getUserBookings: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {
            const userBookings = await db.get().collection(collection.BOOKING_INFO).find({ userId: userId }).toArray()
            console.log(userBookings)
            resolve(userBookings)
        })
    },
    placeOrder: (orderDetails) => {
        console.log(orderDetails) //Order details include total, userId, movieId, date, seatNumbers
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKINGS).insertOne(orderDetails).then((response) => {
                resolve(response.insertedId)
            })
        })
    },
    generateRazorPay: (orderId, orderDetails) => {
        console.log(orderDetails)
        console.log(orderId)
        const totalPrice = orderDetails.total;
        return new Promise((resolve, reject) => {
            var options = {
                amount: totalPrice * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("New order:", order);
                    resolve(order)
                }
            })

        })
    },
    verifyPayment: (paymentDetails) => {
        let hmac = crypto.createHmac('sha256', 'nr35Bfe85vubRREoznebTKKR')
        return new Promise((resolve, reject) => {
            hmac.update(paymentDetails['payment[razorpay_order_id]'] + '|' + paymentDetails['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')

            if (hmac == paymentDetails['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BOOKINGS)
                .updateOne({ _id: new objectId(orderId) },
                    {
                        $set: { status: 'placed' }
                    }
                ).then(() => {
                    resolve()
                })
        })
    }
}