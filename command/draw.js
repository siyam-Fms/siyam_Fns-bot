module.exports = {
    name: "draw",
    description: "Generate AI Image",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const prompt = args.join(" ");

        if (!prompt) {
            return bot.sendMessage(chatId, global.botConfig.styleText(`⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐩𝐫𝐨𝐦𝐩𝐭 𝐭𝐨 𝐝𝐫𝐚𝐰!`), { parse_mode: 'HTML' });
        }

        try {
            bot.sendChatAction(chatId, "upload_photo");
            const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;
            
            const caption = `${global.botConfig.styleText('🎨 𝐈𝐦𝐚𝐠𝐞 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!')}\n\n${global.botConfig.styleText(global.botConfig.botName)}\n${global.botConfig.styleText(global.botConfig.ownerName)}`;
            await bot.sendPhoto(chatId, imageUrl, { caption: caption, parse_mode: 'HTML' });
        } catch (error) {
            bot.sendMessage(chatId, global.botConfig.styleText(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐢𝐦𝐚𝐠𝐞!`), { parse_mode: 'HTML' });
        }
    }
};
