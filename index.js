require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Create the client with appropriate intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // To listen for member joins
    GatewayIntentBits.GuildMessages, // To send messages
    GatewayIntentBits.MessageContent, // To read message content (if needed for verification)
  ],
});

// Command registration
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  new SlashCommandBuilder().setName('info').setDescription('Get information about the bot'),
  new SlashCommandBuilder().setName('welcomer').setDescription('Set a welcome message for new members'),
  new SlashCommandBuilder().setName('verify').setDescription('Verify a user in the server'),
  new SlashCommandBuilder().setName('sendembed').setDescription('Send an embed to a specified channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send the embed to').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('The message to send inside the embed').setRequired(true)),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

// Deploying slash commands
async function deployCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

deployCommands();  // Call the async function once

// Event: When bot is ready
client.once('ready', () => {
  console.log(`${client.user.tag} is online and ready!`);
});

// Event: Handle Slash Command interaction
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (commandName === 'info') {
    await interaction.reply('I am ! Space 9, a bot developed to help create free Discord bots!');
  }

  // /welcomer command
  if (commandName === 'welcomer') {
    const channel = interaction.guild.systemChannel;
    if (!channel) {
      return interaction.reply('No system channel found!');
    }

    const welcomeMessage = 'Welcome to our awesome server! Enjoy your stay!';

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Welcome Message Set')
      .setDescription(welcomeMessage)
      .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
    return interaction.reply('The welcome message has been sent!');
  }

  // /verify command
  if (commandName === 'verify') {
    const role = interaction.guild.roles.cache.find(r => r.name === 'Verified');
    if (!role) {
      return interaction.reply('No "Verified" role found!');
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (member) {
      await member.roles.add(role);

      // Verification success embed for the user
      const verifyEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Verification Successful')
        .setDescription('You have been successfully verified! 🎉')
        .setTimestamp()
        .setFooter({ text: 'Enjoy your access to the server!' });

      await interaction.reply({ embeds: [verifyEmbed] });

      // Send verification instructions to the specific channel (1336099106585837670)
      const instructionsChannel = interaction.guild.channels.cache.get('1336099106585837670');
      if (instructionsChannel && instructionsChannel.isTextBased()) {
        const instructionsEmbed = new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle('How to Verify in Our Server')
          .setDescription('To verify in our server, follow the steps below:\n\n1. Click on the verification link (if provided).\n2. Wait for the bot to assign the "Verified" role.\n3. Once verified, you will gain access to the full server.\n\nIf you face any issues, please contact an admin.')
          .setTimestamp()
          .setFooter({ text: 'Contact admins if needed.' });

        // Send the instructions to the channel
        await instructionsChannel.send({ embeds: [instructionsEmbed] });
      } else {
        console.error('Unable to find the specified channel for verification instructions.');
      }
    } else {
      return interaction.reply('You are not a member of the server!');
    }
  }

  // /sendembed command
  if (commandName === 'sendembed') {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    if (channel && channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Custom Embed Message')
        .setDescription(message)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      return interaction.reply(`Embed sent to ${channel.name}`);
    } else {
      return interaction.reply('Invalid channel or unable to send message to this channel.');
    }
  }
});

// Event: New member joins the server
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.systemChannel;
  if (channel) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Welcome to the Server!')
      .setDescription(`Hello ${member.user.tag}, welcome to the server! 🎉`)
      .setTimestamp();

    await channel.send({ embeds: [welcomeEmbed] });
  }
});

// Login to Discord with your app's token
client.login(process.env.DISCORD_TOKEN);
