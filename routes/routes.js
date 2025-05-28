const express = require("express");
const router = express.Router();

const createCrudController = require("../controllers/crudControllers");



// hämtar modeller
const EventActivity = require("../models/eventActivityModel");
const Event = require("../models/eventModel");
const EventParticipation = require("../models/eventParticipation")
const PersonalActivity = require("../models/personalActivityModel")
const Request = require("../models/requestModel")
const User = require("../models/userModel")



// Skapa controllers baserat på modellerna
const eventActivityController = createCrudController(EventActivity);
const eventController = createCrudController(Event);
const eventParticipationController = createCrudController(EventParticipation);
const personalActivityController = createCrudController(PersonalActivity);
const requestController = createCrudController(Request);
const userController = createCrudController(User)


router.get("/", (req, res) => {
    res.json({ message: "Du är påväg in i apiet" });
});


// EventActivity-routes
router.get("/eventActivity", eventActivityController.getAll);
router.get("/eventActivity/:id", eventActivityController.getOne);
router.post("/eventActivity", eventActivityController.create);
router.patch("/eventActivity/:id", eventActivityController.update);
router.delete("/eventActivity/:id", eventActivityController.delete);

// Event-routes
router.get("/event", eventController.getAll);
router.get("/event/:id", eventController.getOne);
router.post("/event", eventController.create);
router.patch("/event/:id", eventController.update);
router.delete("/event/:id", eventController.delete);

// EventParticipation-routes
router.get("/eventParticipation", eventParticipationController.getAll);
router.get("/eventParticipation/:id", eventParticipationController.getOne);
router.post("/eventParticipation", eventParticipationController.create);
router.patch("/eventParticipation/:id", eventParticipationController.update);
router.delete("/eventParticipation/:id", eventParticipationController.delete);

// PersonalActivity-routes
router.get("/personalActivity", personalActivityController.getAll);
router.get("/personalActivity/:id", personalActivityController.getOne);
router.post("/personalActivity", personalActivityController.create);
router.patch("/personalActivity/:id", personalActivityController.update);
router.delete("/personalActivity/:id", personalActivityController.delete);

// Request-routes
router.get("/request", requestController.getAll);
router.get("/request/:id", requestController.getOne);
router.post("/request", requestController.create);
router.patch("/request/:id", requestController.update);
router.delete("/request/:id", requestController.delete);

// User-routes
router.get("/user", userController.getAll);
router.get("/user/:id", userController.getOne);
router.post("/user", userController.create);
router.patch("/user/:id", userController.update);
router.delete("/user/:id", userController.delete);

















module.exports = router;
