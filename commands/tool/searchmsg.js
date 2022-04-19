module.exports = {
    name: "caripesan",
    alias: ["searchmsg"],
    desc: "Search Message From Chat",
    type: "tool",
    example: "Example : %prefix%command <query>, limit",
    start: async(comel, m, { text }) => {
        let [text1, text2] = text.split`,`
        let fetch = await comel.searchMessages(text1, { page: 1, limit: text2 || null, chatId: m.from })
        let total = fetch.length
        let sp = total < Number(text2) ? `Hanya Ditemukan ${total} Pesan` : `Ditemukan ${total} pesan`
        m.reply(sp)

        fetch.map(async ({ id }) => {
            let { remote: remoteJid, _serialized: serial } = id
            comel.sendMessage(m.from, "Nih Pesannya", { quotedMessageId: serial })
        })
    },
    isQuery: true
}
