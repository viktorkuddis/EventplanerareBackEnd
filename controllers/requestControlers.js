const Request = require('../models/requestModel');
const Event = require('../models/eventModel');


const createRequest = async (req, res) => {
    try {
        const { userId: userAuthId } = req.auth();

        // KOLLA OM SAMMA FINNS: Letar efter en förfrågan med samma avsändare, mottagare och avsikt.
        // Denna förfrågan räknas som befintlig om dess status är 'pending' ELLER 'accepted'.
        const existingRequest = await Request.findOne({
            'from.userAuthId': userAuthId,
            'to.type': req.body.to.type,
            'to.id': req.body.to.id,
            'intention': req.body.intention,
            'status': { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            // OM DEN FINNS (och är pending/accepted): Säg ifrån.
            return res.status(409).json({ message: 'Förfrågan finns redan och är under behandling eller har blivit godkänd.' });
        }

        // OM DEN INTE FINNS (eller om den fanns men var rejected): Skapa den nya förfrågan.
        const newRequest = await Request.create({
            from: { userAuthId: userAuthId },
            to: req.body.to,
            intention: req.body.intention,
            relatedId: req.body.relatedId,
            status: req.body.status || 'pending'
        });
        res.status(201).json(newRequest);

    } catch (err) {
        console.error("Fel vid förfrågan:", err);
        res.status(500).json({ error: 'Serverfel vid skapande av förfrågan.' });
    }
}


const getRequest = async (req, res) => {

    const { requestId } = req.params;

    const { userId } = req.auth();
    console.log("--- Användarid:", userId)

    try {

        // Hämta requestet
        const request = await Request.findById(requestId).lean();
        if (!request) {
            return res.status(404).json({ error: "Requesten hittades ej hittat" });
        }

        // om de är en request om att gå med i event får bara ägaren av eventet se requesten.
        if (request.to.type == "event" && request.intention == "joinEvent") {
            const event = await Event.findById(request.to.id).lean()
            console.log(`--- REQUEST OM ATT JOINA FÖLJANDE EVENT ---- `, event)

            if (event.ownerUserAuthId == userId) {
                res.status(200).json(request);
            } else {
                // Använd 403 Forbidden. användaren saknar behörighet
                res.status(403).json({ error: "Du har inte behörighet att se denna förfrågan." });
                console.log(" FÖRBJUDEN! :) Användaren saknar behörighet att de denna request ")
            }

        }






    } catch (err) {
        console.error("error: Npgot fel vid hämtning av reduestobjektet i dattabasen ", err.message)
        res.status(500).json({ error: err.message });
    }
}

module.exports = { createRequest, getRequest };