const { REST, Routes, ApplicationCommandOptionType} = require("discord.js");
require("dotenv").config()

const commands = [
  {
    name: "create-giveaway"
  }
]

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

async function main(){
  try {
    await rest.put(
      Routes.applicationCommands(process.env.BOT),
      { body: commands }
    )
    console.log(`Success at url: ${Routes.applicationCommands(process.env.BOT)}`)
  } catch (error) {
    console.log("there was an error :/ "+error)
  }
}

main()