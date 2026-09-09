const axios = require('axios');

module.exports = {
    name: "aiChat",
    async handle(bot, msg) {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Command or URL ignore
        if (text.startsWith('/') || text.includes('http://') || text.includes('https://')) return;

        try {
            bot.sendChatAction(chatId, "typing");
            const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=${encodeURIComponent(global.botConfig.ownerName)}&botname=${encodeURIComponent(global.botConfig.botName)}`);
            const reply = res.data.response;

            if (reply) {
                const formatted = `${global.botConfig.styleText(reply)}\n\n${global.botConfig.styleText(global.botConfig.botName)}`;
                bot.sendMessage(chatId, formatted, { parse_mode: 'HTML' });
            }
        } catch (err) {
            // Error handled silently
        }
    }
};
