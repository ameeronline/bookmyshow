var db = require('../config/connections')
var collection = require('../config/collections')
const { response } = require('express')
var objectId = require('mongodb').ObjectId

module.exports = {

    addMoviesTrendingOne: (movies, callback) => {
        console.log(movies)
        db.get().collection('movies-trending-one').insertOne(movies).then((data) => {
            //console.log(data)
            callback(data.insertedId)
        })
    },
    addMoviesTrendingTwo: (movies, callback) => {
        console.log(movies)
        db.get().collection('movies-trending-two').insertOne(movies).then((data) => {
            callback(data.insertedId)
        })
    },
    addMoviesTrendingThree: (movies, callback) => {
        console.log(movies)
        db.get().collection('movies-trending-three').insertOne(movies).then((data) => {
            callback(data.insertedId)
        })
    },
    getMoviesTrendingOne: () => {
        return new Promise(async (resolve, reject) => {
            let movies = await db.get().collection(collection.TRENDING_ONE).find().toArray()
            resolve(movies)

        })
    },
    getMoviesTrendingTwo: () => {
        return new Promise(async (resolve, reject) => {
            let movies = await db.get().collection(collection.TRENDING_TWO).find().toArray()
            resolve(movies)
        })
    },
    getMoviesTrendingThree: () => {
        return new Promise(async (resolve, reject) => {
            let movies = await db.get().collection(collection.TRENDING_THREE).find().toArray()
            resolve(movies)
        })
    },
    checkMovieCountInTrendingOne: () => {
        return new Promise(async (resolve, reject) => {
            let movieCount = await db.get().collection(collection.TRENDING_ONE).countDocuments()
            resolve(movieCount)
        })
    },
    checkMovieCountInTrendingTwo: () => {
        return new Promise(async (resolve, reject) => {
            let movieCount = await db.get().collection(collection.TRENDING_TWO).countDocuments()
            resolve(movieCount)
        })
    },
    checkMovieCountInTrendingThree: () => {
        return new Promise(async (resolve, reject) => {
            let movieCount = await db.get().collection(collection.TRENDING_THREE).countDocuments()
            resolve(movieCount)
        })
    },
    removeMoviesTrendingThree: (movie_id) => {
        return new Promise((resolve, reject) => {
            console.log(movie_id);
            console.log(new objectId(movie_id))
            db.get().collection(collection.TRENDING_THREE).deleteOne({ _id: new objectId(movie_id) }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    removeMoviesTrendingTwo: (movie_id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRENDING_TWO).deleteOne({ _id: new objectId(movie_id) }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    removeMoviesTrendingOne: (movie_id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.TRENDING_ONE).deleteOne({ _id: new objectId(movie_id) }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    doLogin: (loginData) => {
        return new Promise(async (resolve, reject) => {
            let response={};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({
                $and: [
                    { email: loginData.email },
                    { password: loginData.password }
                ]
            });
            if(admin){
                response.admin=admin;
                response.status=true;
                resolve(response)
            }else{
                resolve({status:false})
            }
        })
    }
}