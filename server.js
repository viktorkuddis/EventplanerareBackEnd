// https://clerk.com/docs/references/express/overview#clerk-express-require-auth


// för att nå env-variablar i koden behövs installation av paketet dotenv.
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createClerkClient } = require('@clerk/backend');
const { clerkMiddleware, requireAuth } = require('@clerk/express');


//skapar express app
const app = express();

//hämtar rutterna:
const routes = require("./routes/routes");




// MIDDLEWAREEE // MIDDLEWAREEE // MIDDLEWAREEE
//=============================================
app.use(cors()); // Tillåter alla domäner att göra API-anrop
// Middleware: Parsar JSON-data från begäran (req-objektet)
app.use(express.json());
// Middleware: Loggar metod och sökväg för varje begäran
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
});
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
}));


//=============================================
//   slut på MIDLLEWARE // slut på MIDLLEWARE 




//Route handelers:
//Route handelers:
//Route handelers:

// Exempelrutt som test för grundrutt:
app.get("/", (req, res) => {
    res.json({ message: "Här finns inte mycket att se" });
});

// Alla rutter som börjar med /api kräver autentisering
app.use('/api', requireAuth(), routes)


//ansluter till databas med connectionstring.:
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //appen lyssnar efter förfrågningar på given port om vi har nått databasen.
        app.listen(process.env.PORT, () => {
            console.log(process.env.PORT + " lyssnas på!!");
        });
    })
    .catch((error) => {
        console.log(error);
    }); 