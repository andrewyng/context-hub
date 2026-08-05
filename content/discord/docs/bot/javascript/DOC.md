---
name: bot
description: "Discord.js SDK for building Discord bots with slash commands and gateway events in JavaScript/TypeScript"
metadata:
  languages: "javascript"
  versions: "14.26.4"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "discord,bot,slash-commands,gateway,sdk"
---

# Discord.js JavaScript/TypeScript SDK Coding Guidelines

You are a Discord.js coding expert. Help me with writing code using the Discord API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://discord.js.org/docs/packages/discord.js/14.26.4

## Golden Rule: Use the Correct and Current SDK

Always use the discord.js library to interact with the Discord API, which is the standard library for all Discord bot interactions in JavaScript/TypeScript. Do not use legacy libraries or unofficial SDKs.

- **Library Name:** discord.js
- **NPM Package:** `discord.js`
- **Current Version:** 14.26.4 (v14)
- **Legacy Libraries:** discord.js v12, discord.js v13 are outdated and not recommended

**Installation:**

- **Correct:** `npm install discord.js`

**APIs and Usage:**

- **Correct:** `import { Client, GatewayIntentBits, Events } from 'discord.js'`
- **Correct:** `const client = new Client({ intents: [...] })`
- **Correct:** `client.on(Events.MessageCreate, ...)`
- **Correct:** `interaction.reply(...)`
- **Incorrect:** `Discord.Client` (use `Client` instead)
- **Incorrect:** `client.on('message', ...)` (use `client.on(Events.MessageCreate, ...)`)
- **Incorrect:** `MessageEmbed` (use `EmbedBuilder` in v14)

## Installation

Install discord.js using npm:

```bash
npm install discord.js
```

**Environment Variables:**

Create a `.env` file with your bot token:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_server_id_here
```

Install dotenv to load environment variables:

```bash
npm install dotenv
```

## Initialization

The `discord.js` library requires creating a `Client` instance with appropriate intents.

```javascript
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.login(process.env.DISCORD_TOKEN);
```

### Gateway Intents

Intents are named groups of pre-defined WebSocket events that your bot will receive. You must specify the intents your bot needs.

**Common Intents:**

- `GatewayIntentBits.Guilds` - Guild-related events (required for most bots)
- `GatewayIntentBits.GuildMessages` - Message events in guilds
- `GatewayIntentBits.MessageContent` - Access to message content (privileged)
- `GatewayIntentBits.GuildMembers` - Member join/leave events (privileged)
- `GatewayIntentBits.GuildPresences` - Presence updates (privileged)
- `GatewayIntentBits.DirectMessages` - DM events

**Privileged Intents:**

For `MessageContent`, `GuildMembers`, and `GuildPresences`, you must enable them in the Discord Developer Portal under your application's Bot settings.

```javascript
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Privileged - enable in Developer Portal
  ],
});
```

## Basic Bot Setup

### Ready Event

The `Ready` event fires when the bot successfully connects to Discord:

```javascript
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
```

### Message Events

Listen to messages in channels:

```javascript
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);
```

## Slash Commands

Slash commands are the primary way to interact with Discord bots. They provide a better user experience with autocomplete and validation.

### Registering Slash Commands

Create a separate file to register commands with Discord's API:

```javascript
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('user')
    .setDescription('Get info about a user')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user')
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('server')
    .setDescription('Get info about the server')
    .toJSON(),
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Register commands globally (takes up to 1 hour to propagate)
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    // OR register to a specific guild (instant update - for testing)
    // const data = await rest.put(
    //   Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    //   { body: commands }
    // );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
```

### Handling Slash Command Interactions

```javascript
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (interaction.commandName === 'user') {
    const user = interaction.options.getUser('target');
    await interaction.reply(`User: ${user.tag}, ID: ${user.id}`);
  } else if (interaction.commandName === 'server') {
    await interaction.reply(
      `Server: ${interaction.guild.name}, Members: ${interaction.guild.memberCount}`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
```

### Advanced Slash Command Options

```javascript
new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Echoes your message')
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The message to echo')
      .setRequired(true)
      .setMaxLength(2000)
  )
  .addBooleanOption((option) =>
    option
      .setName('ephemeral')
      .setDescription('Should the reply be private?')
      .setRequired(false)
  )
  .addIntegerOption((option) =>
    option
      .setName('number')
      .setDescription('A number')
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Select a channel')
  )
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('Select a role')
  )
  .toJSON()
```

### Choices in Slash Commands

Add predefined choices to string or number options:

```javascript
new SlashCommandBuilder()
  .setName('choose')
  .setDescription('Choose an option')
  .addStringOption((option) =>
    option
      .setName('option')
      .setDescription('Select an option')
      .setRequired(true)
      .addChoices(
        { name: 'Option A', value: 'option_a' },
        { name: 'Option B', value: 'option_b' },
        { name: 'Option C', value: 'option_c' }
      )
  )
  .toJSON()
```

### Autocomplete

Enable autocomplete for dynamic options:

```javascript
// In command definition
new SlashCommandBuilder()
  .setName('search')
  .setDescription('Search for something')
  .addStringOption((option) =>
    option
      .setName('query')
      .setDescription('Search query')
      .setRequired(true)
      .setAutocomplete(true)
  )
  .toJSON()

// In interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const focusedValue = interaction.options.getFocused();

    // Fetch or generate choices based on focusedValue
    const choices = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue.toLowerCase())
    );

    await interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  }
});
```

## Embeds

Embeds allow you to send rich, formatted messages with images, fields, and more.

### Basic Embed

```javascript
import { EmbedBuilder } from 'discord.js';

const embed = new EmbedBuilder()
  .setTitle('Embed Title')
  .setDescription('This is an embed description')
  .setColor(0x0099ff)
  .setTimestamp()
  .setFooter({ text: 'Footer text' });

await interaction.reply({ embeds: [embed] });
```

### Advanced Embed

```javascript
import { EmbedBuilder } from 'discord.js';

const embed = new EmbedBuilder()
  .setColor('#0099ff')
  .setTitle('Advanced Embed')
  .setURL('https://discord.js.org')
  .setAuthor({
    name: 'Author Name',
    iconURL: 'https://i.imgur.com/AfFp7pu.png',
    url: 'https://discord.js.org',
  })
  .setDescription('Some description here')
  .setThumbnail('https://i.imgur.com/AfFp7pu.png')
  .addFields(
    { name: 'Regular field title', value: 'Some value here' },
    { name: '\u200B', value: '\u200B' }, // Blank field
    { name: 'Inline field title', value: 'Some value here', inline: true },
    { name: 'Inline field title', value: 'Some value here', inline: true }
  )
  .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
  .setImage('https://i.imgur.com/AfFp7pu.png')
  .setTimestamp()
  .setFooter({
    text: 'Some footer text here',
    iconURL: 'https://i.imgur.com/AfFp7pu.png',
  });

await channel.send({ embeds: [embed] });
```

### Embed Colors

```javascript
// Hexadecimal
.setColor('#0099ff')

// Integer
.setColor(0x0099ff)

// RGB array
.setColor([0, 153, 255])

// Predefined colors
import { Colors } from 'discord.js';
.setColor(Colors.Blue)
.setColor(Colors.Red)
.setColor(Colors.Green)
```

## Buttons

Buttons are interactive components that users can click.

### Basic Button

```javascript
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('primary')
      .setLabel('Click me!')
      .setStyle(ButtonStyle.Primary)
  );

await interaction.reply({
  content: 'Click a button!',
  components: [row],
});
```

### Multiple Buttons

```javascript
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('primary')
      .setLabel('Primary')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('secondary')
      .setLabel('Secondary')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('success')
      .setLabel('Success')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('danger')
      .setLabel('Danger')
      .setStyle(ButtonStyle.Danger)
  );

await interaction.reply({
  content: 'Choose a button!',
  components: [row],
});
```

### Link Button

```javascript
const row = new ActionRowBuilder()
  .addComponents(
    new ButtonBuilder()
      .setLabel('Visit Website')
      .setURL('https://discord.js.org')
      .setStyle(ButtonStyle.Link)
  );
```

### Handling Button Interactions

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'primary') {
    await interaction.reply({ content: 'You clicked Primary!', ephemeral: true });
  } else if (interaction.customId === 'danger') {
    await interaction.reply({ content: 'Danger button clicked!', ephemeral: true });
  }
});
```

### Disabled Buttons

```javascript
new ButtonBuilder()
  .setCustomId('disabled')
  .setLabel('Disabled')
  .setStyle(ButtonStyle.Primary)
  .setDisabled(true)
```

## Select Menus

Select menus (dropdowns) allow users to choose from multiple options.

### String Select Menu

```javascript
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select')
      .setPlaceholder('Make a selection!')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Option 1')
          .setDescription('This is option 1')
          .setValue('option_1'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Option 2')
          .setDescription('This is option 2')
          .setValue('option_2'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Option 3')
          .setDescription('This is option 3')
          .setValue('option_3')
      )
  );

await interaction.reply({
  content: 'Choose an option:',
  components: [row],
});
```

### Handling Select Menu Interactions

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'select') {
    const selected = interaction.values[0];
    await interaction.reply({ content: `You selected: ${selected}`, ephemeral: true });
  }
});
```

### User Select Menu

```javascript
import { UserSelectMenuBuilder } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new UserSelectMenuBuilder()
      .setCustomId('user_select')
      .setPlaceholder('Select a user')
      .setMinValues(1)
      .setMaxValues(3)
  );
```

### Role Select Menu

```javascript
import { RoleSelectMenuBuilder } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId('role_select')
      .setPlaceholder('Select a role')
  );
```

### Channel Select Menu

```javascript
import { ChannelSelectMenuBuilder, ChannelType } from 'discord.js';

const row = new ActionRowBuilder()
  .addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId('channel_select')
      .setPlaceholder('Select a channel')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
  );
```

## Modals

Modals are pop-up forms that allow users to submit text input.

### Creating a Modal

```javascript
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

const modal = new ModalBuilder()
  .setCustomId('feedback_modal')
  .setTitle('Feedback Form');

const nameInput = new TextInputBuilder()
  .setCustomId('name_input')
  .setLabel('What is your name?')
  .setStyle(TextInputStyle.Short)
  .setRequired(true);

const feedbackInput = new TextInputBuilder()
  .setCustomId('feedback_input')
  .setLabel('Your feedback')
  .setStyle(TextInputStyle.Paragraph)
  .setPlaceholder('Tell us what you think!')
  .setRequired(true)
  .setMaxLength(1000);

const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
const secondActionRow = new ActionRowBuilder().addComponents(feedbackInput);

modal.addComponents(firstActionRow, secondActionRow);

await interaction.showModal(modal);
```

### Handling Modal Submissions

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'feedback_modal') {
    const name = interaction.fields.getTextInputValue('name_input');
    const feedback = interaction.fields.getTextInputValue('feedback_input');

    await interaction.reply({
      content: `Thank you for your feedback, ${name}!`,
      ephemeral: true,
    });
  }
});
```

## Context Menus

Context menus appear when right-clicking on a user or message.

### User Context Menu

```javascript
import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

const command = new ContextMenuCommandBuilder()
  .setName('Get User Info')
  .setType(ApplicationCommandType.User)
  .toJSON();
```

### Message Context Menu

```javascript
const command = new ContextMenuCommandBuilder()
  .setName('Report Message')
  .setType(ApplicationCommandType.Message)
  .toJSON();
```

### Handling Context Menu Interactions

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isContextMenuCommand()) return;

  if (interaction.commandName === 'Get User Info') {
    const user = interaction.targetUser;
    await interaction.reply({
      content: `User: ${user.tag}, ID: ${user.id}`,
      ephemeral: true,
    });
  } else if (interaction.commandName === 'Report Message') {
    const message = interaction.targetMessage;
    await interaction.reply({
      content: `Reported message from ${message.author.tag}`,
      ephemeral: true,
    });
  }
});
```

## Sending Messages

### Reply to Interaction

```javascript
// Regular reply
await interaction.reply('Hello!');

// Ephemeral reply (only visible to user)
await interaction.reply({ content: 'Secret message!', ephemeral: true });

// Reply with embed
await interaction.reply({ embeds: [embed] });

// Reply with buttons
await interaction.reply({ content: 'Click!', components: [row] });
```

### Send Message to Channel

```javascript
// Get channel by ID
const channel = client.channels.cache.get('channel_id');
await channel.send('Hello, channel!');

// From interaction
await interaction.channel.send('Message in this channel!');
```

### Edit Reply

```javascript
await interaction.reply('Original message');
await interaction.editReply('Edited message');
```

### Follow-up Messages

```javascript
await interaction.reply('First message');
await interaction.followUp('Second message');
await interaction.followUp({ content: 'Third message', ephemeral: true });
```

### Deferred Replies

For long-running operations:

```javascript
await interaction.deferReply();
// Do long operation...
await interaction.editReply('Done!');

// Or defer with ephemeral
await interaction.deferReply({ ephemeral: true });
```

## Permissions

### Check User Permissions

```javascript
if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
  await interaction.reply('You are an admin!');
}

import { PermissionFlagsBits } from 'discord.js';

if (interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
  // User can manage messages
}
```

### Command Permissions

```javascript
new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin only command')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .toJSON()
```

### Check Bot Permissions

```javascript
const botMember = interaction.guild.members.me;
if (botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
  // Bot can manage roles
}
```

## Events

### Common Events

```javascript
import { Events } from 'discord.js';

// Bot ready
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Message created
client.on(Events.MessageCreate, (message) => {
  console.log(`Message: ${message.content}`);
});

// Interaction created
client.on(Events.InteractionCreate, (interaction) => {
  console.log(`Interaction: ${interaction.type}`);
});

// Guild member added
client.on(Events.GuildMemberAdd, (member) => {
  console.log(`${member.user.tag} joined ${member.guild.name}`);
});

// Guild member removed
client.on(Events.GuildMemberRemove, (member) => {
  console.log(`${member.user.tag} left ${member.guild.name}`);
});

// Message deleted
client.on(Events.MessageDelete, (message) => {
  console.log(`Message deleted: ${message.content}`);
});

// Message updated
client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  console.log(`Message edited from "${oldMessage.content}" to "${newMessage.content}"`);
});
```

## Fetching Data

### Fetch User

```javascript
const user = await client.users.fetch('user_id');
console.log(user.tag);
```

### Fetch Member

```javascript
const member = await interaction.guild.members.fetch('user_id');
console.log(member.displayName);
```

### Fetch Channel

```javascript
const channel = await client.channels.fetch('channel_id');
await channel.send('Hello!');
```

### Fetch Guild

```javascript
const guild = await client.guilds.fetch('guild_id');
console.log(guild.name);
```

### Fetch Messages

```javascript
// Fetch last 10 messages
const messages = await channel.messages.fetch({ limit: 10 });

// Fetch specific message
const message = await channel.messages.fetch('message_id');
```

## Error Handling

### Basic Error Handling

```javascript
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      // Handle command
      await interaction.reply('Success!');
    }
  } catch (error) {
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error executing this command!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'There was an error executing this command!',
        ephemeral: true,
      });
    }
  }
});
```

### Common Errors

```javascript
// Unknown Interaction
if (interaction.isRepliable() && !interaction.replied) {
  try {
    await interaction.reply('...');
  } catch (error) {
    if (error.code === 10062) {
      console.log('Unknown interaction - likely expired');
    }
  }
}

// Missing Permissions
catch (error) {
  if (error.code === 50013) {
    console.log('Missing permissions');
  }
}

// Unknown Channel
catch (error) {
  if (error.code === 10003) {
    console.log('Unknown channel');
  }
}
```

## Command Handler Structure

Organize commands into separate files:

```javascript
// commands/ping.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function execute(interaction) {
  await interaction.reply('Pong!');
}
```

```javascript
// index.js
import { Client, Collection, GatewayIntentBits, Events } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(filePath);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    const errorMessage = {
      content: 'There was an error while executing this command!',
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
```

## Advanced Features

### Collectors

Collect button or select menu interactions:

```javascript
const filter = (i) => i.customId === 'primary' && i.user.id === interaction.user.id;
const collector = interaction.channel.createMessageComponentCollector({
  filter,
  time: 60000, // 1 minute
});

collector.on('collect', async (i) => {
  await i.update({ content: 'Button clicked!', components: [] });
});

collector.on('end', (collected) => {
  console.log(`Collected ${collected.size} interactions.`);
});
```

### Reactions

```javascript
const message = await channel.send('React to this!');
await message.react('👍');
await message.react('👎');

// Reaction collector
const filter = (reaction, user) => {
  return reaction.emoji.name === '👍' && user.id === interaction.user.id;
};

const collector = message.createReactionCollector({ filter, time: 60000 });

collector.on('collect', (reaction, user) => {
  console.log(`${user.tag} reacted with ${reaction.emoji.name}`);
});
```

### Threads

```javascript
// Create thread from message
const thread = await message.startThread({
  name: 'Thread Name',
  autoArchiveDuration: 60,
});

// Create thread in channel
const thread = await channel.threads.create({
  name: 'New Thread',
  autoArchiveDuration: 60,
  reason: 'Discussion thread',
});

// Send message to thread
await thread.send('Hello in thread!');
```

### Voice Connections

For voice support, install `@discordjs/voice`:

```bash
npm install @discordjs/voice
```

```javascript
import { joinVoiceChannel } from '@discordjs/voice';

const connection = joinVoiceChannel({
  channelId: channel.id,
  guildId: channel.guild.id,
  adapterCreator: channel.guild.voiceAdapterCreator,
});
```

## Useful Links

- Documentation: https://discord.js.org/docs/packages/discord.js/14.26.4
- Guide: https://discordjs.guide/
- Discord API Docs: https://discord.com/developers/docs
- Developer Portal: https://discord.com/developers/applications
- Community Server: https://discord.gg/djs
