// ========================================================
//här skapar vi mallar för hur data får se ut.
//Schemas skapas med mongoose.
//Mongo db - alone är schemaless.

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.
// ========================================================


const mongoose = require("mongoose");


//skapar en ny schema och skickar in ett objekt som beskriver hur datamodellen bör se ut.
const eventActivitySchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        startTime: {
            type: Date,
            required: true
        },
        endTime: Date,
    },
    {
        timestamps: true
    });

//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("EventActivity", eventActivitySchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.