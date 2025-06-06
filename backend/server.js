const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const Redis = require('ioredis');
const cors = require('cors');
require('dotenv').config()

app.use(cors());
app.options('*', cors());

app.use(express.json()); 

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

async function generateShortUrl() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;

    let shortUrl;
    let isUnique = false;

    while (!isUnique) {
        shortUrl = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            shortUrl += characters.charAt(randomIndex);
        }

        const existingShortUrl = await ShortUrl.findOne({ short: shortUrl });
        if (!existingShortUrl) {
            break;
        }
    }

    return shortUrl;
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://aayushkuntal2002:usi2002@tinyurl.86cdmro.mongodb.net/?retryWrites=true&w=majority', {
            //To remove warnings
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
connectDB();
app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find();

    res.json(shortUrls);
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrlParam = req.params.shortUrl;

    try {
        const cachedShortUrl = await client.get(`shortUrl:${shortUrlParam}`);

        let shortUrl;

        if (cachedShortUrl) {
            console.log('Serving from cache');
            shortUrl = { short: shortUrlParam, full: cachedShortUrl };
        } else {
            console.log('Serving from MongoDB');
            shortUrl = await ShortUrl.findOne({ short: shortUrlParam });

            if (shortUrl) {
                await client.set(`shortUrl:${shortUrlParam}`, shortUrl.full, { EX: 86400 }); // Cache the full URL in Redis with TTL
            }
        }

        if (shortUrl == null) return res.sendStatus(404);

        await client.RPUSH('clickQueue', shortUrl.short);
        res.redirect(shortUrl.full);
    } catch (err) {
        console.error('Error pushing to Redis clickQueue:', err);
    }

});


app.post('/shortUrls', async (req, res) => {
    const fullUrl = req.body.fullUrl;

    const existingShortUrl = await ShortUrl.findOne({ full: fullUrl });
    if (existingShortUrl) {
        return res.status(200).send({ message: 'Short URL already exists', shortUrl: existingShortUrl.short });
    }
    const shortUrl = await generateShortUrl();
    await ShortUrl.create({ full: req.body.fullUrl, short: shortUrl });
    
    res.status(200).send({ message: 'Short URL created successfully!' });
});

app.listen(process.env.PORT || 4000, () => {
    console.log('Server listening on port 4000');
});