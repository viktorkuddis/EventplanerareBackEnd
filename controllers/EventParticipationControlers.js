const EventParticipation = require("../models/eventParticipationModel");
const Request = require("../models/requestModel")


const createEventParticipation = async (req, res) => {

    const auth = req.auth()// clerks säkra auth objekt :) '
    const userId = auth.userId;

    // bara om det finns en request som är accepterad så ska jag få skapa en partisipation 

    const requestIsAccepted = await Request.findOne({
        "from.userAuthId": userId,
        "to.type": "event",
        "to.id": req.body.eventId,
        "intention": "joinEvent",
        "status": "accepted"
    });


    if (requestIsAccepted) {
        try {
            const savedParticipation = await EventParticipation.create({
                userId: userId, // från auth,
                eventId: req.body.eventId,
                role: req.body.role,
                arrivalTime: req.body.arrivalTime,
                departureTime: req.body.departureTime
            });
            console.log("skapad Participation", savedParticipation)
            res.status(201).json(savedParticipation);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    if (!requestIsAccepted) {
        return res.status(403).json({ error: "Det finns ingen godkänd förfrågan att gå med i detta event" });
    }

};

module.exports = {
    createEventParticipation,
};
