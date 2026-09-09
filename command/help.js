module.exports = {
    name: "help",
    description: "Show command list",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        
        const helpMenu = `${global.botConfig.styleText('📜 BOT COMMANDS MENU')}\n\n` +
            `${global.botConfig.styleText('🔹 /ai <question>')} - Ask AI anything\n` +
            `${global.botConfig.styleText('🔹 /draw <prompt>')} - Generate AI Image\n` +
            `${global.botConfig.styleText('🔹 /help')} - View help menu\n\n` +
            `${global.botConfig.styleText('✨ FEATURES:')}\n` +
            `• Auto Video Downloader (Send any video link)\n` +
            `• Smart AI Auto Chat\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, helpMenu, { parse_mode: 'HTML' });
    }
};
