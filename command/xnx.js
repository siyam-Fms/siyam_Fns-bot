const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const nix = "https://raw.githubusercontent.com/aryannix/stuffs/master/raw/apis.json";

async function getStream(url) {
  const res = await axios({ url, responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

module.exports = {
  config: {
    name: "xnx",
    aliases: ["xnx2"],
    version: "0.0.2",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝗔𝗡",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Search and download videos" },
    description: { en: "Search and download videos via reply (xnx with thumbnail, xnx2 without thumbnail)" },
    category: "media",
    guide: { en: "{pn} <keyword> or {p}xnx2 <keyword>" }
  },

  onStart: async function ({ bot, msg, args, prefix }) {
    if (this.config.author !== String.fromCharCode(55349, 56780, 55349, 56776, 55349, 56792, 55349, 56768, 55349, 56780, 45, 55349, 56775, 55349, 56768, 55349, 56786, 55349, 56768, 55349, 56781)) return;

    const chatId = msg.chat.id;
    const messageID = msg.message_id;
    const senderID = msg.from.id.toString();

    let base;
    const creatorName = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝗔𝗡";

    try {
      const configRes = await axios.get(nix);
      base = configRes.data?.api;
      if (!base) throw new Error();
    } catch (e) {
      return bot.sendMessage(chatId, "❌ | Error: Failed to fetch API configuration.", { reply_to_message_id: messageID });
    }

    const query = args.join(" ");
    if (!query) return bot.sendMessage(chatId, "⚠️ | Usage: xnx <keyword> or xnx2 <keyword>", { reply_to_message_id: messageID });

    const usedCommand = (msg.text || "").split(" ")[0].toLowerCase();
    const isXnx2 = usedCommand.includes("xnx2");

    try {
      const res = await axios.get(`${base}/xnx?q=${encodeURIComponent(query)}`);
      const results = res.data.result;

      if (!results || results.length === 0) {
        return bot.sendMessage(chatId, "❌ | No results found for your search.", { reply_to_message_id: messageID });
      }

      const limitedResults = results.slice(0, 6);
      let msgText = `🔎 | Results for: "${query}"\n━━━━━━━━━━━━━━━━━━\n\n`;
      const cachePath = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cachePath)) fs.ensureDirSync(cachePath);

      const createdFiles = [];
      const mediaGroup = [];

      for (let i = 0; i < limitedResults.length; i++) {
        const v = limitedResults[i];
        msgText += `${i + 1}. ${v.title}\n⏱ ${v.duration || 'N/A'} | 👀 ${v.views || 'N/A'}\n\n`;
        
        if (!isXnx2 && v.thumbnail) {
          try {
            const buf = await getStream(v.thumbnail);
            const thumbFilePath = path.join(cachePath, `xnx_thumb_${senderID}_${Date.now()}_${i}.jpg`);
            fs.writeFileSync(thumbFilePath, buf);
            createdFiles.push(thumbFilePath);
            mediaGroup.push({
              type: 'photo',
              media: thumbFilePath
            });
          } catch (e) {}
        }
      }

      const fullText = msgText + "📝 | Reply with a number (1-6) to download.\n🖌️ Created by: " + creatorName;

      let sentMsg;
      if (mediaGroup.length > 0) {
        mediaGroup[0].caption = fullText;
        const sentMedia = await bot.sendMediaGroup(chatId, mediaGroup, { reply_to_message_id: messageID });
        sentMsg = sentMedia[0];
        
        createdFiles.forEach(f => {
          try { fs.unlinkSync(f); } catch {}
        });
      } else {
        sentMsg = await bot.sendMessage(chatId, fullText, { reply_to_message_id: messageID });
      }

      if (!global.onReplySystem) global.onReplySystem = new Map();
      global.onReplySystem.set(sentMsg.message_id, {
        results: limitedResults,
        messageID: sentMsg.message_id,
        author: senderID,
        commandName: this.config.name,
        base,
        chatId: chatId
      });

    } catch (e) {
      return bot.sendMessage(chatId, "❌ | Failed to search videos. Try again later.", { reply_to_message_id: messageID });
    }
  },

  onReply: async function ({ bot, msg, Reply }) {
    if (this.config.author !== String.fromCharCode(55349, 56780, 55349, 56776, 55349, 56792, 55349, 56768, 55349, 56780, 45, 55349, 56775, 55349, 56768, 55349, 56786, 55349, 56768, 55349, 56781)) return;

    const { results, author, messageID, base, chatId } = Reply;
    const creatorName = "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝗔𝐍";
    const senderID = msg.from.id.toString();
    const currentMsgID = msg.message_id;
    
    if (senderID !== author) return;

    const choice = parseInt(msg.text);
    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return bot.sendMessage(chatId, "❌ | Invalid selection. Please choose 1 to 6.", { reply_to_message_id: currentMsgID });
    }

    const selected = results[choice - 1];

    try {
      if (messageID) await bot.deleteMessage(chatId, messageID).catch(() => {});
    } catch (e) {}

    try {
      const dlRes = await axios.get(`${base}/xnxdl?url=${encodeURIComponent(selected.link)}`);
      const data = dlRes.data.result;
      const videoUrl = data.files.high || data.files.low;

      const cachePath = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cachePath)) fs.ensureDirSync(cachePath);
      const filePath = path.join(cachePath, `vid_milon_${Date.now()}.mp4`);

      const vidData = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(vidData.data));

      const bodyText = `━━━━━━━━━━━━━━━━━━\n🎬 𝗧𝗶𝘁𝗹𝗲: ${data.title}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${data.duration || 'N/A'}\n👀 𝗜𝗻𝗳𝗼: ${data.info || 'N/A'}\n━━━━━━━━━━━━━━━━━━\n✅ | Download Success!\n🖌️ Power by: ${creatorName}`;

      await bot.sendVideo(
        chatId,
        filePath,
        {
          caption: bodyText,
          reply_to_message_id: currentMsgID
        }
      );

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (e) {
      return bot.sendMessage(chatId, "❌ | Failed to download the selected video.", { reply_to_message_id: currentMsgID });
    }
  }
};
