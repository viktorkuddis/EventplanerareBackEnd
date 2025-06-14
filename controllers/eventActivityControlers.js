const mongoose = require("mongoose");
const EventModel = require("../models/eventModel");
const EventParticipationModel = require("../models/eventParticipationModel");
const EventActivity = require("../models/eventActivityModel");



const getActivitiesByEventId = async (req, res) => {
    try {
        const { userId } = req.auth(); // Auth-metod som hämtar användaren

        const { eventId } = req.params;
        console.log("--- event id", eventId)

        // Kolla att användaren är med i eventet
        const isParticipant = await EventParticipationModel.findOne({
            userId: userId,
            eventId: eventId,
        });

        if (!isParticipant) {
            return res.status(403).json({ error: "Du är inte deltagare i detta event." });
        }

        console.log("Användaren är deltagade:", isParticipant)

        // Hämta aktiviteter
        const activities = await EventActivity.find({ eventId });

        res.status(200).json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createEventActivity = async (req, res) => {




    // skapa ny aktivitet baserat på body 


    // annars . har inte behörighet 

    try {
        // Hämta användar-ID från auth (förutsätter att auth-middleware har lagt in denna metod)
        const { userId } = req.auth();
        console.log("--- autentificerad användarid:", userId)
        const { eventId, title, description, startTime, endTime } = req.body;

        console.log("--- detta kom i bodyn:", req.body)

        // kolla så att användaren är host i eventet
        // om de finns en partisipation med denna avnvändaren kopplad till eventet och rollen host, så är den host
        const isHost = await EventParticipationModel.findOne({ userId: userId, eventId: eventId, role: "host" })

        if (isHost) {
            console.log("--- Användaren är host")
            const createdActivity = await EventActivity.create(req.body);
            console.log("--- Skapad aktivitet:", createdActivity)


            // success :) 
            res.status(201).json(createdActivity);

        } else {
            console.log("--- Användaren är inte host för eventet")
            return res.status(403).json({ error: "Du är inte host och är därför inte behörighet att göra detta." });
        }




    } catch (err) {
        // Skicka felmeddelande till klient
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    createEventActivity,
    getActivitiesByEventId
};
