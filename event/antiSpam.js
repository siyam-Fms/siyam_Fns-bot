const userCoolDown = new Map();

module.exports = {
    name: "antiSpam",
    async handle(bot, msg) {
        const userId = msg.from.id;
        const now = Date.now();
        const cooldownTime = 2000; // 2 seconds

        if (userCoolDown.has(userId)) {
            const expirationTime = userCoolDown.get(userId) + cooldownTime;
            if (now < expirationTime) {
                return; // Stop processing rapidly repeated messages
            }
        }

        userCoolDown.set(userId, now);
    }
};
