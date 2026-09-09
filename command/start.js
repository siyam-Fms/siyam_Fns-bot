module.exports = {
    name: "start",
    description: "Start the bot",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name || "User";

        const welcomeText = `${global.botConfig.styleText(`👋 HELLO ${userName.toUpperCase()}!`)}\n\n` +
            `${global.botConfig.styleText(`WELCOME TO ${global.botConfig.botName}`)}\n` +
            `I am your advanced multi-functional assistant.\n\n` +
            `Type /help to see all available commands!\n\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, welcomeText, { parse_mode: 'HTML' });
    }
};
