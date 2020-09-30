const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
require('dotenv').config();
console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.afmg3.mongodb.net/express-crud?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// get
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


client.connect(err => {
    const productCollection = client.db("express-crud").collection("product");

    // get
    app.get('/product', (req,res) => {
        // productCollection.find({}).limit(1)
        productCollection.find({})
        .toArray( (error, document) => {
            res.send(document)
        })
    });
    app.get('/product/:id',(req,res) => {
        productCollection.find({_id: ObjectId(req.params.id)})
        .toArray((error,document) => {
            res.send(document[0]);
        })
    })

    // patch
    app.patch('/update/:id',(req,res) => {
        productCollection.updateOne({_id:ObjectId(req.params.id)},
        {
            $set: {name: req.body.name, price: req.body.price, qty: req.body.qty}
        })
        .then(result => {
           res.send(result.modifiedCount > 0);
        }) 
    })

    // post
    app.post('/addProduct', (req, res) => {
        const product = req.body;
        // console.log(product)
        productCollection.insertOne(product)
            .then(result => {
                console.log('One Product Added...');
                // res.send('success');
                res.redirect('/')
            })
    });

    // delete
    app.delete('/delete/:id', (req,res) => {
        // console.log(req.params.id);
        productCollection.deleteOne({_id:ObjectId(req.params.id)})
        .then(result => {
            res.send(result.deletedCount > 0);
        })
    })

    console.log('Database Connected..')
});

app.listen(3000, console.log('Server is Running'));