// Import the discord.js module
const Discord = require('discord.js')

// Create an instance of a Discord client
const client = new Discord.Client()

// The token of your bot - https://discordapp.com/developers/applications/me
if (process.env.NODE_ENV === 'production' && !process.env.DISCORD_BOT_TOKEN) {
  console.warn('DISCORD_BOT_TOKEN not set') // eslint-disable-line no-console
}

// Log our bot in
client.login(process.env.DISCORD_BOT_TOKEN)

module.exports = client
