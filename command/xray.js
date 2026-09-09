const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

const XRAY_URL = "https://i.ibb.co.com/bRYqX9ms/Picsart-26-05-17-11-24-23-181.jpg";

module.exports = {
  config: {
    name: "xray",
    version: "1.0.0",
    author: "𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    countDown: 5,
    role: 0,
    description: {
      en: "Show someone's xray",
      bn: "কারো xray দেখাও",
      hi: "Kisi ka xray dikhao",
      tl: "Ipakita ang xray ng isa",
      ar: "أظهر الأشعة السينية لشخص ما"
    },
    category: "fun",
    guide: { en: "{pn} @mention or reply to a message" }
  },

  langs: {
    en: { noMention: "❌ | Mention someone or reply to a message!", error: "❌ | Failed to generate. Try again." },
    bn: { noMention: "❌ | কাউকে mention করুন বা reply করুন!", error: "❌ | তৈরি করতে সমস্যা হয়েছে।" },
    hi: { noMention: "❌ | Kisi ko mention karein ya reply karein!", error: "❌ | Banana fail hua." },
    tl: { noMention: "❌ | Mag-mention ng isa o mag-reply!", error: "❌ | Hindi nagawa." },
    ar: { noMention: "❌ | أشر إلى شخص أو رد على رسالة!", error: "❌ | فشل الإنشاء." }
  },

  onStart: async function ({ bot, msg, args, prefix, getLang }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

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
    }

    if (!targetUser) {
      const defaultLang = typeof getLang === "function" ? getLang("noMention") : "❌ | Mention someone or reply to a message!";
      return bot.sendMessage(chatId, defaultLang, { reply_to_message_id: messageId });
    }

    const ts = Date.now();
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const basePath = path.join(cacheDir, `xray_base_${ts}.jpg`);
    const avatarPath = path.join(cacheDir, `xray_avt_${ts}.jpg`);
    const outputPath = path.join(cacheDir, `xray_out_${ts}.jpg`);

    try {
      const photos = await bot.getUserProfilePhotos(targetUser.id, { limit: 1 });
      let avatarBuffer;

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

      const baseRes = await axios.get(XRAY_URL, { responseType: "arraybuffer" });

      fs.writeFileSync(basePath, Buffer.from(baseRes.data));
      fs.writeFileSync(avatarPath, avatarBuffer);

      const baseImg = await loadImage(basePath);
      const avatarImg = await loadImage(avatarPath);

      const W = baseImg.width;
      const H = baseImg.height;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImg, 0, 0, W, H);

      const frameX = 1000, frameY = 0, frameW = 1000, frameH = 2000;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();
      ctx.drawImage(avatarImg, frameX, frameY, frameW, frameH);
      ctx.restore();

      fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg", { quality: 0.92 }));

      await bot.sendPhoto(chatId, outputPath, { reply_to_message_id: messageId });

      [basePath, avatarPath, outputPath].forEach(p => { try { fs.unlinkSync(p); } catch (_) {} });

    } catch (err) {
      console.error("XRay Error:", err);
      [basePath, avatarPath, outputPath].forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch (_) {} });
      const errorMsg = typeof getLang === "function" ? getLang("error") : "❌ | Failed to generate. Try again.";
      bot.sendMessage(chatId, errorMsg, { reply_to_message_id: messageId });
    }
  }
};
