const { log } = require("console");
const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const { writeFileSync, truncate } = require("fs");
const internal = require("stream");
const { isExternal } = require("util/types");
require("dotenv").config()
const { readFile, writeFile } = require("fs").promises

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

client.on("ready", (bot) => {
    console.log(`THE BOT ${bot.user.tag} IS ONLINE`)
});

class Role {
    constructor(name, id, max = undefined) {
        this.name = name;
        this.id = id;
        if (max) {
            this.puremax = max;
            this.max = max;
        }
    }
}

async function hasRole(whatToCheck) {
    const roles = await readFile("roles.json")
    for (i = 0; i < whatToCheck; i++) {
        if (roles.find(role => {
            if (whatToCheck.includes(role)) {
                console.log("idk")
                return true
            }
        })) {
            return true
        }
    }
    console.log("YUP")
    return false
}

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        if (interaction.commandName === "get-roles") {
            const roles = JSON.parse(await readFile("roles.json"))
            if (!roles[interaction.guild.id] || roles[interaction.guild.id][0].length == 0) {
                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("No roles registered")
                return await interaction.reply({ embeds: [embed] })
            } else {
                var fields = []
                roles[interaction.guild.id][0].forEach(role => {
                    var goodRole = interaction.guild.roles.cache.get(String(role.id))
                    if (!goodRole) {
                        goodRole = "Deleted Role"
                    }

                    if (!role.max) {
                        role.max = "Unlimited"
                    }

                    fields.push({
                        name: role.name,
                        value: `Role: ${goodRole} \n Claims Available: ${role.max}`,
                        inline: false
                    })
                })

                const embed = new EmbedBuilder()
                    .setColor("Random")
                    .setTitle("Available Roles")
                    .setDescription("Click the button of the role you want to equip/unequip")
                    .setFields(fields)

                const row = new ActionRowBuilder()

                roles[interaction.guild.id][0].forEach(element => {
                    row.components.push(
                        new ButtonBuilder()
                            .setLabel(element.name)
                            .setCustomId(element.id)
                            .setStyle(ButtonStyle.Primary)

                    )
                });

                await interaction.reply({ embeds: [embed], components: [row] })
            }
        }

        if (interaction.commandName === "create-role-button") {

            const roles = JSON.parse(await readFile("roles.json", "utf-8"))
            var hasRoleBOOL = false
            console.log(interaction.member.roles.cache)
            for(i = 0; i < roles[interaction.guild.id][1].length; i++){
                console.log(role)
                if(interaction.member.roles.cache.has(roles[interaction.guild.id][1][i])){
                    hasRoleBOOL = true
                }
            }

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && !hasRoleBOOL) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't modify role buttons")], ephemeral: true })
            } else {
                const name = interaction.options.get("button-label").value
                const id = interaction.options.get("role").value
                const goodRole = interaction.guild.roles.cache.get(String(id))
                var max
                try {
                    max = interaction.options.get("maximum-claims").value
                } catch (error) {
                    max = undefined
                }


                if (!roles[interaction.guild.id]) {
                    if (!goodRole) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`the role with id ${id} does not exist`)], ephemeral: true })
                    }

                    roles[interaction.guild.id] = [[new Role(name, id, max)], []]

                    await writeFile("roles.json", JSON.stringify(roles))
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle(`role ${goodRole} set as button!`)
                    return await interaction.reply({ embeds: [embed] })
                } else {
                    if (!goodRole) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`the role with id ${id} does not exist`)], ephemeral: true })
                    }

                    for (i = 0; i < roles[interaction.guild.id][0].length; i++) {
                        if (id == roles[interaction.guild.id][0][i].id) {
                            return await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`The role ${goodRole} has already been set as a button`)], ephemeral: true })
                        }

                        if (name == roles[interaction.guild.id][0][i].name) {
                            return await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`The label "${name}" has already been set as a label for a button`)], ephemeral: true })
                        }
                    }

                    if (roles[interaction.guild.id][0].length > 4) {
                        const embed = new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Error")
                            .setDescription("Maximum of 5 roles reached")
                        return await interaction.reply({ embeds: [embed], ephemeral: true })
                    } else {
                        console.log("in the last else bebe")

                        roles[interaction.guild.id][0].push(new Role(name, id, max))

                        await writeFile("roles.json", JSON.stringify(roles))

                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Role set")
                            .setDescription(`role ${goodRole} set as button!`)
                        return await interaction.reply({ embeds: [embed] })
                    }
                }
            }
        }

        if (interaction.commandName === "remove-role-button") {

            const roles = JSON.parse(await readFile("roles.json", "utf-8"))

            var hasRoleBOOL = false
            for(i = 0; i < roles[interaction.guild.id][1].length; i++){
                console.log(roles[interaction.guild.id][1][i])
                if(interaction.member.roles.cache.has(roles[interaction.guild.id][1][i])){
                    hasRoleBOOL = true
                }
            }

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && !hasRoleBOOL) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't modify role buttons")], ephemeral: true })
            } else {
                const roleLabel = interaction.options.get("role-label").value
                if (!roles[interaction.guild.id][0] || roles[interaction.guild.id][0].length == 0) {
                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Error")
                        .setDescription("This server has no button roles.")
                    return await interaction.reply({ embeds: [embed] })
                } else {
                    const removarole = roles[interaction.guild.id][0].find(element => {
                        if (element.name == roleLabel) {
                            return true
                        }
                        return false
                    })
                    if (!removarole) {
                        return interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`The button with the label ${roleLabel} does not exist`)], ephemeral: true })
                    }

                    const newRoleArray = roles[interaction.guild.id][0].map(element => {
                        return element.name
                    })

                    const index = newRoleArray.indexOf(removarole.name)
                    console.log(index)
                    console.log(removarole)
                    roles[interaction.guild.id][0].splice(index, 1)

                    await writeFile("roles.json", JSON.stringify(roles))

                    const embed = new EmbedBuilder()
                        .setColor("Random")
                        .setTitle("Role button removed")
                        .setDescription(`Role button with label "${roleLabel}" removed`)
                    return await interaction.reply({ embeds: [embed] })
                }
            }
        }

        if (interaction.commandName === "give-role") {
            var role
            try {
                if (!interaction.member.permissions.has("MANAGE_ROLES")) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't add roles to people")], ephemeral: true })
                }

                const user = client.user
                const botMember = interaction.guild.members.cache.get(user.id);

                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription("I Don't have the MANAGE_ROLES permmision enabled. I can't administrate roles!")], ephemeral: true })
                }

                const role = interaction.options.get("role").role
                const member = interaction.options.get("member").member

                if (member.roles.cache.has(role.id)) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription(`${member} already has the role ${role}`)], ephemeral: true })
                }
                member.roles.add(role)

                return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Random").setTitle("Role added").setDescription(`Successfuly added ${member} the role ${role}`)], ephemeral: false })
            } catch (error) {
                console.log(error)
                interaction.reply({ content: `I can't administrate this specific role. AKA ${role}`, ephemeral: true })
            }
        }

        if (interaction.commandName === "remove-role") {
            var role
            try {
                if (!interaction.member.permissions.has("MANAGE_ROLES")) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't remove roles from people")], ephemeral: true })
                }

                const user = client.user
                const botMember = interaction.guild.members.cache.get(user.id);

                if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription("I Don't have the MANAGE_ROLES permmision enabled. I can't administrate roles!")], ephemeral: true })
                }

                const role = interaction.options.get("role").role
                const member = interaction.options.get("member").member

                if (!member.roles.cache.has(role.id)) {
                    return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription(`${member} does not have the role ${role}`)], ephemeral: true })
                }
                member.roles.remove(role)

                return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Role added").setDescription(`Successfuly removed the role ${role} from ${member}`)], ephemeral: false })
            } catch (error) {
                console.log(error)
                interaction.reply({ content: `I can't administrate this specific role. AKA ${role}`, ephemeral: true })
            }
        }

        if (interaction.commandName === "add-button-manager-role") {
            const roles = JSON.parse(await readFile("roles.json", "utf-8"))
            const role = interaction.options.get("role")

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't modify role button managers")], ephemeral: true })
            }

            if (!roles[interaction.guild.id]) {
                roles[interaction.guild.id] = [[], [role.value]]
                await writeFile("roles.json", JSON.stringify(roles))
            } else {
                for (i = 0; i < roles[interaction.guild.id][1].length; i++) {
                    console.log(role.value, "", roles[interaction.guild.id][1][i])
                    if (role.value == roles[interaction.guild.id][1][i]) {
                        return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription(`The role ${interaction.guild.roles.cache.get(role.value)} has already been set as allowed`)], ephemeral: true })
                    }
                }
                roles[interaction.guild.id][1].push(role.value)
            }

            await writeFile("roles.json", JSON.stringify(roles))
            console.log(role.value, " ", role.id)
            return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Random").setTitle("Role set").setDescription(`The role ${interaction.guild.roles.cache.get(role.value)} has succesfully been set as allowed!!!`)] })
        }

        if (interaction.commandName == "get-button-manager-roles") {
            try {
                const roles = JSON.parse(await readFile("roles.json", "utf-8"))

                var fields = roles[interaction.guild.id][1].map(element => {
                    return {
                        name: "Role: ",
                        value: `${interaction.guild.roles.cache.get(element)} `,
                        inline: false,
                    }
                })
                console.log(fields /*as params*/)
                return await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Button Manager Roles: ").setDescription("Any of these roles can administrate role buttons. However, they are not be able to add button manager roles.").setFields(fields)], ephemeral: true })
            } catch (error) {
                console.log(error)
            }

        }

        if (interaction.commandName == "remove-button-manager-role") {

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
                return interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("You are not an administrator. Therefore, you can't administrate role button managers")], ephemeral: true })
            }

            const roles = JSON.parse(await readFile("roles.json", "utf-8"))
            const role = interaction.options.get("role").value
            var cachedRole = interaction.guild.roles.cache.get(role)
            if(!cachedRole){
                cachedRole = "Deleted Role"
            }

            const removarole = roles[interaction.guild.id][1].find(element => {
                if (element == role) {
                    return true
                }
                return false
            })

            if (!removarole) {
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle("Error").setDescription(`The role ${cachedRole} is not a button manager role`)], ephemeral: true })
            }

            const index = roles[interaction.guild.id][1].indexOf(removarole)
            console.log(index)
            roles[interaction.guild.id][1].splice(index, 1)
            await writeFile("roles.json", JSON.stringify(roles))
            return await interaction.reply({ embeds: [new EmbedBuilder().setTitle("Role button manager removed").setDescription(`The role ${cachedRole} has successfuly been removed from the button manager list`)]})
        }
    }

    if (interaction.isButton()) {
        try {
            const roles = JSON.parse(await readFile("roles.json", "utf-8"))
            const role = interaction.guild.roles.cache.get(interaction.customId);

            //Our thing can't get certain roles 
            if (!role) {
                return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription("That role was deleted")], ephemeral: true })
            }

            const user = client.user
            const botMember = interaction.guild.members.cache.get(user.id);

            if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription("I Don't have the MANAGE_ROLES permmision enabled. I can't administrate roles!")], ephemeral: true })
            }

            var roleChecker = false
            for (i = 0; i < roles[interaction.guild.id][0].length; i++) {
                if (roles[interaction.guild.id][0][i].id == interaction.customId) {
                    roleChecker = true
                    
                    if (interaction.member.roles.cache.has(interaction.customId)) {
                        const embed = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Removed role")
                            .setDescription(`The role ${role} has been removed from you`)
                        await interaction.member.roles.remove(interaction.customId)
                        if (roles[interaction.guild.id][0][i].max) {
                            if (roles[interaction.guild.id][0][i].max < roles[interaction.guild.id][0][i].puremax) {
                                roles[interaction.guild.id][0][i].max += 1
                            }
                        }
                        await writeFile("roles.json", JSON.stringify(roles))
                        return await interaction.reply({ embeds: [embed], ephemeral: true })
                    } else {
                        await interaction.member.roles.add(interaction.customId)

                        if (roles[interaction.guild.id][0][i].max) {
                            roles[interaction.guild.id][0][i].max -= 1
                        }

                        const embedAdd = new EmbedBuilder()
                            .setColor("Random")
                            .setTitle("Added role")
                            .setDescription(`The role ${role} has been added to you!`)

                        if (roles[interaction.guild.id][0][i].max == 0) {
                            const removarole = roles[interaction.guild.id][0].find(element => {
                                if (element.name == roles[interaction.guild.id][0][i].name) {
                                    return true
                                }
                                return false
                            })

                            const newRoleArray = roles[interaction.guild.id][0].map(element => {
                                return element.name
                            })

                            const index = newRoleArray.indexOf(removarole.name)

                            console.log(index)
                            console.log(removarole)

                            roles[interaction.guild.id][0].splice(index, 1)

                            await interaction.reply({ embeds: [embedAdd], ephemeral: true })
                            await writeFile("roles.json", JSON.stringify(roles))
                            return await interaction.channel.send({ embeds: [new EmbedBuilder().setTitle("Role out of claims").setColor("Random").setDescription(`The role ${interaction.guild.roles.cache.get(removarole.id)} ran out of claims!`)] })
                        }

                        await writeFile("roles.json", JSON.stringify(roles))
                        return await interaction.reply({ embeds: [embedAdd], ephemeral: true })
                    }
                }
            }

            if (!roleChecker) {
                return await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setTitle("Error").setDescription(`The role ${role} is not assigned to a button anymore`)], ephemeral: true })
            }

        } catch (error) {
            console.error(error)
            return await interaction.reply({ content: "I don't have permissions to administrate this role", ephemeral: true })
        }
    }
})

client.login(process.env.TOKEN);