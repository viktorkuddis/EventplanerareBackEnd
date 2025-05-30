// ========================================================
// Controllers är funktioner som skötes själva databaslogiken
// När en endpoint anropas så kallar vi på en controller som utför saker och ting istället för att hårdkoda all logik i varje rutt.
// ========================================================


//hämtar mongoose funktionalitet
const mongoose = require("mongoose");


const createCrudController = (Model, populateOptions = []) => {


    return {




        // ===============================
        // READ ALL – Hämtar alla dokument, med möjlighet till query-filter
        // ===============================
        async getAll(req, res) {
            console.log("hej")
            try {
                const filter = req.query || {}; // Ex: ?eventId=abc123
                const docs = await Model.find(filter); // Hämtar alla dokument som matchar filter
                res.status(200).json(docs); // Skicka tillbaka resultaten
            } catch (err) {
                res.status(500).json({ error: err.message }); // Felhantering
            }
        },

        // ===============================
        // READ ONE – Hämtar ett dokument baserat på ID
        // ===============================
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

        // ===============================
        // CREATE – Skapar ett nytt dokument i databasen
        // ===============================
        async create(req, res) {
            try {
                // id hämtas från auth i requesten.
                const userAuthId = req.auth.userId;

                // Kolla om modellen har fältet userAuthId . Om den inte har de så går vi vidare och skiter i de :) 
                if (Model.schema.path('userAuthId')) {
                    // Om userAuthId finns i body, kolla att den stämmer med auth
                    if ('userAuthId' in req.body) {
                        if (req.body.userAuthId !== userAuthId) {
                            return res.status(403).json({ error: "Skickat userAuthId matchar inte med ID från auth" });
                        }
                    } else {
                        // Om userAuthId inte skickades med i body - sätt den automatiskt från auth
                        req.body.userAuthId = userAuthId;
                    }
                }

                const doc = await Model.create(req.body); // Skapa nytt dokument med data från body
                res.status(201).json(doc); // Skicka tillbaka det skapade dokumentet
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        },

        // ===============================
        // UPDATE – Uppdaterar ett dokument baserat på ID
        // ===============================
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

        // ===============================
        // DELETE – Tar bort ett dokument baserat på ID
        // ===============================
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

module.exports = createCrudController
