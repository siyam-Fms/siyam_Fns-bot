const axios = require('axios');

module.exports = {
    name: "autoDownloader",
    async handle(bot, msg) {
        const chatId = msg.chat.id;
        const text = msg.text;

        // Auto detect URL patterns (Facebook, TikTok, YouTube, Instagram)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (!urlRegex.test(text)) return;

        const url = text.match(urlRegex)[0];
        if (url.includes('facebook.com') || url.includes('instagram.com') || url.includes('tiktok.com') || url.includes('youtu')) {
            try {
                bot.sendMessage(chatId, global.botConfig.styleText(`📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠 𝐌𝐞𝐝𝐢𝐚, 𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭...`), { parse_mode: 'HTML' });
                
                // Unified Downloader API
                const apiRes = await axios.get(`https://api.cobalt.tools/api/json?url=${encodeURIComponent(url)}`, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });

                if (apiRes.data && apiRes.data.url) {
                    bot.sendChatAction(chatId, "upload_video");
                    await bot.sendVideo(chatId, apiRes.data.url, {
                        caption: `${global.botConfig.styleText('🎬 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞!')}\n\n${global.botConfig.styleText(global.botConfig.botName)}\n${global.botConfig.styleText(global.botConfig.ownerName)}`,
                        parse_mode: 'HTML'
                    });
                }
            } catch (err) {
                // Silent fail or optional error log
            }
        }
    }
};
