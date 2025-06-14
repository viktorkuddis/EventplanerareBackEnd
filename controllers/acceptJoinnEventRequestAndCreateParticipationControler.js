const mongoose = require("mongoose");
const Event = require("../models/eventModel");
const EventParticipation = require("../models/eventParticipationModel");
const Request = require("../models/requestModel")

const { customAlphabet } = require("nanoid"); // importera nanoid




// Controller som skapar både ett event och lägger till skaparen som host-deltagare
const acceptJoinnEventRequestAndCreateParticipationControler = async (req, res) => {
    // Starta en MongoDB-transaktion för att säkerställa att båda operationer lyckas eller rullas tillbaka
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("--- vi är i accept och create partisipatino")


    try {
        const auth = req.auth();// clerks säkra auth objekt :) 
        const authId = auth.userId;


        //hämtar request id:
        const { requestId } = req.params
        console.log("--- requestidt det gller :", requestId)

        // hämtar requesten 
        const requestObject = await Request.findOne({ _id: requestId })
        console.log("--- Requesobjektet: ", requestObject)

        // Hittar eventet
        const event = await Event.findOne({ _id: requestObject.to.id })
        console.log("--- Eventet att gå med i: ", event)

        // kolla att den som frågar äger eventet som det gäller.
        if (authId == event.ownerUserAuthId) {
            console.log("--- 👍 Användaren äger detta eventet:) ")
        } else {
            return res.status(403).json({ error: "Du har inte behörighet att redigera detta event." });
        }

        // Kolla om deltagare redan finns
        const existingParticipation = await EventParticipation.findOne({
            userId: requestObject.from.userAuthId,
            eventId: event._id,
        }).session(session)
        if (existingParticipation) {
            return res.status(403).json({ error: "Det finns redan ett sånt här deltagande" });
        }



        // acceptera requesten by det id som kommer i parametrarna
        const updatedRequest = await Request.findByIdAndUpdate(requestId, { status: "accepted" }, { new: true, session });
        console.log("--- 🔁 requesten är uppdaterad till detta: ", updatedRequest)


        // skapa en partisipation till det eventet som de göller.
        const createdEventParticipation = await EventParticipation.create(
            [{
                userId: requestObject.from.userAuthId,
                eventId: event._id,
                role: "guest",
            }],
            { session }
        );
        console.log("--- 🆕 Skapad Partisipation: ", createdEventParticipation)



        // Allt gick bra – bekräfta transaktionen
        await session.commitTransaction();
        console.log("sessionen committades")
        session.endSession();


        res.status(201).json({
            message: "Request accepterad and participation skapad",
            updatedRequest,           // den uppdaterade requesten med status "accepted"
            createdEventParticipation // den nya deltagaren som skapades
        });

    } catch (err) {
        // Något gick fel – rulla tillbaka allt
        await session.abortTransaction();
        console.log("SESSIONEN ABORTADE")
        session.endSession();

        // Skicka felmeddelande till klient
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    acceptJoinnEventRequestAndCreateParticipationControler,
};
