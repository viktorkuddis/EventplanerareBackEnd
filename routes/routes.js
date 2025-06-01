const express = require("express");
const router = express.Router();

const {
    eventActivityController,
    eventController,
    eventParticipationController,
    personalActivityController,
    requestController
} = require("../controllers/crudControllers");






router.get("/", (req, res) => {
    res.json({ message: "Du är påväg in i apiet" });
});


// Skapar Event
router.post("/event", eventController.create);

// HÄMTAR ALLA EVENT SOM TILLHÖR EN VISS PERSON


router.get("/event/:userId", (req, res) => {
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
