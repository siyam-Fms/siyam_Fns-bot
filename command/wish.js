const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "wish",
    version: "2.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 0,
    shortDescription: "Beautiful happy birthday wish",
    longDescription: "Generate a premium style birthday wish card with avatar",
    category: "birthday",
    guide: {
      en: "{pn} @tag"
    }
  },

  wrapText(ctx, text, maxWidth) {
    return new Promise(resolve => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      const words = text.split(" ");
      const lines = [];
      let line = "";

      for (let word of words) {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(line.trim());
          line = word + " ";
        } else line = testLine;
      }
      lines.push(line.trim());
      resolve(lines);
    });
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const ts = Date.now();
    const bgPath = path.join(cacheDir, `bgc_${ts}.png`);
    const avtPath = path.join(cacheDir, `avt_${ts}.png`);

    try {
      let targetUser = null;

      if (msg.reply_to_message && msg.reply_to_message.from) {
        targetUser = msg.reply_to_message.from;
      } else if (msg.entities) {
        for (const entity of msg.entities) {
          if (entity.type === "text_mention" && entity.user) {
            targetUser = entity.user;
            break;
          }
        }
      } else if (args[0] && !isNaN(args[0])) {
        targetUser = { id: parseInt(args[0]), first_name: "User" };
      } else {
        targetUser = msg.from;
      }

      const targetName = targetUser.first_name || "User";
      const senderName = msg.from ? msg.from.first_name : "Someone";

      // Background
      const bgURL = "https://i.postimg.cc/k4RS69d8/20230921-195836.png";

      // Fetch avatar
      let avatarBuffer;
      try {
        const photos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });
        if (photos && photos.total_count > 0) {
          const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
          const file = await bot.getFile(fileId);
          const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
          const avatarRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
          avatarBuffer = Buffer.from(avatarRes.data);
        } else {
          const fallbackUrl = "https://i.imgur.com/6E2f0eU.png";
          const avatarRes = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
          avatarBuffer = Buffer.from(avatarRes.data);
        }
      } catch (err) {
        const fallbackUrl = "https://i.imgur.com/6E2f0eU.png";
        const avatarRes = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
        avatarBuffer = Buffer.from(avatarRes.data);
      }

      fs.writeFileSync(avtPath, avatarBuffer);

      // Fetch bg
      const bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(bgPath, Buffer.from(bgData));

      // Canvas
      const bg = await loadImage(bgPath);
      const avt = await loadImage(avtPath);

      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Avatar Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(270, 470, 200, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avt, 70, 270, 400, 400);
      ctx.restore();

      // Name text
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";

      const nameLines = await this.wrapText(ctx, targetName, 900);
      ctx.fillText(nameLines.join("\n"), 550, 420);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(bgPath, imageBuffer);

      // Premium Birthday Message
      const caption =
        `🎉✦ 𝗛𝗔𝗣𝗣𝗬 𝗕𝗜𝗥𝗧𝗛𝗗𝗔𝗬 ✦

❖ Dear ${targetName},

আজকের দিনটি তোমার জীবনের অন্যতম সুন্দর একটি দিন।
শুভ জন্মদিন! 🎂

◈ তোমার প্রতিটি স্বপ্ন পূরণ হোক।
◈ জীবন ভরে উঠুক সুখ, শান্তি ও সফলতায়।
◈ প্রতিটি নতুন দিন বয়ে আনুক আনন্দ ও আশীর্বাদ।

🤲 আল্লাহ তোমাকে সুস্থতা, দীর্ঘ নেক হায়াত,
হালাল রিজিক ও সুন্দর ভবিষ্যৎ দান করুন। আমীন।

✦ 𝗠𝗮𝗻𝘆 𝗛𝗮𝗽𝗽𝘆 𝗥𝗲𝘁𝘂𝗿𝗻𝘀 𝗢𝗳 𝗧𝗵𝗲 𝗗𝗮𝘆 ✦

— 𝗕𝗲𝘀𝘁 𝗪𝗶𝘀𝗵𝗲𝘀
${senderName}

👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑  `;

      await bot.sendPhoto(chatId, bgPath, {
        caption: caption,
        reply_to_message_id: messageId
      });

      [bgPath, avtPath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {} });

    } catch (e) {
      console.error(e);
      [bgPath, avtPath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {} });
      bot.sendMessage(chatId, "❌ Eʀʀᴏʀ Pʟᴇᴀsᴇ Tʀʏ Aɢᴀɪɴ", { reply_to_message_id: messageId });
    }
  }
};
