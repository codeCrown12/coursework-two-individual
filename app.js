// Initialize express application
const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()


// Create a database connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const url = "mongodb+srv://dbschoolhero:uJkTKLFBLIHB06xE@testcluster.l7oe0.mongodb.net/schoolherodb?retryWrites=true&w=majority";
let db
MongoClient.connect(url, (err, client) => {
    db = client.db()
})

app.use(express.json())

// Logging middleware
app.use(function(req, res, next){
    console.log("Request url: "+req.url)
    console.log("Request date: "+new Date())
    console.log("Request IP: "+req.ip)
    next()
})


// Entry point url
app.get('/', (req, res, next) => {
    res.send('MongoDB and Express coursework two')
})

// Retrieve all lessons
app.get('/getlessons', (req, res, next) => {
    db.collection('activities').find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
    })
})

// Update lesson spaces
app.put('/updatespaces/:id', (req, res, next) => {
    let filter = { _id: new ObjectID(req.params.id) }
    let new_value = { $set: req.body }
    let options = { safe: true, multi: false }
    db.collection('activities').update(filter, new_value, options, (err, result) => {
        if (err) return next(err)
        res.send({msg: "successfully updated"})
    })
})

// Static file middleware
app.use(function(req, res, next){
    var filePath = path.join(__dirname, req.url)
    fs.stat(filePath, function(err, fileInfo){
        if (err) {
            next()
            return
        }
        if (fileInfo.isFile()) {
            res.sendFile(filePath)
        }
        else{
            next()
        }
    })
})

app.use(function(req, res){
    res.status(404)
    res.send("file not found")
})



app.listen(3000)
