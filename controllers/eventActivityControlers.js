
const EventParticipationModel = require("../models/eventParticipationModel");
const EventActivity = require("../models/eventActivityModel");




const createEventActivity = async (req, res) => {




    // skapa ny aktivitet baserat på body 


    // annars . har inte behörighet 

    try {
        // Hämta användar-ID från auth (förutsätter att auth-middleware har lagt in denna metod)
        const { userId } = req.auth();
        console.log("--- autentificerad användarid:", userId)
        const { eventId, title, description, startTime, endTime } = req.body;

        console.log("--- detta kom i bodyn:", req.body)

        // kolla så att användaren är host i eventet
        // om de finns en partisipation med denna avnvändaren kopplad till eventet och rollen host, så är den host
        const isHost = await EventParticipationModel.findOne({ userId: userId, eventId: eventId, role: "host" })

        if (isHost) {
            console.log("--- Användaren är host")
            const createdActivity = await EventActivity.create(req.body);
            console.log("--- Skapad aktivitet:", createdActivity)


            // success :) 
            res.status(201).json(createdActivity);

        } else {
            console.log("--- Användaren är inte host för eventet")
            return res.status(403).json({ error: "Du är inte host och är därför inte behörighet att göra detta." });
        }




    } catch (err) {
        // Skicka felmeddelande till klient
        res.status(400).json({ error: err.message });
    }
};


// Uppdatera event-aktivitet (endast host kan uppdatera)
const updateEventActivity = async (req, res) => {
    console.log("✅ vi är här")
    try {
        const { userId } = req.auth();
        const { id } = req.params;
        const updateData = req.body;
        console.log("✅ vi är här")

        // Hitta eventId för aktiviteten för att kolla host-rollen
        const existingActivity = await EventActivity.findById(id);
        console.log("existingActivity", existingActivity)
        if (!existingActivity) {
            return res.status(404).json({ error: "Event-aktivitet hittades inte." });
        }

        const isHost = await EventParticipationModel.findOne({ userId, eventId: existingActivity.eventId, role: "host" });
        if (!isHost) {
            return res.status(403).json({ error: "Du är inte host och har därför inte behörighet att göra detta." });
        }

        const updatedActivity = await EventActivity.findByIdAndUpdate(id, updateData, { new: true });
        console.log("updatedActivity", updatedActivity)

        res.json(updatedActivity);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Ta bort event-aktivitet (endast host kan ta bort)
const deleteEventActivity = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { _id } = req.params;


        const existingActivity = await EventActivity.findById(_id);
        if (!existingActivity) {
            return res.status(404).json({ error: "Event-aktivitet hittades inte." });
        }
        console.log("vi kom hit")
        const isHost = await EventParticipationModel.findOne({ userId, eventId: existingActivity.eventId, role: "host" });
        if (!isHost) {
            return res.status(403).json({ error: "Du är inte host och har därför inte behörighet att göra detta." });
        }

        await EventActivity.findByIdAndDelete(id);
        res.json({ message: "Event-aktivitet raderad." });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


module.exports = {
    createEventActivity,
    updateEventActivity,
    deleteEventActivity
};
