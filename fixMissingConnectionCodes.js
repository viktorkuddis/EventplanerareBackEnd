require('dotenv').config();

const mongoose = require("mongoose");
const EventModel = require("./models/eventModel");
const { customAlphabet } = require("nanoid");

const alphaNumNanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

async function generateUniqueConnectionCode() {
    let code;
    let exists = true;

    while (exists) {
        code = alphaNumNanoid();
        exists = await EventModel.findOne({ connectionCode: code });
        console.log(`Testar kod: ${code} — ${exists ? 'finns redan, försöker igen...' : 'unik och godkänd!'}`);
    }

    return code;
}

async function fixMissingConnectionCodes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Ansluten till MongoDB");

        const eventsWithoutCode = await EventModel.find({ connectionCode: { $exists: false } });

        console.log(`Hittade ${eventsWithoutCode.length} event utan connectionCode`);

        for (const event of eventsWithoutCode) {
            const newCode = await generateUniqueConnectionCode();

            // Uppdatera direkt utan validering
            await EventModel.updateOne(
                { _id: event._id },
                { $set: { connectionCode: newCode } }
            );

            console.log(`Uppdaterade event ${event._id} med code ${newCode} utan validering.`);
        }

        console.log("Klar med uppdatering!");
        process.exit(0);

    } catch (error) {
        console.error("Fel:", error);
        process.exit(1);
    }
}

fixMissingConnectionCodes();
