const Event = require("../models/eventModel");
const Request = require("../models/requestModel");
const EventParticipation = require("../models/eventParticipationModel");
const EventActivity = require("../models/eventActivityModel");
const PersonalActivity = require("../models/personalActivityModel");
const getSimplifiedUser = require("../helpers/getSimplifiedUser");

async function getNotificationsFeed(req, res) {
    try {
        const { userId } = req.params;
        // console.log("- idt från användaren:", userId);

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
                // alla förfrågningar direkt till edn aktuella användaren.
                {
                    "to.type": "user",
                    "to.id": userId
                },
                // alla obesvarade förfrågningar till event som den aktuella användaren äger
                {
                    "to.type": "event",
                    "to.id": { $in: ownedEventIds },
                    status: "pending"
                },
                // alla förfrågningar som den aktuella användaren har skickat och som är godkända. 
                {
                    "to.type": "event",
                    "from.userAuthId": userId,
                    status: "accepted"
                }
            ]
        })
            .sort({ updatedAt: -1, createdAt: -1 }) // Sortera efter senaste ändring/skapande, nyast först
            .lean();

        // console.log(`✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨`);
        // console.log("✨ Alla relevanta förfrågningar (från MongoDB):", allRelevantRequests);

        // ** GÖR OM REQUESTS TILL NOTIFIKATIONER ** //
        const requestsToNotificationItems = await Promise.all(allRelevantRequests.map(async (r) => {
            // console.log(r)
            // om den är en förfrågan om att delta i event som är pågående:
            if (r.to.type == "event" && r.intention == "joinEvent" && r.status == "pending") {

                // Hämta avsändaren:
                const fromUser = await getSimplifiedUser(r.from.userAuthId);
                // hämtar eventet från tidigare variabel med events från databasen: 
                const event = ownedEvents.find(e => e._id.toString() === r.to.id.toString());


                return {
                    textAsHtml: `<strong>@${fromUser?.username}</strong> vill ansluta till ditt event <strong>${event?.title}</strong>`,
                    date: r.updatedAt,
                    url: `/home/notifications/request/${r._id}`
                }
            }
            // om det är en accepterad förfrågan från den aktuella användaren att delta i evenemang:
            if (r.to.type == "event" && r.intention == "joinEvent" && r.from.userAuthId == userId && r.status == "accepted") {

                // Hämta avsändaren:
                // const fromUser = await getSimplifiedUser(r.from.userAuthId);

                // hämtar aktuella eventet från tidigare variabel med events från databasen: 
                const event = ownedEvents.find(e => e._id.toString() === r.to.id.toString());

                // måste hämta det eventet dom de gäller för att göra en url:
                const foundEvent = await Event.findById(r.relatedId)

                return {
                    textAsHtml: `Din förfrågan att delta i eventet <strong>${foundEvent?.title}</strong> har blivit godkänd! 🙂`,
                    date: r.updatedAt,
                    url: `/event/${foundEvent}`
                }
            }
            // returnerar null för de som inte uppfyller if. 
            return null
        }));

        // Ta bort alla null (eller undefined) innan vi skickar svaret
        const filteredRequestNotifications = requestsToNotificationItems.filter(item => item !== null);

        // todo. Om de finns andra sortes notifications kan vi filtrera dom här i en annan variabel

        // Lägg ihop alla filtrerade nitifikationer här i en gemensam lista 
        let allNotifications = [
            ...filteredRequestNotifications
        ];

        // tar bort dom som inte fyller krav på innehållet
        allNotifications = allNotifications.filter(notification =>
            // returnerar bara dom som har värde på dessa keys
            notification.textAsHtml && notification.url && notification.date
        );

        // sorterar listan efter tid
        allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(allNotifications);

    } catch (error) {
        console.error("Fel i getNotificationsFeed:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNotificationsFeed,
};
