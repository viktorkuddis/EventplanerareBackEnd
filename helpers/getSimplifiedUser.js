const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});
// helperfunktion som hämtar en användare och returnerar förenklad data
async function getSimplifiedUser(userId) {

    console.log("mottaget user id att skicka till clerk:", userId)
    try {
        const user = await clerkClient.users.getUser(userId);
        // console.log("clerk gav detta:", user)


        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.imageUrl || null,
            notFound: false,
        };
    } catch (err) {
        console.log("Fel från Clerk:", err);

        return {
            id: userId,
            username: "okänd",
            firstName: "Okänd",
            lastName: "Användare",
            profileImageUrl: null,
            notFound: true,
        };
    }
}

module.exports = getSimplifiedUser;
