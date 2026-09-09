module.exports = {
    name: "prefix",
    description: "Change User or Admin prefix",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        const target = args[0] ? args[0].toLowerCase() : null; // "user" or "admin"
        const newPrefix = args[1];

        // How to change instructions
        if (!target || !newPrefix || (target !== "user" && target !== "admin")) {
            const usageMsg = `${global.botConfig.styleText('⚙️ 𝐇𝐎𝐖 𝐓𝐎 𝐂𝐇𝐀𝐍𝐆𝐄 𝐏𝐑𝐄𝐅𝐈𝐗:')}\n\n` +
                `${global.botConfig.styleText('🔹 𝐂𝐡𝐚𝐧𝐠𝐞 𝐔𝐬𝐞𝐫 𝐏𝐫𝐞𝐟𝐢𝐱:')}\n` +
                `${global.botConfig.userPrefix}prefix user <new_symbol>\n\n` +
                `${global.botConfig.styleText('🔹 𝐂𝐡𝐚𝐧𝐠𝐞 𝐀𝐝𝐦𝐢𝐧 𝐏𝐫𝐞𝐟𝐢𝐱:')}\n` +
                `${global.botConfig.adminPrefix}prefix admin <new_symbol>\n\n` +
                `${global.botConfig.styleText(`📌 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐔𝐒𝐄𝐑 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${global.botConfig.userPrefix} ]`)}\n` +
                `${global.botConfig.styleText(`📌 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${global.botConfig.adminPrefix} ]`)}\n\n` +
                `${global.botConfig.styleText(global.botConfig.botName)}\n` +
                `${global.botConfig.styleText(global.botConfig.ownerName)}`;

            return bot.sendMessage(chatId, usageMsg, { parse_mode: 'HTML' });
        }

        // Admin Security Check for changing Admin Prefix
        if (target === "admin" && userId !== global.botConfig.adminId) {
            return bot.sendMessage(chatId, global.botConfig.styleText(`⚠️ 𝐎𝐍𝐋𝐘 𝐓𝐇𝐄 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 𝐂𝐀𝐍 𝐂𝐇𝐀𝐍𝐆𝐄 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐄𝐅𝐈𝐗!`), { parse_mode: 'HTML' });
        }

        // Apply changes
        if (target === "user") {
            global.botConfig.userPrefix = newPrefix;
        } else if (target === "admin") {
            global.botConfig.adminPrefix = newPrefix;
        }

        const successMsg = `${global.botConfig.styleText('✅ 𝐏𝐑𝐄𝐅𝐈𝐗 𝐔𝐏𝐃𝐀𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘!')}\n\n` +
            `${global.botConfig.styleText(`𝐍𝐄𝐖 ${target.toUpperCase()} 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐒 : [ ${newPrefix} ]`)}\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, successMsg, { parse_mode: 'HTML' });
    }
};
