import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";
import express from "express";
import { initProd } from "./startup/prod";
import { initDB } from "./startup/db";
import { initCORS } from "./startup/cors";
import { initLogger } from "./startup/logging";
import { initPassportJS } from "./startup/passport";
import { initRoutes } from "./routes/index";
import { checkSubscription } from './CronJobs/CheckSubscription';

require('dotenv').config();

const port = process.env.PORT || 8080;
const app = express();
console.log('port', process.env.HOST);

initPassportJS();
initLogger();
initCORS(app);
initDB();
initProd(app);

// Create session
app.use(
  session({
    // Used to compute a hash
    secret: process.env.SESSION_KEY!,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } when using HTTPS
    // Store session on DB
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/test",
    }),
  })
);

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json({ limit: '50MB' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

initRoutes(app);

checkSubscription.start();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
console.log('====================================');
console.log('Listening on PORT', process.env.PORT);
console.log('====================================');