const Request = require('../models/requestModel');


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


module.exports = { createRequest };