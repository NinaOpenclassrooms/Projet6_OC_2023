const rateLimit = require('express-rate-limit');

//Start blocking after 3 signup requests from the same IP address per 1 hour window
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message:
        "Too many accounts created from this IP, please try again later."
});
signupLimiter.use();

//Start blocking after 10 sauce creation requests from the same IP address per 1 hour window
const createSauceLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message:
        "Too many sauces created from this IP, please try again later."
});

module.exports = signupLimiter;
module.exports = createSauceLimiter;
