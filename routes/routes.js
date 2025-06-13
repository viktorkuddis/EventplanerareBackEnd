const express = require("express");
const router = express.Router();

const { clerkClient } = require('@clerk/express');


const getSimplifiedUser = require("../helpers/getSimplifiedUser");

const { getEventDetails } = require("../controllers/eventDetailsControllers");

const { getNotificationsFeed } = require("../controllers/getNotificationsFeedControler")

const { getEventByConnectionCode } = require("../controllers/getEventByConnectionCodeController")

const { createRequest, getRequest, updateRequest } = require("../controllers/requestControlers")


const { createEventWithParticipation } = require("../controllers/createEventWithParticipationControler")


const {
    eventActivityController,
    eventController,
    eventParticipationController,
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
// *         ~ ~ ~ Participations ~ ~ ~           * 
// * * * * * * * * * * * * * * * * * * * * * * * *

// Skapar eventParticipation. dvs ett närvarande-objekt :) 
// TODO: SÄKERHET: nu skapas eventet okritiskt utan att kolla om användaren är den som denutger sig för att vara
// TODO: SÄKERHET: gör en koll om man finns i request-slita som en person som fått inbjudan OM man själv joinar.
// TODO: SÄKERHET: alternativ kör en koll om man själv är den de gäller om man ska redigera.
// TODO: SÖKERHET: alternativ. Kolla om man äger eventt som man försöker skapa eller redigera objektet.
router.post("/eventParticipations", eventParticipationController.create);




// * * * * * * * * * * * * * * * * * * * * * * * *
// *         ~ ~ ~ REQUESTS ~ ~ ~                * 
// * * * * * * * * * * * * * * * * * * * * * * * *

router.post("/requests", createRequest);

router.get("/requests/:requestId", getRequest);
router.patch("/requests/:requestId", updateRequest);





router.post("/endpoint", () => {

    console.log("oj oj de försöktes såå mycke")

});


/* generiska EventActivity-routes */
// router.get("/eventActivity", eventActivityController.getAll);
// router.get("/eventActivity/:id", eventActivityController.getOne);
// router.post("/eventActivity", eventActivityController.create);
// router.patch("/eventActivity/:id", eventActivityController.update);
// router.delete("/eventActivity/:id", eventActivityController.delete);

/* generiska Event-routes*/
// router.get("/event", eventController.getAll);
// router.get("/event/:id", eventController.getOne);
// router.post("/event", eventController.create);
// router.patch("/event/:id", eventController.update);
// router.delete("/event/:id", eventController.delete);

/* generiska EventParticipation-routes*/
// router.get("/eventParticipation", eventParticipationController.getAll);
// router.get("/eventParticipation/:id", eventParticipationController.getOne);
// router.post("/eventParticipation", eventParticipationController.create);
// router.patch("/eventParticipation/:id", eventParticipationController.update);
// router.delete("/eventParticipation/:id", eventParticipationController.delete);

/* generiska  PersonalActivity-routes*/
// router.get("/personalActivity", personalActivityController.getAll);
// router.get("/personalActivity/:id", personalActivityController.getOne);
// router.post("/personalActivity", personalActivityController.create);
// router.patch("/personalActivity/:id", personalActivityController.update);
// router.delete("/personalActivity/:id", personalActivityController.delete);

/* generiska Request-routes*/
// router.get("/request", requestController.getAll);
// router.get("/request/:id", requestController.getOne);
// router.post("/request", requestController.create);
// router.patch("/request/:id", requestController.update);
// router.delete("/request/:id", requestController.delete);

module.exports = router;
