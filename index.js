const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


//---- middle wares
app.use(cors());
app.use(express.json());
//--------------------------



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.e3n1sso.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const serviceCollection = client.db('travelax').collection('services');
        const reviewCollection = client.db('travelax').collection('reviews');

        // get 3 or all services
        app.get('/services', async (req, res) => {
            const count = parseInt(req.query.count);
            const query = {}
            const cursor = serviceCollection.find(query);

            if (count) {
                const services = await cursor.limit(3).toArray();
                // const services = servicesNotReversed.reverse().limit(3);
                res.send(services)
            }
            else {
                const services = await cursor.toArray();
                res.send(services)
            }
        })

        // add new service
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })


        // read specific service data according to _id
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })


        // get all reviews of a single "service" & get all reviews of a single "user"
        app.get('/reviews', async (req, res) => {
            const title = req.query.title;
            const email = req.query.email;
            // console.log(email);

            const queryOne = { serviceName: title }
            const queryTwo = { email: email }

            const cursorOne = reviewCollection.find(queryOne)
            const cursorTwo = reviewCollection.find(queryTwo)

            if (title) {
                const reviews = await cursorOne.toArray();
                res.send(reviews);
            }

            if (email) {
                const reviews = await cursorTwo.toArray();
                res.send(reviews);
            }
        })

        //  create reviews api [get data of reviews from site and send it to mongodb]
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            // console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        // // update review
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const message = req.body;
            console.log(message, id);
            const query = { _id: ObjectId(id) };

            const updatedDoc = {
                $set: {
                    reviewMessage: message.reviewMessage
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })


        // delete review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })
    }

    finally {

    }
}

run().catch(err => console.error(err));


// -------------------------------------------
app.get('/', (req, res) => {
    res.send('genius car server running')
});

app.listen(port, () => {
    console.log(`Genius car server running on port: ${port}`);
})
//---------------------------------------------
