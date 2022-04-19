require("./config")
const fs = require("fs")
const yargs = require("yargs/yargs")
const chalk = require("chalk")
const qrcode = require("qrcode-terminal")
const util = require("util")
const path = require("path")
const Commands = new Map()
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const { jsonformat } = require("./lib/Function")


global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

const readCommands = () => {
    let dir = path.join(__dirname, "./commands")
    let dirs = fs.readdirSync(dir)
    let listType = []
    let listCommand = {}
    try {
        dirs.forEach(async (res) => {
            let groups = res.toLowerCase()
            Commands.type = dirs.filter(v => v !== "_").map(v => v)
            listCommand[groups] = []
            let files = fs.readdirSync(`${dir}/${res}`).filter((file) => file.endsWith(".js"))
            console.log(files)
            for (const file of files) {
                const command = require(`${dir}/${res}/${file}`)
                listCommand[groups].push(command)
                Commands.set(command.name, command)
                global.reloadFile(`${dir}/${res}/${file}`)
            }
        })
        Commands.list = listCommand
    } catch (e) {
        console.error(e)
    }
}

let sessionPath = `./tmp/${global.sessionName}`

async function connect() {
    await readCommands()
    const comel = new Client({
        authStrategy: new LocalAuth({
            dataPath: `./${global.sessionName}`
        }),
        puppeteer: {
            headless: true,
        }
    })

    comel.initialize()

    comel.on("qr", qr => {
        qrcode.generate(qr, { small: true })
    })

    comel.on("authenticated", async(auth) => {
        console.log(auth)
    })

    comel.on("auth_failure", async(auth_err) => {
        console.log(auth_err)
    })

    comel.on("ready", () => {
        console.log(chalk.greenBright("Client Is Already Running"))
    })

    comel.on("disconnected", async(reason) => {
        console.log("Client Was Logged Out", reason)
    })

    comel.on("message_create", (msg) => {
        try {
            if (!msg) return
            if (!global.options.public && !msg.fromMe) return
            if (msg.id.id.startsWith("3EB") && msg.id.id.length == 20) return
            require("./comel_chat")(comel, msg, Commands)
        } catch(e) {
            console.error(e)
        }
    })

    comel.on("group_update", (action) => {
        if (!action) return action
        require("./comel_group")(comel, action)
    })

    return comel
}

connect()
