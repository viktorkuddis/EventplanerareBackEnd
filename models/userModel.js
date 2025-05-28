// ========================================================
//här skapar vi mallar för hur data får se ut.
//Schemas skapas med mongoose.
//Mongo db - alone är schemaless.

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.
// ========================================================


const mongoose = require("mongoose");


//skapar en ny schema och skickar in ett objekt som beskriver hur datamodellen bör se ut.
const userSchema = new mongoose.Schema(
    {
        authId: { // ID från auth ska vara unik
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    });





//exporterar en modell med givet namn i singular baserat på Schmat.
module.exports = mongoose.model("User", userSchema);

// SCHEMA definerar strukturen på ett dokument i en databas
// MODELL är en byggd version av schemat och används för att interagera med databasen.