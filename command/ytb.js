const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  try {
    const res = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
    );
    return res.data.mahmud;
  } catch (e) {
    return "https://default-api.example.com";
  }
};

const apiList = async () => {
  const base = await baseApiUrl();
  return [
    base,
    "https://mahmudx7-api.vercel.app",
    "https://backup-api.example.com"
  ];
};

async function fetchWithFallback(urlBuilder) {
  const apis = await apiList();

  for (let base of apis) {
    try {
      const url = urlBuilder(base);
      const res = await axios.get(url, { timeout: 15000 });
      if (res?.data) return res.data;
    } catch (e) {}
  }

  throw new Error("All APIs failed");
}

module.exports = {
  config: {
    name: "ytb",
    aliases: ["youtube", "yt", "ytb2"],
    version: "2.3",
    author: "Siyam Hasan",
    countDown: 6,
    role: 0,
    description: {
      bn: "YouTube ভিডিও সার্চ ও ডাউনলোড (ytb থাম্বনেইল সহ, ytb2 থাম্বনেইল ছাড়া)",
      en: "YouTube search & download system (ytb with thumbnail, ytb2 without thumbnail)"
    },
    category: "media"
  },

  langs: {
    bn: {
      error: "❌ সমস্যা: %1",
      noResult: "⭕ কিছু পাওয়া যায়নি: %1",
      choose: "📌 নাম্বার দিয়ে রিপ্লাই করো:\n\n%1",
      downloading: "⬇️ ডাউনলোড হচ্ছে: %1 - %2"
    }
  },

  onStart: async function ({ bot, msg, args, prefix }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const senderID = msg.from.id.toString();
    const input = args.join(" ").trim();

    if (!input) {
      return bot.sendMessage(chatId, "👉 ব্যবহার: ytb song name অথবা ytb2 song name", { reply_to_message_id: messageId });
    }

    const usedCommand = (msg.text || "").split(" ")[0].toLowerCase();
    const isYtb2 = usedCommand.includes("ytb2");

    try {
      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/search?q=${encodeURIComponent(input)}`
      );

      const results = data?.results?.slice(0, 6);

      if (!results?.length) {
        return bot.sendMessage(chatId, `⭕ কিছু পাওয়া যায়নি: ${input}`, { reply_to_message_id: messageId });
      }

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);

      let msgText = "";
      let mediaGroup = [];
      let createdFiles = [];

      if (!isYtb2) {
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          try {
            const thumbPath = path.join(
              cacheDir,
              `thumb_${senderID}_${Date.now()}_${i}.jpg`
            );

            const res = await axios.get(r.thumbnail, {
              responseType: "arraybuffer",
              timeout: 10000
            });

            fs.writeFileSync(thumbPath, Buffer.from(res.data));
            createdFiles.push(thumbPath);

            mediaGroup.push({
              type: 'photo',
              media: thumbPath
            });
          } catch {}
        }
      }

      results.forEach((r, i) => {
        msgText += `${i + 1}. ${r.title}\n⏱ ${r.time}\n\n`;
      });

      const fullText = `📌 নাম্বার দিয়ে রিপ্লাই করো:\n\n${msgText}`;

      let sentMsg;
      if (mediaGroup.length > 0) {
        mediaGroup[0].caption = fullText;
        const sentMedia = await bot.sendMediaGroup(chatId, mediaGroup, { reply_to_message_id: messageId });
        sentMsg = sentMedia[0];
        
        createdFiles.forEach(f => {
          try { fs.unlinkSync(f); } catch {}
        });
      } else {
        sentMsg = await bot.sendMessage(chatId, fullText, { reply_to_message_id: messageId });
      }

      if (!global.onReplySystem) global.onReplySystem = new Map();
      global.onReplySystem.set(sentMsg.message_id, {
        commandName: this.config.name,
        author: senderID,
        results,
        menuMsgID: sentMsg.message_id,
        chatId: chatId
      });

    } catch (e) {
      return bot.sendMessage(chatId, `❌ API সমস্যা: ${e.message}`, { reply_to_message_id: messageId });
    }
  },

  onReply: async function ({ bot, msg, Reply }) {
    const { results, author, menuMsgID, chatId } = Reply;
    const senderID = msg.from.id.toString();

    if (senderID !== author) return;

    const choice = parseInt(msg.text);
    if (!choice || choice < 1 || choice > results.length) return;

    const videoID = results[choice - 1].id;

    try {
      try {
        if (menuMsgID) await bot.deleteMessage(chatId, menuMsgID);
      } catch {}

      const data = await fetchWithFallback((base) =>
        `${base}/api/ytb/get?id=${videoID}&type=video`
      );

      const downloadLink = data?.data?.downloadLink;
      const title = data?.data?.title;

      if (!downloadLink) throw new Error("Download link not found");

      const filePath = path.join(__dirname, "cache", `yt_${Date.now()}.mp4`);

      const response = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream",
        timeout: 20000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await bot.sendVideo(
            chatId,
            filePath,
            {
              caption: `👑𝗢𝗪𝗡Ｅ𝗥 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 🪄 \n${title}`,
              reply_to_message_id: msg.message_id
            }
          );
        } catch (err) {
          await bot.sendMessage(chatId, "❌ ডাউনলোড বা পাঠানো ব্যর্থ হয়েছে", { reply_to_message_id: msg.message_id });
        } finally {
          try { fs.unlinkSync(filePath); } catch {}
        }
      });

      writer.on("error", () => {
        bot.sendMessage(chatId, "❌ ডাউনলোড ব্যর্থ হয়েছে", { reply_to_message_id: msg.message_id });
      });

    } catch (e) {
      bot.sendMessage(chatId, `❌ সমস্যা: ${e.message}`, { reply_to_message_id: msg.message_id });
    }
  }
};
