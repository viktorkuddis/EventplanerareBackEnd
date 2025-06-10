const Event = require("../models/eventModel");
const EventParticipation = require("../models/eventParticipationModel");
const EventActivity = require("../models/eventActivityModel");
const PersonalActivity = require("../models/personalActivityModel");
const getSimplifiedUser = require("../helpers/getSimplifiedUser");

async function getEventDetails(req, res) {
    try {
        const { eventId } = req.params;

        // Hämta eventet
        const event = await Event.findById(eventId).lean();
        if (!event) {
            return res.status(404).json({ error: "Event ej hittat" });
        }

        // Hämta deltaganden för eventet
        const participations = await EventParticipation.find({ eventId }).lean();
        console.log("hittade partisipation:", participations)

        // Lägg till användarinfo till varje deltagande
        const enrichedParticipations = await Promise.all(participations.map(async (participation) => {
            const user = await getSimplifiedUser(participation.userId);
            return {
                ...participation,
                user,
            };
        }));

        const eventActivities = await EventActivity.find({ eventId }).lean();
        const personalActivities = await PersonalActivity.find({ eventId }).lean();

        // Skicka tillbaka allt samlat med rätt nyckel
        res.status(200).json({
            event,
            eventParticipationsEnriched: enrichedParticipations,
            eventActivities,
            personalActivities
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getEventDetails,
};
