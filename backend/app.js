const express = require('express');

const mongoose = require('mongoose');

const helmet = require('helmet');

const dotenv = require("dotenv");
dotenv.config();

const rateLimit = require('express-rate-limit');

const mongoKey = process.env.MONGO_URI;

//Start blocking after 10 requests from the same IP address per second
const rateLimiter = rateLimit({
    windowMs: 1000,
    limit: 10,
    message:
        "Too many requests, try again later."
})

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const path = require('path');

const app = express();

// Helmet use with desactivation of Cross-Origin-Ressource-Policy headers
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    }),
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

mongoose.connect(mongoKey,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use('/api/sauces', rateLimiter, saucesRoutes);
app.use('/api/auth', rateLimiter, userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;