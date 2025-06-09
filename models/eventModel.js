// ========================================================
//här skapar vi mallar för hur data får se ut.
//Schemas skapas med mongoose.
//Mongo db - alone är schemaless.

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.
// ========================================================


const mongoose = require("mongoose");


//skapar en ny schema och skickar in ett objekt som beskriver hur datamodellen bör se ut.
const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: String,
        color: String,
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        location: String,
        ownerUserAuthId: {
            type: String,
            required: true
        }, connectionCode: {
            type: String,
            required: true,
            unique: true,   // <-- här lägger du till unikt index
            lowercase: true // <-- gör så att det alltid sparas i små bokstäver
        },

    },
    {
        timestamps: true
    });

//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("Event", eventSchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.