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
        from: {
            userAuthId: { //avsändaren
                type: String,
                required: true
            },
            to: { //vad eller vem är förfrågan till?
                type: {// typ av mottagare
                    type: String, enum: ["event", "user"],
                    required: true
                },
                id: {// mottagarens id, eventets id eller användarens auth id. mixad typ
                    type: mongoose.Schema.Types.Mixed,
                    required: true
                }
            },
            intention: { // Vad är gäller förfrågan?
                type: String,
                enum: ["joinEvent", "inviteToEvent",],
                required: true
            },
            relatedId: { // relaterat ID beroende på intention. mixad typ
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            status: {
                type: String,
                enum: ["pending", "accepted", "rejected"],
                default: "pending"
            },
        },
    },
    {
        timestamps: true,
    });





//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("Request", requestSchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.