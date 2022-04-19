const { MessageMedia } = require("whatsapp-web.js")
const fs = require("fs")

module.exports = {
    name: "hidetag",
    alias: ["totag","tagall"],
    desc: "Send Message With Tag All Participants",
    type: "group",
    start: async(comel, m, { participants, quoted, text }) => {
        let _participants = participants.map(v => v.id._serialized)
        let mentions = []
        for (let jid of _participants) mentions.push(await comel.getChatById(jid))
        if (m.hasMedia) {
            let message = await quoted.downloadMedia()
            comel.sendMessage(m.from, message, { mentions })
        } else {
            comel.sendMessage(m.from, text, { mentions })
        }
    },
    isGroup: true,
    isAdmin: true
}