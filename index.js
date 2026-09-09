require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');

const configPath = path.join(__dirname, 'config.json');
let config = fs.existsSync(configPath) ? fs.readJsonSync(configPath) : {};

const app = express();
const PORT = process.env.PORT || config.dashBoard?.port || 3000;
app.get('/', (req, res) => res.send(`👑 ${config.botName || 'Bot'} Is Active 24/7!`));
app.listen(PORT, () => console.log(`[SERVER] Keep-alive server running on port ${PORT}`));

const token = process.env.BOT_TOKEN || config.telegramBot?.botToken;
const bot = new TelegramBot(token, { polling: true });

global.styleText = (text) => `<b>${text}</b>`;

global.getBotConfig = () => {
    if (fs.existsSync(configPath)) {
        try { config = fs.readJsonSync(configPath); } catch (e) {}
    }
    return {
        botName: config.botName || "[!]𝐍𝐈𝐉𝐇𝐔𝐌-𝐂𝐇𝐀𝐓-𝐁𝐎𝐓",
        ownerName: config.security?.ownerName || "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
        ownerUID: String(config.security?.ownerUID || ""),
        adminBot: (config.adminBot || []).map(id => String(id)),
        userPrefix: config.prefix?.publicPrefix || "!",
        adminPrefix: config.prefix?.adminPrefix || ".",
        allowAdminUsePublicPrefix: config.prefix?.allowAdminUsePublicPrefix ?? true,
        whiteListMode: config.whiteListMode || { enable: false, whiteListIds: [] },
        adminOnly: config.adminOnly || { enable: false, ignoreCommand: [] },
        reactUnsend: config.reactUnsend || { enable: false, onlyAdmin: true, emojis: [] },
        hideNotiMessage: config.hideNotiMessage || { commandNotFound: false, adminOnly: false, userBanned: false }
    };
};

bot.commands = new Map();
bot.events = [];

function loadCommands() {
    const commandPath = path.join(__dirname, 'command');
    if (!fs.existsSync(commandPath)) fs.mkdirSync(commandPath, { recursive: true });
    
    bot.commands.clear();
    const files = fs.readdirSync(commandPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        delete require.cache[require.resolve(path.join(commandPath, file))];
        try {
            const cmd = require(path.join(commandPath, file));
            const cmdName = cmd.config?.name || cmd.name;
            if (cmdName) {
                bot.commands.set(cmdName, cmd);
                console.log(`[COMMAND LOADED] ➜ ${cmdName}`);
            }
        } catch (err) {
            console.error(`[COMMAND ERROR] Failed to load ${file}:`, err.message);
        }
    }
}

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

loadCommands();
loadEvents();

chokidar.watch([path.join(__dirname, 'command'), path.join(__dirname, 'event')]).on('change', (filePath) => {
    console.log(`[FILE CHANGED] Reloading modules: ${filePath}`);
    loadCommands();
    loadEvents();
});

bot.on('message_reaction', async (event) => {
    const botConf = global.getBotConfig();
    if (!botConf.reactUnsend.enable) return;

    const userId = String(event.user.id);
    const isAdmin = botConf.adminBot.includes(userId) || userId === botConf.ownerUID;

    if (botConf.reactUnsend.onlyAdmin && !isAdmin) return;

    const newEmoji = event.new_reaction?.[0]?.emoji;
    if (newEmoji && botConf.reactUnsend.emojis.includes(newEmoji)) {
        try {
            await bot.deleteMessage(event.chat.id, event.message_id);
        } catch (err) {
            console.error(`[UNSEND ERROR]:`, err.message);
        }
    }
});

bot.on('message', async (msg) => {
    if (!msg.text) return;

    const botConf = global.getBotConfig();
    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = String(msg.from.id);

    const isAdmin = botConf.adminBot.includes(userId) || userId === botConf.ownerUID;

    if (botConf.whiteListMode.enable && !isAdmin) {
        const isWhitelisted = botConf.whiteListMode.whiteListIds.map(String).includes(userId);
        if (!isWhitelisted) return;
    }

    if (text.toLowerCase() === "prefix") {
        const prefixInfoMsg = `${global.styleText('⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎')}\n\n` +
            `${global.styleText(`👤 𝐔𝐒𝐄𝐑 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${botConf.userPrefix} ]`)}\n` +
            `${global.styleText(`👑 𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐄𝐅𝐈𝐗 : [ ${botConf.adminPrefix} ]`)}\n\n` +
            `${global.styleText(`👑 ${botConf.botName}`)}\n` +
            `${global.styleText(`👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ ${botConf.ownerName}`)}`;

        return bot.sendMessage(chatId, prefixInfoMsg, { parse_mode: 'HTML' });
    }

    let activePrefix = null;
    if (isAdmin) {
        if (text.startsWith(botConf.adminPrefix)) {
            activePrefix = botConf.adminPrefix;
        } else if (botConf.allowAdminUsePublicPrefix && text.startsWith(botConf.userPrefix)) {
            activePrefix = botConf.userPrefix;
        }
    } else {
        if (text.startsWith(botConf.userPrefix)) {
            activePrefix = botConf.userPrefix;
        }
    }

    for (const [, cmd] of bot.commands) {
        if (typeof cmd.onChat === 'function') {
            try {
                await cmd.onChat({ bot, msg });
            } catch (err) {
                console.error(`[ONCHAT ERROR]:`, err);
            }
        }
    }

    if (!activePrefix) {
        for (const evt of bot.events) {
            try {
                if (evt.handle) await evt.handle(bot, msg);
            } catch (err) {
                console.error(`[EVENT ERROR]:`, err);
            }
        }
        return;
    }

    const rawInput = text.slice(activePrefix.length).trim();
    if (rawInput === "") {
        const noCmdMsg = `${global.styleText(`⚠️ 𝐍𝐎 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐏𝐑𝐎𝐕𝐈𝐃𝐄𝐃!`)}\n\n` +
            `${global.styleText(`𝐔𝐒𝐄 ${activePrefix}help 𝐓𝐎 𝐒𝐄𝐄 𝐀🇱🇱 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒.`)}\n\n` +
            `${global.styleText(`👑 ${botConf.botName}`)}\n` +
            `${global.styleText(`👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ ${botConf.ownerName}`)}`;

        return bot.sendMessage(chatId, noCmdMsg, { parse_mode: 'HTML' });
    }

    const args = rawInput.split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (botConf.adminOnly.enable && !isAdmin) {
        const isIgnored = (botConf.adminOnly.ignoreCommand || []).includes(commandName);
        if (!isIgnored) {
            if (!botConf.hideNotiMessage.adminOnly) {
                bot.sendMessage(chatId, global.styleText(`⚠️ 𝐓𝐡𝐢𝐬 𝐛𝐨𝐭 𝐢𝐬 𝐜𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲 𝐢𝐧 𝐀𝐝𝐦𝐢𝐧-𝐎𝐧𝐥𝐲 𝐦𝐨𝐝𝐞!`), { parse_mode: 'HTML' });
            }
            return;
        }
    }

    let cmd = bot.commands.get(commandName);
    if (!cmd) {
        for (const [, command] of bot.commands) {
            const aliases = command.config?.aliases || command.aliases;
            if (aliases && Array.isArray(aliases) && aliases.includes(commandName)) {
                cmd = command;
                break;
            }
        }
    }

    if (cmd) {
        try {
            if (typeof cmd.onStart === 'function') {
                await cmd.onStart({ bot, msg, args });
            } else if (typeof cmd.execute === 'function') {
                await cmd.execute(bot, msg, args);
            }
        } catch (error) {
            console.error(`[EXECUTION ERROR] Command ${activePrefix}${commandName}:`, error);
            bot.sendMessage(chatId, global.styleText(`⚠️ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐞𝐱𝐞𝐜𝐮𝐭𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝!`), { parse_mode: 'HTML' });
        }
    } else {
        if (!botConf.hideNotiMessage.commandNotFound) {
            const notFoundMsg = `${global.styleText(`❌ 𝐍𝐎𝐓 𝐀 𝐕𝐀🇱𝐈𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃!`)}\n\n` +
                `${global.styleText(`𝐔𝐒𝐄 ${activePrefix}help 𝐓𝐎 𝐒𝐄𝐄 𝐀🇱🇱 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒.`)}\n\n` +
                `${global.styleText(`👑 ${botConf.botName}`)}\n` +
                `${global.styleText(`👑 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 ➜ ${botConf.ownerName}`)}`;

            bot.sendMessage(chatId, notFoundMsg, { parse_mode: 'HTML' });
        }
    }
});

process.on('unhandledRejection', (reason) => console.error(' [ANTI-CRASH] Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error(' [ANTI-CRASH] Uncaught Exception:', err));

console.log("🚀 Bot Core System Successfully Online!");
