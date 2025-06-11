const Event = require("../models/eventModel");
const Request = require("../models/requestModel");
const EventParticipation = require("../models/eventParticipationModel");
const EventActivity = require("../models/eventActivityModel");
const PersonalActivity = require("../models/personalActivityModel");
const getSimplifiedUser = require("../helpers/getSimplifiedUser");

async function getNotificationsFeed(req, res) {
    try {
        const { userId } = req.params;
        console.log("- idt från användaren:", userId);

        // ** HOW TO: Hämta dokument baserat på komplexa villkor ** //
        //    Använd `$or` när du vill matcha dokument där MINST ETT av de angivna villkoren är sant.
        //    Inom dessa villkor används `$in` för att matcha ett specifikt fält mot NÅGOT VÄRDE från en lista (array).
        // -----------------------------------------------------------

        // ** VARIABLAR FÖR ATT GÖRA UPPSLAG:** //
        // - Hitta alla event där den inloggade användaren är ägare
        const ownedEvents = await Event.find({ ownerUserAuthId: userId }).lean();
        const ownedEventIds = ownedEvents.map(event => event._id.toString());

        // ** HÄMTA ALLA RELEVANTE REQUESTS ** //
        const allRelevantRequests = await Request.find({
            $or: [
                {
                    "to.type": "user",
                    "to.id": userId
                },
                {
                    "to.type": "event",
                    "to.id": { $in: ownedEventIds },
                    status: { $in: ["pending", "accepted"] }
                }
            ]
        })
            .sort({ updatedAt: -1, createdAt: -1 }) // Sortera efter senaste ändring/skapande, nyast först
            .lean();

        console.log(`✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨`);
        console.log("✨ Alla relevanta förfrågningar (från MongoDB):", allRelevantRequests);

        // ** GÖR OM REQUESTS TILL NOTIFIKATIONER ** //
        const requestsToNotificationItems = await Promise.all(allRelevantRequests.map(async (r) => {
            // om den är en förfrågan om att delta i event:
            if (r.to.type == "event" && r.intention == "joinEvent") {

                // Hämta avsändaren:
                const fromUser = await getSimplifiedUser(r.from.userAuthId);
                // hämtar eventet från tidigare variabel med events från databasen: 
                const event = ownedEvents.find(e => e._id.toString() === r.to.id.toString());
                console.log("👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️👁️")
                console.log(r)
                console.log(fromUser)
                console.log(event)

                return {
                    textAsHtml: `<strong>@${fromUser?.username}</strong> vill ansluta till ditt event <strong>${event?.title}</strong>`,
                    date: r.updatedAt,
                    url: ""
                }
            } else {
                return {
                    textAsHtml: "",
                    date: r.updatedAt,
                    url: ""
                }
            }
        }));

        res.status(200).json(requestsToNotificationItems);

    } catch (error) {
        console.error("Fel i getNotificationsFeed:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNotificationsFeed,
};
