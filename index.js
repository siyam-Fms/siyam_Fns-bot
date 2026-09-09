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

// Global System Metadata & Styling
global.botConfig = {
    botName: "👑 𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓",
    ownerName: "👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ 𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
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

    // Command Execution
    if (text.startsWith('/')) {
        const args = text.slice(1).split(/ +/);
        const commandName = args.shift().toLowerCase();
        const cmd = bot.commands.get(commandName);

        if (cmd) {
            try {
                await cmd.execute(bot, msg, args);
            } catch (error) {
                console.error(`[EXECUTION ERROR] Command /${commandName}:`, error);
                bot.sendMessage(chatId, global.botConfig.styleText(`⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐞𝐱𝐞𝐜𝐮𝐭𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!`), { parse_mode: 'HTML' });
            }
            return;
        }
    }

    // Pass Message to Event Handlers (e.g., Auto Downloader, AI Auto Chat)
    for (const evt of bot.events) {
        try {
            if (evt.handle) await evt.handle(bot, msg);
        } catch (err) {
            console.error(`[EVENT EXECUTION ERROR]:`, err);
        }
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
