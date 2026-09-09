module.exports = {
    name: "help",
    description: "Show dynamic command list with click-to-copy",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const prefix = global.botConfig.userPrefix || "/";

        let commandListText = "";
        let count = 1;

        // Automatically fetch all commands from bot.commands Map
        bot.commands.forEach((cmd, name) => {
            const description = cmd.description || "No description provided";
            // <code>...</code> ব্যবহার করার কারণে টেক্সটে ট্যাপ করলেই অটো কপি হবে
            commandListText += `<b>${count}.</b> <code>${prefix}${name}</code>\n<i>↳ ${description}</i>\n\n`;
            count++;
        });

        const helpMenu = `${global.botConfig.styleText('📜 𝐁𝐎𝐓 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 𝐌𝐄𝐍𝐔')}\n` +
            `<i>(Tap on any command to copy)</i>\n\n` +
            `${commandListText}` +
            `${global.botConfig.styleText('✨ 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒:')}\n` +
            `• Auto Video Downloader (Send link directly)\n` +
            `• AI Auto Chat Response\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, helpMenu, { parse_mode: 'HTML' });
    }
};
