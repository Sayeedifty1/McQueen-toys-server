const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

// ! Middleware
app.use(cors());
app.use(express.json());

// !MOnogDB Connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsyuaxc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const allToyCollection = client.db("toyCommerceDB").collection("allToys");

    //! getting all toys
    
    app.get('/alltoys', async (req, res) => {
        const cursor = allToyCollection.find().limit(20);
        const result = await cursor.toArray();
        res.send(result);
    })
    // ! getting new toys from client side
    app.post('/alltoys', async (req, res) => {
        const newToy = req.body;
        console.log(newToy);
        const result = await allToyCollection.insertOne(newToy);
        res.send(result);
    });
    //  sending data to client side filtering by email
    app.get('/alltoys/:email', async (req, res) => {
        const email = req.params.email;
        console.log(email)
        const query = { sellerEmail: email };
        const cursor = allToyCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy server is running')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
