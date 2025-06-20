const mongoose = require("mongoose");
const EventModel = require("../models/eventModel");
const EventParticipationModel = require("../models/eventParticipationModel");

const { customAlphabet } = require("nanoid"); // importera nanoid


// Skapa en generator för 6-siffrig kod och SMÅÅÅÅÅÅÅÅ småååååååå bokstäver OOOOOBS
const alphaNumNanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

// Funktion för att generera unik connectionCode
async function generateUniqueConnectionCode() {
    let code;
    let exists = true;

    while (exists) {
        code = alphaNumNanoid();  // använd nya generatorn
        exists = await EventModel.findOne({ connectionCode: code });

        console.log(`Genererad kod: ${code} — ${exists ? 'finns redan, försöker igen...' : 'unik och godkänd!'}`);
    }

    return code;
}

// Controller som skapar både ett event och lägger till skaparen som host-deltagare
const createEventWithParticipation = async (req, res) => {
    // Starta en MongoDB-transaktion för att säkerställa att båda operationer lyckas eller rullas tillbaka
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Hämta användar-ID från auth (förutsätter att auth-middleware har lagt in denna metod)
        const { userId: userAuthId } = req.auth();

        // Generera unik connectionCode innan event-data skapas
        const code = await generateUniqueConnectionCode();


        // Bygg event-data, inkludera ägar-ID från auth och connection code
        const eventData = {
            ...req.body,
            ownerUserAuthId: userAuthId,
            connectionCode: code,
        };

        // Skapa eventet (wrap i array eftersom .create() kräver det för sessioner)
        const [event] = await EventModel.create([eventData], { session });

        // Skapa deltagande där användaren blir "host" för det nya eventet
        const participationData = {
            userId: userAuthId,
            eventId: event._id,
            role: "host",
        };

        const [participation] = await EventParticipationModel.create([participationData], { session });

        // Allt gick bra – bekräfta transaktionen
        await session.commitTransaction();
        session.endSession();

        // Skicka tillbaka både det skapade eventet och deltagandet i svaret
        res.status(201).json({ event, participation });

    } catch (err) {
        // Något gick fel – rulla tillbaka allt
        await session.abortTransaction();
        session.endSession();

        // Skicka felmeddelande till klient
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    createEventWithParticipation,
};
