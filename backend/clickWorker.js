const mongoose = require('mongoose');
const Redis = require('ioredis');
const ShortUrl = require('./models/shortUrl');

// Connect to MongoDB
mongoose.connect('mongodb+srv://aayushkuntal2002:usi2002@tinyurl.86cdmro.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Redis connection configuration
const client = new Redis({
  host: 'singapore-keyvalue.render.com',
  port: 6379,
  username: 'red-d11752emcj7s739tsub0',
  password: 'OekMNYAWlOonXA2ElNQs21BnbhdDNDPx',
  tls: {}, // Enable TLS
});

// Handle Redis connection events
client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Function to process each click from the queue
async function processClick(shortUrlId) {
    console.log(`Processing click for ${shortUrlId}`);
    try {
        await ShortUrl.findOneAndUpdate(
            { short: shortUrlId },
            { $inc: { clicks: 1 } }
        );
    } catch (err) {
        console.error(`Error updating clicks for ${shortUrlId}:`, err);
    }
}

// Listen to the queue and process clicks
async function listenToQueue() {
    console.log('Listening to queue...');
    while (true) {
        try {
            const data = await client.blpop('clickQueue', 0); // Waits until there's data in 'clickQueue'
            const shortUrlId = data[1]; // Extracts the short URL ID (index 1 in ioredis response)
            await processClick(shortUrlId);
        } catch (err) {
            console.error('Error processing queue:', err);
        }
    }
}

// Start listening to the queue
listenToQueue();