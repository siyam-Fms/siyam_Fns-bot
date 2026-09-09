module.exports = {
    name: "pp",
    description: "Get user profile picture and info",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;

        // রিপ্লাই দিলে ওই ইউজারের আইডি, না দিলে নিজের আইডি
        const targetUser = msg.reply_to_message ? msg.reply_to_message.from : msg.from;
        const userId = targetUser.id;
        const firstName = targetUser.first_name || "User";
        const lastName = targetUser.last_name ? ` ${targetUser.last_name}` : "";
        const fullName = `${firstName}${lastName}`;
        const username = targetUser.username ? `@${targetUser.username}` : "No Username";

        try {
            // ইউজারের প্রোফাইল ফটো ফেচ করা
            const userPhotos = await bot.getUserProfilePhotos(userId, { limit: 1 });

            const captionText = `${global.botConfig.styleText('👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐈𝐍𝐅𝐎')}\n\n` +
                `${global.botConfig.styleText(`📛 𝐍𝐀𝐌𝐄 : ${fullName.toUpperCase()}`)}\n` +
                `${global.botConfig.styleText(`🆔 𝐔𝐒𝐄𝐑 𝐈𝐃 : ${userId}`)}\n` +
                `${global.botConfig.styleText(`🏷️ 𝐔𝐒𝐄𝐑𝐍𝐀𝐌𝐄 : ${username}`)}\n\n` +
                `${global.botConfig.styleText(global.botConfig.botName)}\n` +
                `${global.botConfig.styleText(global.botConfig.ownerName)}`;

            if (userPhotos.total_count > 0) {
                // প্রোফাইল পিকচার থাকলে তা সেন্ড করবে
                const photoId = userPhotos.photos[0][0].file_id;
                await bot.sendPhoto(chatId, photoId, { caption: captionText, parse_mode: 'HTML' });
            } else {
                // প্রোফাইল পিকচার না থাকলে শুধু ইনফো সেন্ড করবে
                await bot.sendMessage(chatId, `${captionText}\n\n${global.botConfig.styleText('⚠️ 𝐍𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄 𝐅𝐎𝐔𝐍𝐃!')}`, { parse_mode: 'HTML' });
            }
        } catch (error) {
            console.error("PP Command Error:", error);
            bot.sendMessage(chatId, global.botConfig.styleText('❌ 𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐅𝐄𝐓𝐂𝐇 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐏𝐈𝐂𝐓𝐔𝐑𝐄!'), { parse_mode: 'HTML' });
        }
    }
};
