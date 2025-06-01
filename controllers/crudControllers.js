// ========================================================
// Controllers är funktioner som skötes själva databaslogiken
// När en endpoint anropas så kallar vi på en controller som utför saker och ting istället för att hårdkoda all logik i varje rutt.
// ========================================================


//hämtar mongoose funktionalitet
const mongoose = require("mongoose");

const createCrudController = (Model) => {
    return {


        // ===============================================================
        // READ ALL – Hämtar alla dokument, med möjlighet till query-filter
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        async getAll(req, res) {
            try {
                const filter = req.params; //tar in parametrarena for att använda som filer.
                console.log("Filter i getAll (params):", filter);

                const docs = await Model.find(filter);
                res.status(200).json(docs);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },

        // ===============================================================
        // READ ONE – Hämtar ett dokument baserat på ID
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        async getOne(req, res) {
            const { id } = req.params;
            //kollar så idt är en Valid Mongo-id.
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Felaktigt id-format" });
            }
            try {
                const doc = await Model.findById(id); // Hämtar dokument med angivet id
                if (!doc) return res.status(404).json({ error: "Dokumentet hittades inte" });
                res.status(200).json(doc); // Skicka tillbaka dokumentet
            } catch (err) {
                res.status(500).json({ error: err.message }); // Felhantering
            }
        },

        // ===============================================================
        // CREATE – Skapar ett nytt dokument i databasen
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        async create(req, res) {
            try {
                // id hämtas från auth i requesten och döper om den.
                const { userId: userAuthId } = req.auth();
                console.log(userAuthId)

                const doc = await Model.create(req.body); // Skapa nytt dokument med data från body
                res.status(201).json(doc); // Skicka tillbaka det skapade dokumentet
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        },

        // ===============================================================
        // UPDATE – Uppdaterar ett dokument baserat på ID
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        async update(req, res) {
            const { id } = req.params;

            //kollar så idt är en Valid Mongo-id.
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "Felaktigt id-format" });
            }

            try {

                // Hitta dokumentet via id och uppdatera med utsprid body Data som inte finns i bodyn kommer att förbli oförändrat. 
                const doc = await Model.findByIdAndUpdate(
                    id,
                    { ...req.body },
                    { new: true, runValidators: true }// new: true returnera uppdaterad verion.och runValidators: true kör valideringar enligt modellen.
                );
                if (!doc) {
                    return res.status(404).json({ error: "Dokumentet hittades inte" });
                }

                res.status(200).json(doc);
            } catch (error) {

                res.status(400).json({ error: error.message });
            }
        },

        // ===============================================================
        // DELETE – Tar bort ett dokument baserat på ID
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        async delete(req, res) {
            const { id } = req.params;

            //kollar så idt är en Valid Mongo-id.
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Felaktigt id-format" });
            }
            try {
                const doc = await Model.findByIdAndDelete(id); // Tar bort dokumentet
                if (!doc) return res.status(404).json({ error: "Dokumentet hittades inte" });
                res.status(200).json({ message: "Dokumentet togs bort", id: doc._id });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        },


    }

};

//==============================================================
// hämtar modeller
const EventActivity = require("../models/eventActivityModel");
const Event = require("../models/eventModel");
const EventParticipation = require("../models/eventParticipationModel")
const PersonalActivity = require("../models/personalActivityModel")
const Request = require("../models/requestModel")

//==============================================================

// Skapa controllers baserat på modellerna
const eventActivityController = createCrudController(EventActivity);
const eventController = createCrudController(Event);
const eventParticipationController = createCrudController(EventParticipation);
const personalActivityController = createCrudController(PersonalActivity);
const requestController = createCrudController(Request);

// med dehär kontrolerna når jag nu de definerade funktoinerna från createCrudController - som ju talar med databasen- baserat på den aktuella modellen (så den vet vilken kollektion i databasen det är vi pratar med).

//eventController.getAll() (där getAll är enfunktoin i createcrudkontroller) skulle alltså svara med allt från event-kollektionen.
//==============================================================


module.exports = {
    eventActivityController,
    eventController,
    eventParticipationController,
    personalActivityController,
    requestController
};