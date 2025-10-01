const express = require("express");
const router = express.Router();

const { clerkClient } = require('@clerk/express');

const EventParticipation = require("../models/eventParticipationModel")
const Event = require("../models/eventModel");

const getSimplifiedUser = require("../helpers/getSimplifiedUser");

const { getEventDetails } = require("../controllers/eventDetailsControllers");

const { getNotificationsFeed } = require("../controllers/getNotificationsFeedControler")

const { getEventByConnectionCode } = require("../controllers/getEventByConnectionCodeController")

const { createRequest, getRequest, updateRequest } = require("../controllers/requestControlers")

const { createEventActivity, updateEventActivity, deleteEventActivity } = require("../controllers/eventActivityControlers")

const { createPersonalActivity, updatePersonalActivity, deletePersonalActivity } = require("../controllers/personalActivityControlers")

const { createEventWithParticipation } = require("../controllers/createEventWithParticipationControler")

const { acceptJoinnEventRequestAndCreateParticipationControler } = require("../controllers/acceptJoinnEventRequestAndCreateParticipationControler")


const {
    eventActivityController,
    eventController,
    personalActivityController,
} = require("../controllers/crudControllers");



// * * * * * * * * * * * * * * * * * * * * * * * *
// *       ~ ~ ~ Users från clerk ~ ~ ~           * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// hämtar datat om användare.
// tar ids som query parametrar kommaseparerade
// ecempel så här:
// http://localhost:4000/api/user/list?userIds=user_123,user_456,user_789

router.get('/users/list', async (req, res) => {
    const userIdsParam = req.query.userIds;

    if (!userIdsParam) {
        return res.status(400).json({ error: 'userIds saknas' });
    }

    const userIds = userIdsParam.split(','); //skapar array av idna

    try {
        // hämtar från clerk:
        const users = await Promise.all(userIds.map(userId => getSimplifiedUser(userId))
        );
        res.json(users);

    } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
        res.status(500).json({ error: 'Något gick fel vid hämtning av användare' });
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * *
// *       ~ ~ ~ USERS ~ ~ ~                     * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// HÄMTAR ALLA EVENT SOM TILLHÖR EN VISS PERSON
router.get("/users/:userId/events", (req, res) => {
    const auth = req.auth();// clerks säkra auth objekt :) 
    const authId = auth.userId;
    const userId = req.params.userId;

    if (userId == authId) { //om användaren är personen den försöker få data om...
        req.params = { ownerUserAuthId: userId }; // skriver över parameter för att skicka vidare till controller som prata med databasen
        return eventController.getAll(req, res);
    } else {

        return res.status(403).json({ error: "Ingen behörighet" });
    }


});

// HÄMTAR ALLA EVENT SOM EN VISS PERSON DALTAR I dvs både som gäst och host 
router.get("/events/:userId/all-participating-events", async (req, res) => {
    const auth = req.auth();// clerks säkra auth objekt :) 
    const authId = auth.userId;

    const userId = req.params.userId;
    console.log("--- användaren från parameter: ", userId)
    console.log("--- autentificerad användare: ", authId)



    if (userId == authId) { //om användaren är personen den försöker få data om...

        // hämtar alla partisipations som tillhör användaren 
        const partisipations = await EventParticipation.find({ userId: authId }).lean();
        console.log("--- patisipations: ", partisipations)

        //plockar it de eventidn vi sk a hämta:
        const eventIds = partisipations.map(p => p.eventId);
        console.log("--- extraherade eventidn: ", eventIds)


        // hämtar alla event som användaren deltar i vaserat på listan med eventIDs
        //hämtar alla event där is är något av de som finns i listan $in
        const events = await Event.find({ _id: { $in: eventIds } });
        console.log("--- motsvarande events: ", events)

        // sorterar
        events.sort((a, b) => a.start - b.start);
        // skickar tillbaka dom eventen.
        return res.status(200).json(events)

    } else {
        return res.status(403).json({ error: "Ingen behörighet" });
    }


});

// HÄMTAR NotificationFeed för en person
router.get("/users/:userId/notifications", async (req, res) => {
    const auth = req.auth();// clerks säkra auth objekt :) 
    const authId = auth.userId;
    const userId = req.params.userId;

    if (userId == authId) { //om användaren är personen den försöker få data om...
        await getNotificationsFeed(req, res);
    } else {
        return res.status(403).json({ error: "Ingen behörighet" });
    }


});


// * * * * * * * * * * * * * * * * * * * * * * * *
// *           ~ ~ ~ E V E N T S ~ ~ ~           * 
// * * * * * * * * * * * * * * * * * * * * * * * *

router.get("/", (req, res) => {
    res.json({ message: "Du är påväg in i apiet" });
});


// Skapar Event
// TODO: SÄKERHET: nu skapas eventet okritiskt utan att kolla om användaren är den som denutger sig för att vara
// router.post("/events", eventController.create);
router.post("/events", createEventWithParticipation);

// Hämtar 1 eventobjekt genom dess connectionkod:
router.get("/events/bycode/:connectionCode", getEventByConnectionCode);

// Hämta sammanslagen tillhörande data om ett event
router.get("/events/:eventId/details", async (req, res) => {
    try {
        await getEventDetails(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// * * * * * * * * * * * * * * * * * * * * * * * *
// *       ~ ~ ~ Event Activitys ~ ~ ~           * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// skapar
router.post("/eventactivity/create", createEventActivity);
// ändrar
router.put("/eventactivity/:id", updateEventActivity);
//tar bort
router.delete("/eventactivity/:id", deleteEventActivity);



// * * * * * * * * * * * * * * * * * * * * * * * *
// *       ~ ~ ~ Personal Activitys ~ ~ ~        * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// skapar
router.post("/personalactivity/create", createPersonalActivity);
// uppdaterar med hel resurs:
router.put("/personalactivity/:id", updatePersonalActivity);
// tar bort
router.delete("/personalactivity/:id", deletePersonalActivity);





// * * * * * * * * * * * * * * * * * * * * * * * *
// *         ~ ~ ~ Participations ~ ~ ~           * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// Skapar eventParticipation. dvs ett närvarande-objekt :) 






// * * * * * * * * * * * * * * * * * * * * * * * *
// *         ~ ~ ~ REQUESTS ~ ~ ~                * 
// * * * * * * * * * * * * * * * * * * * * * * * *

router.post("/requests", createRequest);

router.get("/requests/:requestId", getRequest);
// ändrar en r
router.patch("/requests/:requestId", updateRequest);
// accepterar eventförfrågan och skapar deltagande:
router.patch("/requests/accept/:requestId", acceptJoinnEventRequestAndCreateParticipationControler);




router.post("/endpoint", () => {

    console.log("oj oj de försöktes såå mycke")

});




module.exports = router;
