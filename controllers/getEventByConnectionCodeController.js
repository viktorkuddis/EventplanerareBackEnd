const Event = require("../models/eventModel");

// Hämta ett event baserat på connectionCode
const getEventByConnectionCode = async (req, res) => {
    try {
        const { connectionCode } = req.params;

        if (!connectionCode) {
            return res.status(400).json({ message: "Ingen connectionCode angiven." });
        }

        // connectionCode i databasen är sparad lowercase
        const normalizedCode = connectionCode.toLowerCase();

        const event = await Event.findOne({ connectionCode: normalizedCode });

        if (!event) {
            return res.status(404).json({ message: "Event hittades inte." });
        }

        return res.status(200).json(event);
    } catch (error) {
        console.error("Fel vid hämtning av event via connectionCode:", error);
        return res.status(500).json({ message: "Serverfel." });
    }
};

module.exports = { getEventByConnectionCode };
