// ========================================================
//här skapar vi mallar för hur data får se ut.
//Schemas skapas med mongoose.
//Mongo db - alone är schemaless.

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.
// ========================================================


const mongoose = require("mongoose");


//skapar en ny schema och skickar in ett objekt som beskriver hur datamodellen bör se ut.
const requestSchema = new mongoose.Schema(
    {
        fromUserId: { //Vem skickar?
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        to: { //vad eller vem är förfrågan till?
            type: {// typ av mottagare
                type: String, enum: ["Event", "User"],
                required: true
            },
            id: {// mottagarens id
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "target.type"
            }
        },
        intention: { // Vad är gäller förfrågan?
            type: String,
            enum: ["joinEvent", "inviteToEvent",],
            required: true
        },
        relatedId: { // relaterat ID beroende på intention.
            type: [mongoose.Schema.Types.ObjectId, null],
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        },
    },
    {
        timestamps: true,
    });





//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("Request", requestSchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.