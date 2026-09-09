const moment = require("moment-timezone");

if (!global.whiteListConfig) {
  global.whiteListConfig = {
    enable: false,
    whiteListIds: []
  };
}

module.exports = {
  config: {
    name: "wl",
    aliases: ["whitelist"],
    version: "2.0",
    author: "𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍",
    role: 2,
    shortDescription: "Manage whiteListIds",
    longDescription: "Manage whiteListIds and toggle whitelist mode on/off.",
    category: "owner",
    guide: "{pn} add <uid | @tag>\n{pn} remove <uid | @tag>\n{pn} list\n{pn} on / off"
  },

  langs: {
    en: {
      added: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐀𝐝𝐝𝐞𝐝:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
      removed: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
      listAdmin: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» 👑 𝐖𝐡𝐢𝐭𝐞𝐋𝐢𝐬𝐭 𝐔𝐬𝐞𝐫𝐬:\n%1\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
      missingIdAdd: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧",
      missingIdRemove: "» 👑 𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍 👑\n───────────────\n» ⚠️ 𝐆𝐢𝐯𝐞 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠!\n───────────────\n» 🧚‍♀️ ‿𝗡𝗜𝗝𝗛𝗨𝗠 𝗖𝗛𝗔𝗧𝗕𝗢𝗧"
    }
  },

  onStart: async function ({ bot, msg, args }) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const getLang = (key, param = "") => {
      let str = this.langs.en[key] || "";
      if (param) str = str.replace("%1", param);
      return str;
    };

    const subCommand = args[0] ? args[0].toLowerCase() : "";

    switch (subCommand) {

      // ================= ADD =================
      case "add":
      case "-a": {
        if (!args[1] && !msg.reply_to_message && !msg.entities) {
          return bot.sendMessage(chatId, getLang("missingIdAdd"), { reply_to_message_id: messageId });
        }

        let uids = [];

        if (msg.reply_to_message && msg.reply_to_message.from) {
          uids.push(msg.reply_to_message.from.id);
        } else if (msg.entities) {
          for (const entity of msg.entities) {
            if (entity.type === "text_mention" && entity.user) {
              uids.push(entity.user.id);
            }
          }
        }

        args.slice(1).forEach(arg => {
          if (!isNaN(arg) && !uids.includes(parseInt(arg))) {
            uids.push(parseInt(arg));
          }
        });

        if (uids.length === 0) {
          return bot.sendMessage(chatId, getLang("missingIdAdd"), { reply_to_message_id: messageId });
        }

        const added = [];

        for (const uid of uids) {
          if (!global.whiteListConfig.whiteListIds.includes(uid)) {
            global.whiteListConfig.whiteListIds.push(uid);
            added.push(uid);
          }
        }

        const names = added.map(uid => `• User (${uid})`);

        return bot.sendMessage(
          chatId,
          getLang("added", names.length > 0 ? names.join("\n") : "None (Already added)"),
          { reply_to_message_id: messageId }
        );
      }

      // ================= REMOVE =================
      case "remove":
      case "-r": {
        if (!args[1] && !msg.reply_to_message && !msg.entities) {
          return bot.sendMessage(chatId, getLang("missingIdRemove"), { reply_to_message_id: messageId });
        }

        let uids = [];

        if (msg.reply_to_message && msg.reply_to_message.from) {
          uids.push(msg.reply_to_message.from.id);
        } else if (msg.entities) {
          for (const entity of msg.entities) {
            if (entity.type === "text_mention" && entity.user) {
              uids.push(entity.user.id);
            }
          }
        }

        args.slice(1).forEach(arg => {
          if (!isNaN(arg) && !uids.includes(parseInt(arg))) {
            uids.push(parseInt(arg));
          }
        });

        if (uids.length === 0) {
          return bot.sendMessage(chatId, getLang("missingIdRemove"), { reply_to_message_id: messageId });
        }

        const removed = [];

        for (const uid of uids) {
          const index = global.whiteListConfig.whiteListIds.indexOf(uid);
          if (index !== -1) {
            global.whiteListConfig.whiteListIds.splice(index, 1);
            removed.push(uid);
          }
        }

        const names = removed.map(uid => `• User (${uid})`);

        return bot.sendMessage(
          chatId,
          getLang("removed", names.length > 0 ? names.join("\n") : "None (Not found in list)"),
          { reply_to_message_id: messageId }
        );
      }

      // ================= LIST =================
      case "list":
      case "-l": {
        if (global.whiteListConfig.whiteListIds.length === 0) {
          return bot.sendMessage(chatId, getLang("listAdmin", "No users in whitelist"), { reply_to_message_id: messageId });
        }

        const names = global.whiteListConfig.whiteListIds.map(uid => `• User (${uid})`);
        return bot.sendMessage(chatId, getLang("listAdmin", names.join("\n")), { reply_to_message_id: messageId });
      }

      // ================= ON =================
      case "on": {
        global.whiteListConfig.enable = true;

        const time = moment().tz("Asia/Dhaka").format("hh:mm A");
        const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");

        const responseMsg = `
👑  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑

𝆠፝𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 𝐄𝐍𝐀𝐁𝐋𝐄𝐃

🔐  𝆠፝𝐀𝐂𝐂𝐄𝐒𝐒 :
   𝆠፝🐸এখন শুধু আমার বস সিয়াম🪬
   𝆠፝বট ব্যবহার করতে পারবে 👑

📅  𝆠፝𝐃𝐚𝐭𝐞 : ${date}
⏰  𝆠፝𝐓𝐢𝐦𝐞 : ${time}

👑  𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑
`;

        return bot.sendMessage(chatId, responseMsg, { reply_to_message_id: messageId });
      }

      // ================= OFF =================
      case "off": {
        global.whiteListConfig.enable = false;

        const time = moment().tz("Asia/Dhaka").format("hh:mm A");
        const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");

        const responseMsg = `
👑  𝆠፝𝐒𝐈𝐘𝐀𝐌-𝐇𝐀𝐒𝐀𝐍  👑

𝆠፝𝐖𝐇𝐈𝐓𝐄 𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃

🌐  𝆠፝𝐀𝐂𝐂𝐄𝐒𝐒 :
   𝆠፝এখন সবাই বট ব্যবহার🪬
   𝆠፝করতে পারবে 🎉

📅  𝆠፝𝐃𝐚𝐭𝐞 : ${date}
⏰  𝆠፝𝐓𝐢𝐦𝐞 : ${time}

👑  𝆠፝𝐍𝐈𝐉𝐇𝐔𝐌 𝐂𝐇𝐀𝐓 𝐁𝐎𝐓  👑
`;

        return bot.sendMessage(chatId, responseMsg, { reply_to_message_id: messageId });
      }

      default: {
        const syntaxMsg = `⚠️ Wrong Syntax!\n\nGuide:\n${this.config.guide}`;
        return bot.sendMessage(chatId, syntaxMsg, { reply_to_message_id: messageId });
      }
    }
  }
};
