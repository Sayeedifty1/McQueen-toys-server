const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5000;

// ! Middleware
app.use(cors());
app.use(express.json());

// !MOnogDB Connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsyuaxc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 50,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err => {
            if (err) {
                console.log(err);
                return;
            }
        }));
        const allToyCollection = client.db("toyCommerceDB").collection("allToys");

        //! getting all toys

        app.get('/alltoys', async (req, res) => {
            const cursor = allToyCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })
        // get toy by id
        app.get('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await allToyCollection.find(query).toArray();
            res.send(result[0]);
        });


        //  sending data to client side filtering by email & sorting by price 
        app.get('/alltoys/seller/:email', async (req, res) => {
            const email = req.params.email;
            const sort = req.query.sort; // Get the sorting parameter from the query string

            try {
                const query = { sellerEmail: email };
                const cursor = allToyCollection.find(query);

                if (sort === 'asc') {
                    cursor.sort({ price: 1 }); // Sort by price in ascending order
                } else if (sort === 'desc') {
                    cursor.sort({ price: -1 }); // Sort by price in descending order
                }

                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Server Error' });
            }
        });

        // ! getting new toys from client side
        app.post('/alltoys', async (req, res) => {
            const newToy = req.body;
            console.log(newToy);
            const result = await allToyCollection.insertOne(newToy);
            res.send(result);
        });
        // patch for updating a toy
        app.patch('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToy = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description,
                },
            };
            const result = await allToyCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        // ! for deleting a toy
        app.delete('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log(query)
            const result = await allToyCollection.deleteOne(query);
            res.send(result);
        });
        // all toys by category
        app.get('/tabs/:category', async (req, res) => {
            try {
                const category = req.params.category;
                const query = { subCategory: { $regex: category, $options: 'i' } };
                const result = await allToyCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching toys by sub-category:', error);
                res.status(500).json({ error: 'Failed to fetch toys by sub-category' });
            }
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
