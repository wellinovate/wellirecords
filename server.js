import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const MONGO_URI = process.env.MONGO_URI; // set in .env, e.g. mongodb+srv://user:pass@cluster.mongodb.net/hospital
const DB_NAME = process.env.DB_NAME || 'hospital';

let db;

async function start() {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB Atlas');

  watchCollection('labOrders', 'lab_order_change');
  watchCollection('pharmacyOrders', 'pharmacy_order_change');

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

// Watches a collection and broadcasts every insert/update/delete to all
// connected clients on the given socket event name.
function watchCollection(collectionName, eventName) {
  const changeStream = db.collection(collectionName).watch([], { fullDocument: 'updateLookup' });

  changeStream.on('change', (change) => {
    io.emit(eventName, {
      operationType: change.operationType, // 'insert' | 'update' | 'delete'
      documentId: change.documentKey?._id,
      document: change.fullDocument || null,
    });
  });

  changeStream.on('error', (err) => {
    console.error(`Change stream error on ${collectionName}:`, err);
  });
}

// --- Lab orders ---

app.get('/api/lab-orders', async (req, res) => {
  try {
    const orders = await db.collection('labOrders').find({}).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lab orders' });
  }
});

app.post('/api/lab-orders', async (req, res) => {
  try {
    const order = { ...req.body, status: req.body.status || 'pending', createdAt: new Date() };
    const result = await db.collection('labOrders').insertOne(order);
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lab order' });
  }
});

app.patch('/api/lab-orders/:id', async (req, res) => {
  try {
    await db.collection('labOrders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lab order' });
  }
});

// --- Pharmacy orders ---

app.get('/api/pharmacy-orders', async (req, res) => {
  try {
    const orders = await db.collection('pharmacyOrders').find({}).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacy orders' });
  }
});

app.post('/api/pharmacy-orders', async (req, res) => {
  try {
    const order = { ...req.body, status: req.body.status || 'pending', createdAt: new Date() };
    const result = await db.collection('pharmacyOrders').insertOne(order);
    res.status(201).json({ _id: result.insertedId, ...order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pharmacy order' });
  }
});

app.patch('/api/pharmacy-orders/:id', async (req, res) => {
  try {
    await db.collection('pharmacyOrders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pharmacy order' });
  }
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
