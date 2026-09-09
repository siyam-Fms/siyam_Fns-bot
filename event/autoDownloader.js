const axios = require('axios');

module.exports = {
    name: "autoDownloader",
    async handle(bot, msg) {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!text) return;

        // URL Matching Regex
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (!urlRegex.test(text)) return;

        const url = text.match(urlRegex)[0];
        const isSupportedPlatform = /(facebook|fb\.watch|instagram|tiktok|youtu)/i.test(url);

        if (!isSupportedPlatform) return;

        let statusMsg;
        try {
            statusMsg = await bot.sendMessage(chatId, global.botConfig.styleText(`📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆 𝐌𝐄𝐃𝐈𝐀, 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓...`), { parse_mode: 'HTML' });
            bot.sendChatAction(chatId, "upload_video");

            // Multi-source Downloader API
            const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
            const res = await axios.get(apiUrl, { timeout: 15000 });

            let videoUrl = null;

            if (res.data && res.data.result) {
                videoUrl = res.data.result.video || res.data.result.hdvideo || res.data.result.url;
            }

            // Fallback for Direct Cobalt Stream
            if (!videoUrl) {
                const altApi = await axios.post(`https://co.wuk.sh/api/json`, {
                    url: url
                }, {
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                });
                if (altApi.data && altApi.data.url) videoUrl = altApi.data.url;
            }

            if (videoUrl) {
                const caption = `${global.botConfig.styleText('🎬 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄!')}\n\n` +
                    `${global.botConfig.styleText(global.botConfig.botName)}\n` +
                    `${global.botConfig.styleText(global.botConfig.ownerName)}`;

                await bot.sendVideo(chatId, videoUrl, { caption: caption, parse_mode: 'HTML' });
                if (statusMsg) bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
            } else {
                throw new Error("Unable to extract video URL");
            }
        } catch (err) {
            console.error("[DOWNLOAD ERROR]:", err.message);
            if (statusMsg) bot.deleteMessage(chatId, statusMsg.message_id).catch(() => {});
            
            bot.sendMessage(chatId, global.botConfig.styleText(`❌ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐕𝐈𝐃𝐄𝐎! 𝐏𝐋𝐄𝐀𝐒𝐄 𝐓𝐑𝐘 𝐀𝐍𝐎𝐓𝐇𝐄𝐑 𝐋𝐈𝐍𝐊.`), { parse_mode: 'HTML' });
        }
    }
};
