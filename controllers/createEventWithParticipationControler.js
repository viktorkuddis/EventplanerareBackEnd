const mongoose = require("mongoose");
const EventModel = require("../models/eventModel");
const EventParticipationModel = require("../models/eventParticipationModel");

// Controller som skapar både ett event och lägger till skaparen som host-deltagare
const createEventWithParticipation = async (req, res) => {
    // Starta en MongoDB-transaktion för att säkerställa att båda operationer lyckas eller rullas tillbaka
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Hämta användar-ID från auth (förutsätter att auth-middleware har lagt in denna metod)
        const { userId: userAuthId } = req.auth();

        // Bygg event-data, inkludera ägar-ID från auth
        const eventData = {
            ...req.body,
            ownerUserAuthId: userAuthId,
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
