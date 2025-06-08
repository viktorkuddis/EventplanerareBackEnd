// helperfunktion som hämtar en användare och returnerar förenklad data
async function getSimplifiedUser(userId) {
    try {
        const user = await clerkClient.users.getUser(userId);
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl || user._raw.image_url || null,
            notFound: false,
        };
    } catch {
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
