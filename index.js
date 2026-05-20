const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config();


const uri = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("petra");
    const petCollection = db.collection("pets");
    const adoptedPetCollection = db.collection("adoption");

    app.get('/pet', async (req, res) => {
      const result = await petCollection.find().toArray();
      res.send(result);
    });

    app.post('/pet', async (req, res) => {
        const petData = req.body;
        console.log(petData);
        const result = await petCollection.insertOne(petData);
        res.send(result);
    });

    app.get('/pet/:id', async (req, res) => {
        const id = req.params.id;
        const result = await petCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    app.patch('/pet/:id', async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        console.log(updateData);

        const result = await petCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        res.json(result);
    });

    app.delete('/pet/:id', async (req, res) => {
        const { id } = req.params;
        const result = await petCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
    });

    app.get('/adoption/:userId', async (req, res) => {
        const { userId } = req.params;
        const result = await adoptedPetCollection.find({ userId: userId }).toArray();
        res.json(result);
    });


    app.post('/adoption', async (req, res) => {
        const adoptionData = req.body;
        const result = await adoptedPetCollection.insertOne(adoptionData);

        res.json(result);
    }); 

    app.delete('/adoption/:id', async (req, res) => {
        const { id } = req.params;
        const result = await adoptedPetCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('SERVER RUNNING!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});