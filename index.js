const express = require('express')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
const cors = require("cors");
require("dotenv").config();
// middleware
// app.use(cors());
const corsOptions ={
  origin:'*', 
  credentials:true,    
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fr7a0ud.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // client.connect();

    const serviceCollection = client.db("toys").collection("toy");

    app.get("/allData", async (req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get("/alldata/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const user = await serviceCollection.findOne(query);
        res.send(user);
      });

      app.get("/data/:text", async (req, res) => {
        const text = req.params.text;
        console.log(text);
        const result = await serviceCollection
          .find({
            $or: [{ toyname: { $regex: text, $options: "i" } }],
          })
          .toArray();
        res.send(result);
      });
      app.get("/ByCategory/:category", async (req, res) => {
        console.log(req.params.id);
        const jobs = await serviceCollection
          .find({
            catagory: req.params.category,
          }).limit(2)
          .toArray();
        res.send(jobs);
      });


    // ​http://localhost:5000/bookings?email=tanvir@gmail.com
      app.get("/bookings",  async (req, res) => {  
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
      });
     


    app.post("/bookings", async (req, res) => {
        const booking = req.body;
        console.log(booking);
        const result = await serviceCollection.insertOne(booking);
        res.send(result);
      });

      app.delete("/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await serviceCollection.deleteOne(query);
        res.send(result);
      });

      app.patch('/alldata/:id', async(req, res) =>{
        const id = req.params.id;
        const user = req.body;
        console.log(id, user);
        
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedUser = {
            $set: {
                price: user.price,
                quantity: user.quantity,
                detail: user.detail
            }
        }

        const result = await serviceCollection.updateOne(filter, updatedUser, options );
        res.send(result);

    })
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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})