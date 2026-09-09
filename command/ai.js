const axios = require('axios');

module.exports = {
    name: "ai",
    description: "Ask anything to AI",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;
        const prompt = args.join(" ");

        if (!prompt) {
            return bot.sendMessage(chatId, global.botConfig.styleText(`⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐪𝐮𝐞𝐬𝐭𝐢𝐨𝐧!`), { parse_mode: 'HTML' });
        }

        try {
            bot.sendChatAction(chatId, "typing");
            const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(prompt)}&owner=${encodeURIComponent(global.botConfig.ownerName)}&botname=${encodeURIComponent(global.botConfig.botName)}`);
            const reply = res.data.response || "No response received.";
            
            const formattedMsg = `${global.botConfig.styleText('🤖 AI RESPONSE:')}\n\n${global.botConfig.styleText(reply)}\n\n${global.botConfig.styleText(global.botConfig.botName)}\n${global.botConfig.styleText(global.botConfig.ownerName)}`;
            bot.sendMessage(chatId, formattedMsg, { parse_mode: 'HTML' });
        } catch (error) {
            bot.sendMessage(chatId, global.botConfig.styleText(`❌ 𝐀𝐈 𝐒𝐞𝐫𝐯𝐞𝐫 𝐢𝐬 𝐜𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲 𝛔𝐮𝐬𝐲!`), { parse_mode: 'HTML' });
        }
    }
};
