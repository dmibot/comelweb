require("./config")
const wawebjs = require("whatsapp-web.js")
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const { exec, spawn, execSync } = require("child_process")
const axios = require('axios')
const os = require('os')
const moment = require("moment-timezone")



module.exports = async (comel, m, commands) => {
    try {
        const { body, from, hasMedia: isMedia, type } = m
        let sender = m.author || m.from
        var prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : ''
        let isCmd = body.startsWith(prefix)
        const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1)
        const isOwner = [comel.info.wid._serialized, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@c.us').includes(sender)
        const text = args.join(" ")
        const quoted = m.hasQuotedMsg ? await m.getQuotedMessage() : m
        const mime = (quoted._data || quoted).mimetype || ""
        const isGroup = from.endsWith("@g.us")

        const metadata = await m.getChat()
        const groupName = isGroup ? metadata.groupMetadata.name : ""
        const participants = isGroup ? metadata.groupMetadata.participants : []
        const groupAdmins = isGroup ? participants.filter(v => v.isAdmin && !v.isSuperAdmin).map(v => v.id._serialized) : []
        const isBotAdmin = isGroup ? groupAdmins.includes(comel.info.wid._serialized) : false
        const isAdmin = isGroup ? groupAdmins.includes(sender) : false

        if (m) {
            console.log(chalk.black(chalk.bgWhite('[ PESAN ]')), chalk.black(chalk.bgGreen(new Date(m._data.t * 1000))), chalk.black(chalk.bgGreen(body || type)) + "\n" + chalk.black(chalk.bgWhite("=> Dari")), chalk.black(chalk.bgGreen(m._data.notifyName)), chalk.black(chalk.yellow(sender)) + "\n" + chalk.black(chalk.bgWhite("=> Di")), chalk.bgGreen(isGroup ? groupName : m._data.notifyName, from))  
        }

        //if (options.autoRead) (comel.type == "legacy") ? await comel.chatRead(m.key, 1) : await comel.sendReadReceipt(from, sender, [m.id])
        if (options.mute && !isOwner) return
        if (!options.public) { 
            if (!m.id.fromMe) return
        }

        const cmd = commands.get(command) || Array.from(commands.values()).find((v) => v.alias.find((x) => x.toLowerCase() == command)) || ""


        if (!cmd) return


        if (cmd.isMedia && !isMedia) {
            return global.mess("media", m)
        }

        if (cmd.isOwner && !isOwner) {
            return 
        }

        if (cmd.isGroup && !isGroup) {
            return global.mess("group", m)
        }

        if (cmd.isPrivate && isGroup) {
            return global.mess("private", m)
        }

        if (cmd.isBotAdmin && !isBotAdmin) {
            return global.mess("botAdmin", m)
        }

        if (cmd.isAdmin && !isAdmin) {
            return global.mess("admin", m)
        }

        if (cmd.isBot && m.id.fromMe) {
            return global.mess("bot", m)
        }

        if (cmd.disable && cmd) {
            return global.mess("dead", m)
        }

        if (cmd.desc && text.endsWith("--desc")) return m.reply(cmd.desc)
        if (cmd.example && text.endsWith("--use")) {
            return m.reply(`${cmd.example.replace(/%prefix/gi, prefix).replace(/%command/gi, cmd.name).replace(/%text/gi, text)}`)
        }

        if (cmd.isQuery && !text) {
            return m.reply(`${cmd.example.replace(/%prefix/gi, prefix).replace(/%command/gi, cmd.name).replace(/%text/gi, text)}`)
        }


        try {
            let cmdOptions = {
                name: "Dika Ardnt.",
                body,
                from, 
                isMedia,
                type,
                sender,
                prefix,
                command,
                commands,
                args,
                isOwner,
                text,
                quoted,
                mime,
                isGroup,
                metadata,
                groupName,
                participants,
                groupAdmins,
                isBotAdmin,
                isAdmin,
                toUpper: function(query) {
                    return query.replace(/^\w/, c => c.toUpperCase())
                },
                Function: require("./lib"),
            }
            cmd.start(comel, m, cmdOptions)
        } catch(e) {
            console.error(e)
        }

    } catch (e) {
        m.reply(util.format(e))
    }
}

global.reloadFile(__filename)
