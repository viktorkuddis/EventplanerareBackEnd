//för att nå env-variablar i koden behövs installation av paketet dotenv.
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { createClerkClient } = require('@clerk/backend');

//  Skapa Clerk-klienten 
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });



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

//=============================================
//   slut på MIDLLEWARE // slut på MIDLLEWARE 



// CLERK MIDDLEWARE-funtion att skydda rutter med:
// Verifierar användarens session-token från Authorization-headern
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Kontrollera att token finns
    if (!authHeader) {
        return res.status(401).json({ message: 'Ingen token skickad (Authorization-header saknas)' });
    }
    // Ta bort "Bearer " från början av strängen
    const token = authHeader.replace('Bearer ', '');

    try {
        // Verifiera token med Clerk
        const session = await clerkClient.sessions.verifySession(token);
        // Om giltig token – spara auth-info på request-objektet
        req.auth = session;
        next(); // släpp vidare till nästa middleware eller route
    } catch (err) {
        console.error('❌ Clerk-verifiering misslyckades:', err);
        return res.status(401).json({ message: 'Ogiltig eller utgången token' });
    }
};


//Route handelers:
//Route handelers:
//Route handelers:

// Exempelrutt som test för grundrutt:
app.get("/", (req, res) => {
    res.json({ message: "Här finns inte mycket att se" });
});

// Alla rutter som börjar med /api kräver autentisering
app.use("/api", requireAuth, routes);


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