---
name: sapphire-framework
description: "The Sapphire Framework SDK for building scalable Discord bots with discord.js in TypeScript"
metadata:
  languages: "typescript,javascript"
  versions: "5.x"
  updated-on: "2026-03-12"
  source: community
  revision: 1
---

# Sapphire Framework TypeScript SDK Coding Guidelines

You are a Sapphire Framework coding expert. Help me with writing code using the `@sapphire/framework` calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://www.sapphirejs.dev/docs/Guide/getting-started/getting-started-with-sapphire

## Golden Rule: Embrace the Piece Architecture

Always use the `@sapphire/framework` library to interact with the Discord API when building scalable bots. Ensure you are leveraging Sapphire's standard architecture (Pieces, Stores, Registries) rather than falling back to vanilla discord.js patterns where Sapphire provides an abstraction.

- **Library Name:** `@sapphire/framework`
- **NPM Package:** `@sapphire/framework`
- **Current Version:** ^5.0.0
- **Base Requirement:** `discord.js` v14+

**Installation:**

- **Correct:** `npm install @sapphire/framework discord.js`
- **Plugins:** `npm install @sapphire/plugin-logger @sapphire/plugin-hmr`

**APIs and Usage:**

- **Correct:** `export class UserCommand extends Command { ... }`
- **Correct:** `export class UserListener extends Listener { ... }`
- **Correct:** `export class UserPrecondition extends Precondition { ... }`
- **Incorrect:** `client.on('messageCreate', ...)` (Use a Listener Piece instead)
- **Incorrect:** Manually registering commands via `REST` (Let Sapphire's ApplicationCommandRegistry handle it)

## Initialization

The `@sapphire/framework` requires creating a `SapphireClient` instance, which extends the standard discord.js `Client`.

```typescript
import { SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import '@sapphire/plugin-logger/register'; // Optional: Registers the logger plugin

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  loadMessageCommandListeners: true, // Required for message commands
});

const main = async () => {
  try {
    client.logger.info('Logging in...');
    await client.login(process.env.DISCORD_TOKEN);
    client.logger.info('logged in');
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();
```

## Directory Structure

Sapphire automatically loads pieces (Commands, Listeners, Preconditions) based on folder structure. By default, it looks in the compiled `dist/` or `src/` directory at the root level.

```
src/
├── index.ts
├── commands/
│   ├── General/
│   │   └── ping.ts
│   └── Moderation/
│       └── ban.ts
├── listeners/
│   └── ready.ts
└── preconditions/
    └── OwnerOnly.ts
```

## Commands (The Command Piece)

In Sapphire, you create classes that extend `Command`. Sapphire handles the registration and routing.

### Application (Slash) Command

```typescript
import { Command } from '@sapphire/framework';

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'ping',
      description: 'Ping bot to see if it is alive'
    });
  }

  // Define the Application Command Structure
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  // Handle the Application Command Interaction
  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const msg = await interaction.reply({ content: 'Ping?', fetchReply: true });
    
    const content = `Pong! Bot Latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${
      msg.createdTimestamp - interaction.createdTimestamp
    }ms.`;

    return interaction.editReply({ content });
  }
}
```

### Slash Command with Options

```typescript
import { Command } from '@sapphire/framework';

export class GreetCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'greet',
      description: 'Greet a user'
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName('target')
            .setDescription('The user to greet')
            .setRequired(true)
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('target', true);
    return interaction.reply({ content: `Hello there, ${targetUser.toString()}!` });
  }
}
```

### Message Command (Classic Prefix Commands)

If `loadMessageCommandListeners` is true in the client options.

```typescript
import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class EchoCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'echo',
      aliases: ['say'],
      description: 'Echoes back your message.',
    });
  }

  public override async messageRun(message: Message, args: Command.Args) {
    const input = await args.rest('string').catch(() => null);
    
    if (!input) {
      return message.channel.send('Please provide a message to echo.');
    }

    return message.channel.send(input);
  }
}
```

## Listeners (The Listener Piece)

Instead of `client.on()`, use Listeners to respond to Discord.js and Sapphire events.

```typescript
import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';

export class ReadyListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      once: true,
      event: 'ready' // Built-in Discord.js event
    });
  }

  public override run(client: Client) {
    const { username, id } = client.user!;
    this.container.logger.info(`Successfully logged in as ${username} (${id})`);
  }
}
```

### Listening to Sapphire Specific Events

```typescript
import { Listener, Events } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class MessageCommandDeniedListener extends Listener {
  public constructor(context: Listener.LoaderContext, options: Listener.Options) {
    super(context, {
      ...options,
      event: Events.MessageCommandDenied // Sapphire specific event
    });
  }

  public override async run(error: Error, { message }: { message: Message }) {
    return message.channel.send({ content: `You cannot use this command: ${error.message}` });
  }
}
```

## Preconditions (The Precondition Piece)

Preconditions define logic that determines whether a command should be permitted to execute.

### Creating a Precondition

```typescript
// src/preconditions/OwnerOnly.ts
import { Precondition } from '@sapphire/framework';
import type { CommandInteraction, Message } from 'discord.js';

const OWNERS = ['123456789012345678']; // Replace with actual user IDs

export class OwnerOnlyPrecondition extends Precondition {
  public override messageRun(message: Message) {
    return this.checkOwner(message.author.id);
  }

  public override chatInputRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction.user.id);
  }

  public override contextMenuRun(interaction: CommandInteraction) {
    return this.checkOwner(interaction.user.id);
  }

  private checkOwner(userId: string) {
    return OWNERS.includes(userId)
      ? this.ok()
      : this.error({ message: 'Only the bot owner can use this command!' });
  }
}

// Ensure TypeScript module declaration if using TypeScript
declare module '@sapphire/framework' {
  interface Preconditions {
    OwnerOnly: never;
  }
}
```

### Applying Preconditions to Commands

```typescript
import { Command } from '@sapphire/framework';

export class AdminCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'shutdown',
      description: 'Shuts down the bot',
      preconditions: ['OwnerOnly'] // Apply the precondition here
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.reply({ content: 'Shutting down...', ephemeral: true });
    this.container.client.destroy();
    process.exit(0);
  }
}
```

## Interaction Handlers

Manage Buttons, Select Menus, and Modals easily using Interaction Handlers.

```typescript
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';

export class ButtonHandler extends InteractionHandler {
  public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    });
  }

  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith('verifyBtn')) {
      return this.some(); // Accept the interaction
    }
    return this.none(); // Ignore the interaction
  }

  public override async run(interaction: ButtonInteraction) {
    await interaction.reply({ content: 'Button clicked and handled!', ephemeral: true });
  }
}
```

## The Container

In Sapphire, `.container` is globally accessible and injected into every Piece. It holds the `client`, `logger`, and `stores`. You can inject your own shared connections (like Prisma or Redis) into it.

```typescript
import { container } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';

// Attach to container
container.db = new PrismaClient();

// Use in a piece later
import { Command } from '@sapphire/framework';

export class UserStatsCommand extends Command {
  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    // Access database from container
    const userStats = await this.container.db.user.findUnique({
       where: { id: interaction.user.id }
    });
    // ...
  }
}

// Module augmentation for TypeScript
declare module '@sapphire/pieces' {
  interface Container {
    db: PrismaClient;
  }
}
```
