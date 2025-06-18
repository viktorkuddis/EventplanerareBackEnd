const mongoose = require("mongoose");
const EventParticipationModel = require("../models/eventParticipationModel");
const PersonalActivity = require("../models/personalActivityModel");



// Controller för att skapa en ny personal activity
const createPersonalActivity = async (req, res) => {
    try {
        // Hämta användar-ID från auth (förutsätter att auth-middleware har lagt in denna metod)
        const { userId } = req.auth();
        console.log("--- autentificerad användarid:", userId);

        console.log("--- detta kom i bodyn:", req.body);

        const { eventId } = req.body; // tar ut evenId så vi kan använda det 

        // Kolla så att användaren är med ieventet
        // om det finns en participation med denna användaren kopplad till eventet så är den med :)
        const isInEvent = await EventParticipationModel.findOne({ userId: userId, eventId: eventId });

        if (isInEvent) {
            console.log("--- Användaren är med i eventet");

            // Lägg till ownerUserAuthId (ägare av personal activity) baserat på userId från auth
            const newPersonalActivityData = { ...req.body, ownerUserAuthId: userId };

            const createdPersonalActivity = await PersonalActivity.create(newPersonalActivityData);
            console.log("--- Skapad personal activity:", createdPersonalActivity);

            // success :)
            res.status(201).json(createdPersonalActivity);

        } else {
            console.log("--- Användaren är inte med i eventet");
            return res.status(403).json({ error: "Användaren är inte med i eventet och har därför inte behörighet att göra detta." });
        }

    } catch (err) {
        // Skicka felmeddelande till klient
        res.status(400).json({ error: err.message });
    }
};


const updatePersonalActivity = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;
        const updateData = req.body;

        // Hitta och uppdatera personal activity OM den ägs av rätt userId
        const updatedPersonalActivity = await PersonalActivity.findOneAndUpdate(
            { _id: id, ownerUserAuthId: userId },  // filter
            updateData,                            // vad som ska uppdateras
            { new: true }                         // returnera den uppdaterade dokumentet
        );

        if (!updatedPersonalActivity) {
            return res.status(404).json({ error: "Personal activity hittades inte eller du har inte behörighet." });
        }

        res.json(updatedPersonalActivity);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const deletePersonalActivity = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.params;

        // Ta bort personal activity om den finns och ägs av rätt användare
        const deleted = await PersonalActivity.findOneAndDelete({ _id: id, ownerUserAuthId: userId });

        if (!deleted) {
            return res.status(404).json({ error: "Personal activity hittades inte eller du har inte behörighet." });
        }

        res.json({ message: "Personal activity raderad." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


module.exports = {
    createPersonalActivity,
    updatePersonalActivity,
    deletePersonalActivity

};
