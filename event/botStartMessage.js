module.exports = {
    name: "botStartMessage",
    async handle(bot, msg) {
        // বট স্টার্ট মেসেজটি একবার পাঠানোর জন্য গ্লোবাল ফ্লাগ
        if (!global.isStartMessageSent) {
            global.isStartMessageSent = true;
            const chatId = msg.chat.id;

            const startMsg = `${global.botConfig.styleText('🚀 𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐒 𝐍𝐎𝐖 𝐎𝐍𝐋𝐈𝐍𝐄 & 𝐑𝐄𝐀𝐃𝐘!')}\n\n` +
                `${global.botConfig.styleText('👑 𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓')}\n` +
                `${global.botConfig.styleText('👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍')}`;

            bot.sendMessage(chatId, startMsg, { parse_mode: 'HTML' }).catch(() => {});
        }
    }
};
