const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const cors = require('cors');

app.use(cors());
// Configure allowed origins, methods, and headers
app.options('*', cors());

app.use(express.json()); 

async function generateShortUrl() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 6;

    let shortUrl = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortUrl += characters.charAt(randomIndex);
    }

    // Check if the generated short URL is unique
    const existingShortUrl = await ShortUrl.findOne({ short: shortUrl });
    if (existingShortUrl) {
        // If not unique, recursively generate a new short URL
        return generateShortUrl();
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
}
);

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    shortUrl.save();

    res.redirect(shortUrl.full);
}
);

app.post('/shortUrls', async (req, res) => {
    const shortUrl = await generateShortUrl(); // Generate the short URL manually
    console.log(req.body.fullUrl);
    await ShortUrl.create({ full: req.body.fullUrl, short: shortUrl });
    //Send response ok
    res.status(200).send({ message: 'Short URL created' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on port 3000');
}
);
