// ========================================================
//här skapar vi mallar för hur data får se ut.
//Schemas skapas med mongoose.
//Mongo db - alone är schemaless.

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.
// ========================================================


const mongoose = require("mongoose");


//skapar en ny schema och skickar in ett objekt som beskriver hur datamodellen bör se ut.
const eventParticipationSchema = new mongoose.Schema(
    {
        userAuthId: {
            type: String,
            required: true
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        role: {
            type: String,
            enum: ["guest", "host"],
            default: "guest"
        },
        arrivalTime: Date,
        departureTime: Date
    },
    {
        timestamps: true
    });

eventParticipationSchema.index({ userId: 1, eventId: 1 }, { unique: true });


//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("EventParticipation", eventParticipationSchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.