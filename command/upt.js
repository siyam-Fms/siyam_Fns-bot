const os = require('os');

module.exports = {
    name: "upt",
    description: "Show bot uptime, RAM, CPU and system status",
    async execute(bot, msg, args) {
        const chatId = msg.chat.id;

        // Uptime Calculation (Days, Hours, Minutes, Seconds)
        const totalSeconds = process.uptime();
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const uptimeString = `${days}D ${hours}H ${minutes}M ${seconds}S`;

        // RAM & Memory Usage Calculation
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2); // MB
        const freeRam = (os.freemem() / 1024 / 1024).toFixed(2);   // MB
        const usedRam = (totalRam - freeRam).toFixed(2);           // MB
        const processMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // Bot's RAM usage in MB

        // System & CPU Info
        const cpuModel = os.cpus()[0]?.model || "Standard Virtual CPU";
        const cpuCores = os.cpus().length;
        const platform = os.platform().toUpperCase();

        // Status Message with Bold Styling
        const statusMsg = `${global.botConfig.styleText('📊 𝐁𝐎𝐓 & 𝐒𝐄𝐑𝐕𝐄𝐑 𝐒𝐓𝐀𝐓𝐔𝐒')}\n\n` +
            `${global.botConfig.styleText(`⏳ 𝐔𝐏𝐓𝐈𝐌𝐄 : ${uptimeString}`)}\n` +
            `${global.botConfig.styleText(`🧠 𝐁𝐎𝐓 𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄 : ${processMemory} MB`)}\n` +
            `${global.botConfig.styleText(`💾 𝐒𝐄𝐑𝐕𝐄𝐑 𝐑𝐀𝐌 : ${usedRam} MB / ${totalRam} MB`)}\n` +
            `${global.botConfig.styleText(`💻 𝐂𝐏𝐔 𝐂𝐎𝐑𝐄𝐒 : ${cpuCores} Core(s)`)}\n` +
            `${global.botConfig.styleText(`⚙️ 𝐎𝐒 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌 : ${platform}`)}\n` +
            `${global.botConfig.styleText(`⚡ 𝐒𝐄𝐑𝐕𝐄𝐑 𝐒𝐓𝐀𝐓𝐔𝐒 : ONLINE 24/7`)}\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, statusMsg, { parse_mode: 'HTML' });
    }
};
