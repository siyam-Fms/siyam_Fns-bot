require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');

// Express App setup for Render 24/7 keep-alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('👑 𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓 Is Active 24/7!'));
app.listen(PORT, () => console.log(`[SERVER] Keep-alive server running on port ${PORT}`));

// Bot Initialization
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Global System Metadata & Dual Prefix Config
global.botConfig = {
    botName: "👑 𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓",
    ownerName: "👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    adminId: "8442705758", // 👈 আপনার টেলিগ্রাম ইউজার আইডি বসাবেন
    userPrefix: "/",      // 👈 ডিফল্ট ইউজার প্রিফিক্স
    adminPrefix: ",",     // 👈 ডিফল্ট এডমিন প্রিফিক্স
    styleText: (text) => `<b>${text}</b>`
};

// Collections
bot.commands = new Map();
bot.events = [];

// Dynamic Command Loader
function loadCommands() {
    const commandPath = path.join(__dirname, 'command');
    if (!fs.existsSync(commandPath)) fs.mkdirSync(commandPath, { recursive: true });
    
    bot.commands.clear();
    const files = fs.readdirSync(commandPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        delete require.cache[require.resolve(path.join(commandPath, file))];
        try {
            const cmd = require(path.join(commandPath, file));
            if (cmd.name) {
                bot.commands.set(cmd.name, cmd);
                console.log(`[COMMAND LOADED] ➜ ${cmd.name}`);
            }
        } catch (err) {
            console.error(`[COMMAND ERROR] Failed to load ${file}:`, err.message);
        }
    }
}

// Dynamic Event Loader
function loadEvents() {
    const eventPath = path.join(__dirname, 'event');
    if (!fs.existsSync(eventPath)) fs.mkdirSync(eventPath, { recursive: true });

    bot.events = [];
    const files = fs.readdirSync(eventPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
        delete require.cache[require.resolve(path.join(eventPath, file))];
        try {
            const evt = require(path.join(eventPath, file));
            bot.events.push(evt);
            console.log(`[EVENT LOADED] ➜ ${file}`);
        } catch (err) {
            console.error(`[EVENT ERROR] Failed to load ${file}:`, err.message);
        }
    }
}

// Initial Load
loadCommands();
loadEvents();

// Auto-Watch for File Changes (Auto Hot-Reload)
chokidar.watch([path.join(__dirname, 'command'), path.join(__dirname, 'event')]).on('change', (filePath) => {
    console.log(`[FILE CHANGED] Reloading modules: ${filePath}`);
    loadCommands();
    loadEvents();
});

// Incoming Message Handler
bot.on('message', async (msg) => {
    if (!msg.text) return;

    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // ১. ইউজার বা এডমিন শুধু "prefix" লিখলে কার কী প্রিফিক্স তা দেখাবে
    if (text.toLowerCase() === "prefix") {
        const prefixInfoMsg = `${global.botConfig.styleText('⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎')}\n\n` +
            `${global.botConfig.styleText(`👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${global.botConfig.userPrefix} ]`)}\n` +
            `${global.botConfig.styleText(`👑 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${global.botConfig.adminPrefix} ]`)}\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        return bot.sendMessage(chatId, prefixInfoMsg, { parse_mode: 'HTML' });
    }

    // এডমিন ও ইউজার প্রিফিক্স নির্বাচন
    const isAdmin = userId === global.botConfig.adminId;
    const activePrefix = isAdmin ? global.botConfig.adminPrefix : global.botConfig.userPrefix;

    // ২. নির্দিষ্ট প্রিফিক্স ছাড়া মেসেজ আসলে ইভেন্টে পাঠানো হবে
    if (!text.startsWith(activePrefix)) {
        for (const evt of bot.events) {
            try {
                if (evt.handle) await evt.handle(bot, msg);
            } catch (err) {
                console.error(`[EVENT ERROR]:`, err);
            }
        }
        return;
    }

    // ৩. শুধু প্রিফিক্স টাইপ করলে
    const rawInput = text.slice(activePrefix.length).trim();
    if (rawInput === "") {
        const noCmdMsg = `${global.botConfig.styleText(`⚠️ 𝐍𝐎 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐏𝐑𝐎𝐕𝐈𝐃𝐄𝐃!`)}\n\n` +
            `${global.botConfig.styleText(`𝐔𝐒𝐄 ${activePrefix}help 𝐓𝐎 𝐒𝐄𝐄 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒.`)}\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        return bot.sendMessage(chatId, noCmdMsg, { parse_mode: 'HTML' });
    }

    // ৪. কমান্ড প্রসেস করা
    const args = rawInput.split(/ +/);
    const commandName = args.shift().toLowerCase();
    const cmd = bot.commands.get(commandName);

    if (cmd) {
        try {
            await cmd.execute(bot, msg, args);
        } catch (error) {
            console.error(`[EXECUTION ERROR] Command ${activePrefix}${commandName}:`, error);
            bot.sendMessage(chatId, global.botConfig.styleText(`⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐞𝐱𝐞𝐜𝐮𝐭𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!`), { parse_mode: 'HTML' });
        }
    } else {
        // ৫. ভুল বা না থাকা কমান্ড দিলে
        const notFoundMsg = `${global.botConfig.styleText(`❌ 𝐍𝐎𝐓 𝐀 𝐕𝐀𝐋𝐈𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃!`)}\n\n` +
            `${global.botConfig.styleText(`𝐔𝐒𝐄 ${activePrefix}help 𝐓𝐎 𝐒𝐄𝐄 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒.`)}\n\n` +
            `${global.botConfig.styleText(global.botConfig.botName)}\n` +
            `${global.botConfig.styleText(global.botConfig.ownerName)}`;

        bot.sendMessage(chatId, notFoundMsg, { parse_mode: 'HTML' });
    }
});

// Global Anti-Crash Protection
process.on('unhandledRejection', (reason, promise) => {
    console.error(' [ANTI-CRASH] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.error(' [ANTI-CRASH] Uncaught Exception:', err);
});

console.log("🚀 Bot Core System Successfully Online!");
