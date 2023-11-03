const mongoClient = require('mongodb').MongoClient;
const { MongoClient } = require("mongodb");

const state = {
    db: null,
};


const url = "mongodb://127.0.0.1:27017";        // mongodb connection string
const dbName = "bookmyshow";                      // database name

// create a new mongodb client object
const client = new MongoClient(url);

// function to establish mongodb connection
const connect = async (cb) => {
    try {
        // connecting to mongodb
        await client.connect();
        // setting up database name to the connected client
        const db = client.db(dbName);
        // setting up database name to the state
        state.db = db;
        // callback after connected
        return cb();
    }
    catch (err) {
        // callback when an error occurs
        return cb(err);
    }
};

// function to get the database instance
const get = () => state.db;

// exporting functions
module.exports = {
    connect, get,
};