const { REST, Routes, ApplicationCommandOptionType} = require("discord.js");
require("dotenv").config()

const commands = [
  {
    name: "get-roles",
    description: "gets the available roles to collect",
  },
  {
    name: "create-role-button",
    description: "creates a new role button (Administrator or allowed only)",
    options:[
      {
        name: "button-label",
        description: "the label that will show up inside the button",
        required:true,
        type: ApplicationCommandOptionType.String
      },
      {
        name:"role",
        description: "the id of role that will be given once someone clicks on the button",
        required: true,
        type: ApplicationCommandOptionType.String
      },
      {
        name:"maximum-claims",
        description: "the maximum number of claims before the role gets removed from the buttons",
        required: false,
        type: ApplicationCommandOptionType.Integer
      }
    ]
  },
  {
    name: "remove-role-button",
    description: "removes a role button (Administrator or allowed only)",
    options:[
      {
        name: "role-label",
        description: "the label of the button you want to remove",
        required:true,
        type: ApplicationCommandOptionType.String
      }
    ]
  },
  {
    name: "give-role",
    description: "adds a role to a member",
    options:[
      {
        name: "role",
        description: "the role you want to give to someone",
        required:true,
        type: ApplicationCommandOptionType.Role
      },
      {
        name: "member",
        description: "the member who you want to add the role",
        required:true,
        type: ApplicationCommandOptionType.User
      }
    ]
  },
  {
    name: "remove-role",
    description: "removes a role from a member",
    options:[
      {
        name: "role",
        description: "the role you want to remove from someone",
        required:true,
        type: ApplicationCommandOptionType.Role
      },
      {
        name: "member",
        description: "the member who you want to remove the role from",
        required:true,
        type: ApplicationCommandOptionType.User
      }
    ]
  },
  {
    name: "add-button-manager-role",
    description: "the role specified will now be able to administrate button roles (Administrator only)",
    options:[
      {
        name: "role",
        description: "the role",
        required:true,
        type: ApplicationCommandOptionType.Role
      }
    ]
  },
  {
    name: "remove-button-manager-role",
    description: "remove a role from the button manager list",
    options:[
      {
        name: "role",
        description: "the role",
        required:true,
        type: ApplicationCommandOptionType.Role
      }
    ]
  },
  {
    name: "get-button-manager-roles",
    description: "get all the roles from button manager list",
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