---
name: bot
description: "Discord.py SDK for building Discord bots with slash commands and gateway events in Python"
metadata:
  languages: "python"
  versions: "2.7.1"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "discord,bot,slash-commands,gateway,sdk"
---

# Discord.py Python SDK Coding Guidelines

You are a discord.py coding expert. Help me with writing code using the Discord API calling the official libraries and SDKs.

You can find the official SDK documentation and code samples here:
https://discordpy.readthedocs.io/en/stable/

## Golden Rule: Use the Correct and Current SDK

Always use the discord.py library to interact with the Discord API, which is the standard library for all Discord bot interactions in Python. Do not use legacy libraries or unofficial SDKs.

- **Library Name:** discord.py
- **PyPI Package:** `discord.py`
- **Current Version:** 2.7.1
- **Legacy Libraries:** discord.py v1.x is outdated and not recommended

**Installation:**

- **Correct:** `pip install discord.py`
- **Correct (with voice support):** `pip install discord.py[voice]`

**APIs and Usage:**

- **Correct:** `import discord`
- **Correct:** `from discord.ext import commands`
- **Correct:** `bot = commands.Bot(command_prefix='!', intents=intents)`
- **Correct:** `@bot.command()`
- **Correct:** `await interaction.response.send_message(...)`
- **Incorrect:** `discord.Client()` without intents (use `discord.Client(intents=intents)`)
- **Incorrect:** `@client.event` in cogs (use `@commands.Cog.listener()`)

## Installation

Install discord.py using pip:

```bash
pip install discord.py
```

**With Voice Support:**

```bash
pip install discord.py[voice]
```

**Environment Variables:**

Create a `.env` file with your bot token:

```env
DISCORD_TOKEN=your_bot_token_here
```

Install python-dotenv to load environment variables:

```bash
pip install python-dotenv
```

## Initialization

The `discord.py` library requires creating a bot with appropriate intents.

```python
import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)

bot.run(os.getenv('DISCORD_TOKEN'))
```

### Intents

Intents specify which events your bot will receive from Discord. You must explicitly enable intents.

**Common Intents:**

```python
intents = discord.Intents.default()
intents.message_content = True  # Privileged - enable in Developer Portal
intents.members = True           # Privileged - enable in Developer Portal
intents.presences = True         # Privileged - enable in Developer Portal
intents.guilds = True
intents.messages = True
intents.reactions = True
```

**All Intents (for development):**

```python
intents = discord.Intents.all()
```

**Minimal Intents:**

```python
intents = discord.Intents.default()
```

**Privileged Intents:**

For `message_content`, `members`, and `presences`, you must enable them in the Discord Developer Portal under your application's Bot settings.

## Basic Bot Setup

### Using Commands Extension

The recommended way to build bots:

```python
import discord
from discord.ext import commands
import os

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')

@bot.command()
async def ping(ctx):
    await ctx.send('Pong!')

bot.run(os.getenv('DISCORD_TOKEN'))
```

### Using Client Only

For simpler bots without commands:

```python
import discord
import os

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'{client.user} has logged in!')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!hello'):
        await message.channel.send('Hello!')

client.run(os.getenv('DISCORD_TOKEN'))
```

## Commands

### Basic Command

```python
@bot.command()
async def hello(ctx):
    await ctx.send(f'Hello {ctx.author.mention}!')
```

### Command with Arguments

```python
@bot.command()
async def say(ctx, *, message: str):
    await ctx.send(message)

@bot.command()
async def add(ctx, a: int, b: int):
    await ctx.send(f'{a} + {b} = {a + b}')
```

### Command with Optional Arguments

```python
@bot.command()
async def greet(ctx, name: str = None):
    if name is None:
        await ctx.send(f'Hello {ctx.author.name}!')
    else:
        await ctx.send(f'Hello {name}!')
```

### Command Aliases

```python
@bot.command(aliases=['p'])
async def ping(ctx):
    await ctx.send('Pong!')
```

### Command with Description

```python
@bot.command(
    name='info',
    description='Get bot information',
    help='Displays information about the bot'
)
async def info(ctx):
    await ctx.send('This is my Discord bot!')
```

### Converters

```python
@bot.command()
async def kick(ctx, member: discord.Member, *, reason: str = 'No reason provided'):
    await member.kick(reason=reason)
    await ctx.send(f'{member.mention} has been kicked.')

@bot.command()
async def ban(ctx, user: discord.User, *, reason: str = None):
    await ctx.guild.ban(user, reason=reason)
    await ctx.send(f'{user.mention} has been banned.')
```

## Slash Commands (Application Commands)

Slash commands provide a better user experience with autocomplete and validation.

### Basic Slash Command

```python
import discord
from discord import app_commands

intents = discord.Intents.default()
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)

@tree.command(name='ping', description='Replies with Pong!')
async def ping(interaction: discord.Interaction):
    await interaction.response.send_message('Pong!')

@client.event
async def on_ready():
    await tree.sync()
    print(f'{client.user} is ready!')

client.run(os.getenv('DISCORD_TOKEN'))
```

### Slash Command with Parameters

```python
@tree.command(name='greet', description='Greet a user')
@app_commands.describe(user='The user to greet', message='Custom greeting message')
async def greet(interaction: discord.Interaction, user: discord.Member, message: str = 'Hello'):
    await interaction.response.send_message(f'{message}, {user.mention}!')
```

### Slash Command with Choices

```python
@tree.command(name='color', description='Choose a color')
@app_commands.describe(color='Your favorite color')
@app_commands.choices(color=[
    app_commands.Choice(name='Red', value='red'),
    app_commands.Choice(name='Blue', value='blue'),
    app_commands.Choice(name='Green', value='green'),
])
async def color(interaction: discord.Interaction, color: app_commands.Choice[str]):
    await interaction.response.send_message(f'You chose {color.name}!')
```

### Autocomplete

```python
async def fruit_autocomplete(
    interaction: discord.Interaction,
    current: str,
) -> list[app_commands.Choice[str]]:
    fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry']
    return [
        app_commands.Choice(name=fruit, value=fruit)
        for fruit in fruits if current.lower() in fruit.lower()
    ]

@tree.command(name='fruit', description='Choose a fruit')
@app_commands.autocomplete(fruit=fruit_autocomplete)
async def fruit(interaction: discord.Interaction, fruit: str):
    await interaction.response.send_message(f'You chose: {fruit}')
```

### Hybrid Commands

Hybrid commands work as both slash commands and text commands:

```python
from discord.ext import commands

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.hybrid_command(name='ping', description='Check bot latency')
async def ping(ctx):
    await ctx.send(f'Pong! Latency: {round(bot.latency * 1000)}ms')

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f'{bot.user} is ready!')

bot.run(os.getenv('DISCORD_TOKEN'))
```

## Embeds

Embeds allow you to send rich, formatted messages.

### Basic Embed

```python
embed = discord.Embed(
    title='Embed Title',
    description='This is an embed description',
    color=discord.Color.blue()
)
await ctx.send(embed=embed)
```

### Advanced Embed

```python
embed = discord.Embed(
    title='Advanced Embed',
    description='This is a detailed embed',
    color=0x00ff00,
    url='https://discordpy.readthedocs.io/',
    timestamp=discord.utils.utcnow()
)

embed.set_author(
    name='Author Name',
    url='https://discordpy.readthedocs.io/',
    icon_url='https://i.imgur.com/AfFp7pu.png'
)
embed.set_thumbnail(url='https://i.imgur.com/AfFp7pu.png')
embed.set_image(url='https://i.imgur.com/AfFp7pu.png')

embed.add_field(name='Field 1', value='Value 1', inline=True)
embed.add_field(name='Field 2', value='Value 2', inline=True)
embed.add_field(name='Field 3', value='Value 3', inline=False)

embed.set_footer(text='Footer text', icon_url='https://i.imgur.com/AfFp7pu.png')

await ctx.send(embed=embed)
```

### Embed Colors

```python
# Using Color class
embed.color = discord.Color.red()
embed.color = discord.Color.blue()
embed.color = discord.Color.green()
embed.color = discord.Color.gold()

# Using hex
embed.color = 0x00ff00

# Using RGB
embed.color = discord.Color.from_rgb(255, 0, 0)
```

## Buttons

Buttons are interactive UI components.

### Basic Button

```python
import discord
from discord.ui import Button, View

class MyView(View):
    @discord.ui.button(label='Click me!', style=discord.ButtonStyle.primary)
    async def button_callback(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_message('Button clicked!', ephemeral=True)

@bot.command()
async def buttons(ctx):
    view = MyView()
    await ctx.send('Click a button:', view=view)
```

### Multiple Buttons

```python
class MyView(View):
    @discord.ui.button(label='Primary', style=discord.ButtonStyle.primary)
    async def primary(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_message('Primary clicked!', ephemeral=True)

    @discord.ui.button(label='Secondary', style=discord.ButtonStyle.secondary)
    async def secondary(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_message('Secondary clicked!', ephemeral=True)

    @discord.ui.button(label='Success', style=discord.ButtonStyle.success)
    async def success(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_message('Success clicked!', ephemeral=True)

    @discord.ui.button(label='Danger', style=discord.ButtonStyle.danger)
    async def danger(self, interaction: discord.Interaction, button: Button):
        await interaction.response.send_message('Danger clicked!', ephemeral=True)

@bot.command()
async def buttons(ctx):
    view = MyView()
    await ctx.send('Choose a button:', view=view)
```

### Link Button

```python
view = View()
button = Button(label='Visit Website', url='https://discordpy.readthedocs.io/')
view.add_item(button)

await ctx.send('Visit our docs:', view=view)
```

### Disabled Button

```python
@discord.ui.button(label='Disabled', style=discord.ButtonStyle.primary, disabled=True)
async def disabled_button(self, interaction: discord.Interaction, button: Button):
    pass
```

### Button with Emoji

```python
@discord.ui.button(label='Like', style=discord.ButtonStyle.primary, emoji='👍')
async def like_button(self, interaction: discord.Interaction, button: Button):
    await interaction.response.send_message('Thanks!', ephemeral=True)
```

## Select Menus

Select menus (dropdowns) allow users to choose from multiple options.

### String Select Menu

```python
import discord
from discord.ui import Select, View

class MyView(View):
    @discord.ui.select(
        placeholder='Choose an option...',
        options=[
            discord.SelectOption(label='Option 1', description='This is option 1', value='1'),
            discord.SelectOption(label='Option 2', description='This is option 2', value='2'),
            discord.SelectOption(label='Option 3', description='This is option 3', value='3'),
        ]
    )
    async def select_callback(self, interaction: discord.Interaction, select: Select):
        await interaction.response.send_message(f'You selected: {select.values[0]}', ephemeral=True)

@bot.command()
async def dropdown(ctx):
    view = MyView()
    await ctx.send('Choose an option:', view=view)
```

### User Select Menu

```python
class MyView(View):
    @discord.ui.select(cls=discord.ui.UserSelect, placeholder='Select a user')
    async def user_select(self, interaction: discord.Interaction, select: discord.ui.UserSelect):
        user = select.values[0]
        await interaction.response.send_message(f'You selected: {user.mention}', ephemeral=True)
```

### Role Select Menu

```python
class MyView(View):
    @discord.ui.select(cls=discord.ui.RoleSelect, placeholder='Select a role')
    async def role_select(self, interaction: discord.Interaction, select: discord.ui.RoleSelect):
        role = select.values[0]
        await interaction.response.send_message(f'You selected: {role.mention}', ephemeral=True)
```

### Channel Select Menu

```python
class MyView(View):
    @discord.ui.select(
        cls=discord.ui.ChannelSelect,
        placeholder='Select a channel',
        channel_types=[discord.ChannelType.text, discord.ChannelType.voice]
    )
    async def channel_select(self, interaction: discord.Interaction, select: discord.ui.ChannelSelect):
        channel = select.values[0]
        await interaction.response.send_message(f'You selected: {channel.mention}', ephemeral=True)
```

## Modals

Modals are pop-up forms for user input.

### Basic Modal

```python
import discord
from discord.ui import Modal, TextInput

class FeedbackModal(Modal, title='Feedback Form'):
    name = TextInput(label='Name', placeholder='Your name here...', required=True)
    feedback = TextInput(
        label='Feedback',
        style=discord.TextStyle.paragraph,
        placeholder='Tell us what you think...',
        required=True,
        max_length=1000
    )

    async def on_submit(self, interaction: discord.Interaction):
        await interaction.response.send_message(
            f'Thanks for your feedback, {self.name.value}!',
            ephemeral=True
        )

@bot.command()
async def feedback(ctx):
    await ctx.send('Click the button to give feedback!')

# To show modal from button
class FeedbackView(discord.ui.View):
    @discord.ui.button(label='Give Feedback', style=discord.ButtonStyle.primary)
    async def feedback_button(self, interaction: discord.Interaction, button: discord.ui.Button):
        await interaction.response.send_modal(FeedbackModal())

@bot.command()
async def feedback(ctx):
    view = FeedbackView()
    await ctx.send('Click to provide feedback:', view=view)
```

### Modal from Slash Command

```python
@tree.command(name='feedback', description='Provide feedback')
async def feedback_slash(interaction: discord.Interaction):
    await interaction.response.send_modal(FeedbackModal())
```

## Context Menus

Context menus appear when right-clicking on users or messages.

### User Context Menu

```python
@tree.context_menu(name='Get User Info')
async def user_info(interaction: discord.Interaction, user: discord.Member):
    await interaction.response.send_message(
        f'User: {user.name}\nID: {user.id}\nJoined: {user.joined_at}',
        ephemeral=True
    )
```

### Message Context Menu

```python
@tree.context_menu(name='Report Message')
async def report_message(interaction: discord.Interaction, message: discord.Message):
    await interaction.response.send_message(
        f'Reported message from {message.author.mention}',
        ephemeral=True
    )
```

## Events

### Common Events

```python
@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')
    print(f'Bot ID: {bot.user.id}')

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return

    if 'hello' in message.content.lower():
        await message.channel.send('Hello!')

    # Important: process commands after custom on_message logic
    await bot.process_commands(message)

@bot.event
async def on_member_join(member):
    channel = member.guild.system_channel
    if channel is not None:
        await channel.send(f'Welcome {member.mention}!')

@bot.event
async def on_member_remove(member):
    channel = member.guild.system_channel
    if channel is not None:
        await channel.send(f'{member.name} has left the server.')

@bot.event
async def on_message_delete(message):
    print(f'Message deleted: {message.content}')

@bot.event
async def on_message_edit(before, after):
    print(f'Message edited from "{before.content}" to "{after.content}"')

@bot.event
async def on_reaction_add(reaction, user):
    print(f'{user.name} added {reaction.emoji}')

@bot.event
async def on_guild_join(guild):
    print(f'Joined guild: {guild.name}')

@bot.event
async def on_error(event, *args, **kwargs):
    print(f'Error in {event}')
```

## Cogs

Cogs organize commands and listeners into modular classes.

### Basic Cog

```python
from discord.ext import commands

class MyCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def hello(self, ctx):
        await ctx.send('Hello from cog!')

    @commands.Cog.listener()
    async def on_message(self, message):
        if message.author == self.bot.user:
            return
        print(f'Message from {message.author}: {message.content}')

async def setup(bot):
    await bot.add_cog(MyCog(bot))
```

### Loading Cogs

```python
import asyncio

async def load_extensions():
    for filename in os.listdir('./cogs'):
        if filename.endswith('.py'):
            await bot.load_extension(f'cogs.{filename[:-3]}')

async def main():
    async with bot:
        await load_extensions()
        await bot.start(os.getenv('DISCORD_TOKEN'))

asyncio.run(main())
```

### Cog with Slash Commands

```python
from discord import app_commands

class SlashCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @app_commands.command(name='ping', description='Ping command')
    async def ping(self, interaction: discord.Interaction):
        await interaction.response.send_message('Pong!')

    @commands.Cog.listener()
    async def on_ready(self):
        print(f'{self.__class__.__name__} cog is ready!')

async def setup(bot):
    await bot.add_cog(SlashCog(bot))
```

## Permissions

### Check User Permissions

```python
@bot.command()
@commands.has_permissions(administrator=True)
async def admin(ctx):
    await ctx.send('You are an admin!')

@bot.command()
@commands.has_permissions(manage_messages=True)
async def purge(ctx, amount: int):
    await ctx.channel.purge(limit=amount + 1)
    await ctx.send(f'Deleted {amount} messages.', delete_after=5)
```

### Check Bot Permissions

```python
@bot.command()
@commands.bot_has_permissions(manage_roles=True)
async def mute(ctx, member: discord.Member):
    # Bot can manage roles
    await ctx.send(f'{member.mention} has been muted.')
```

### Custom Permission Checks

```python
def is_owner():
    async def predicate(ctx):
        return ctx.author.id == 123456789  # Your user ID
    return commands.check(predicate)

@bot.command()
@is_owner()
async def secret(ctx):
    await ctx.send('Secret command for owner only!')
```

### Slash Command Permissions

```python
@tree.command(name='admin', description='Admin only command')
@app_commands.default_permissions(administrator=True)
async def admin_slash(interaction: discord.Interaction):
    await interaction.response.send_message('Admin command!', ephemeral=True)
```

## Error Handling

### Command Error Handling

```python
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        await ctx.send('Missing required argument!')
    elif isinstance(error, commands.MissingPermissions):
        await ctx.send("You don't have permission to use this command!")
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("I don't have permission to do that!")
    elif isinstance(error, commands.CommandNotFound):
        pass  # Ignore command not found
    else:
        print(f'Error: {error}')
```

### Local Error Handler

```python
@bot.command()
async def divide(ctx, a: int, b: int):
    result = a / b
    await ctx.send(f'{a} / {b} = {result}')

@divide.error
async def divide_error(ctx, error):
    if isinstance(error, commands.BadArgument):
        await ctx.send('Please provide valid numbers!')
    elif isinstance(error, ZeroDivisionError):
        await ctx.send("Cannot divide by zero!")
```

### Interaction Error Handling

```python
@tree.error
async def on_app_command_error(interaction: discord.Interaction, error: app_commands.AppCommandError):
    if isinstance(error, app_commands.CommandOnCooldown):
        await interaction.response.send_message(
            f'Command is on cooldown. Try again in {error.retry_after:.2f}s',
            ephemeral=True
        )
    elif isinstance(error, app_commands.MissingPermissions):
        await interaction.response.send_message(
            "You don't have permission to use this command!",
            ephemeral=True
        )
    else:
        await interaction.response.send_message('An error occurred!', ephemeral=True)
```

## Cooldowns

### Command Cooldown

```python
from discord.ext import commands

@bot.command()
@commands.cooldown(1, 60, commands.BucketType.user)  # 1 use per 60 seconds per user
async def daily(ctx):
    await ctx.send('You claimed your daily reward!')

@daily.error
async def daily_error(ctx, error):
    if isinstance(error, commands.CommandOnCooldown):
        await ctx.send(f'Try again in {error.retry_after:.2f} seconds.')
```

### Slash Command Cooldown

```python
@tree.command(name='daily', description='Claim daily reward')
@app_commands.checks.cooldown(1, 60, key=lambda i: i.user.id)
async def daily_slash(interaction: discord.Interaction):
    await interaction.response.send_message('Daily reward claimed!', ephemeral=True)
```

## Fetching Data

### Fetch User

```python
user = await bot.fetch_user(123456789)
print(user.name)
```

### Fetch Member

```python
member = await ctx.guild.fetch_member(123456789)
print(member.display_name)
```

### Fetch Channel

```python
channel = await bot.fetch_channel(123456789)
await channel.send('Hello!')
```

### Fetch Guild

```python
guild = await bot.fetch_guild(123456789)
print(guild.name)
```

### Fetch Messages

```python
# Fetch last 10 messages
messages = [message async for message in channel.history(limit=10)]

# Fetch specific message
message = await channel.fetch_message(123456789)
```

## Sending Messages

### Basic Send

```python
await ctx.send('Hello!')
await channel.send('Hello!')
```

### Send with Embed

```python
embed = discord.Embed(title='Title', description='Description')
await ctx.send(embed=embed)
```

### Send with Components

```python
view = MyView()
await ctx.send('Click a button:', view=view)
```

### Send Ephemeral (Slash Commands)

```python
await interaction.response.send_message('Secret message!', ephemeral=True)
```

### Send File

```python
file = discord.File('path/to/file.png')
await ctx.send(file=file)

# With embed
embed = discord.Embed(title='Image')
embed.set_image(url='attachment://file.png')
await ctx.send(embed=embed, file=file)
```

### Edit Message

```python
message = await ctx.send('Original message')
await message.edit(content='Edited message')
```

### Delete Message

```python
message = await ctx.send('This will be deleted')
await message.delete()

# Delete after delay
await ctx.send('Deleted in 5s', delete_after=5)
```

## Reactions

### Add Reaction

```python
message = await ctx.send('React to this!')
await message.add_reaction('👍')
await message.add_reaction('👎')
```

### Remove Reaction

```python
await message.remove_reaction('👍', ctx.author)
```

### Clear Reactions

```python
await message.clear_reactions()
```

### Wait for Reaction

```python
message = await ctx.send('React with 👍')
await message.add_reaction('👍')

def check(reaction, user):
    return user == ctx.author and str(reaction.emoji) == '👍'

try:
    reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
    await ctx.send('Thanks for reacting!')
except asyncio.TimeoutError:
    await ctx.send('You took too long!')
```

## Tasks and Loops

### Basic Loop

```python
from discord.ext import tasks

@tasks.loop(seconds=60)
async def my_task():
    channel = bot.get_channel(123456789)
    await channel.send('This runs every minute!')

@my_task.before_loop
async def before_my_task():
    await bot.wait_until_ready()

my_task.start()
```

### Loop with Time

```python
import datetime

@tasks.loop(time=datetime.time(hour=12, minute=0))
async def daily_task():
    channel = bot.get_channel(123456789)
    await channel.send('Daily message at noon!')

daily_task.start()
```

### Cancel Loop

```python
my_task.stop()
```

## Voice

### Join Voice Channel

```python
@bot.command()
async def join(ctx):
    if ctx.author.voice:
        channel = ctx.author.voice.channel
        await channel.connect()
    else:
        await ctx.send('You are not in a voice channel!')
```

### Leave Voice Channel

```python
@bot.command()
async def leave(ctx):
    if ctx.voice_client:
        await ctx.voice_client.disconnect()
    else:
        await ctx.send('I am not in a voice channel!')
```

### Play Audio

```python
import discord
from discord import FFmpegPCMAudio

@bot.command()
async def play(ctx):
    if ctx.voice_client:
        source = FFmpegPCMAudio('audio.mp3')
        ctx.voice_client.play(source)
    else:
        await ctx.send('Bot is not in a voice channel!')
```

## Advanced Features

### Paginator

```python
from discord.ext import menus

class MySource(menus.ListPageSource):
    def __init__(self, data):
        super().__init__(data, per_page=10)

    async def format_page(self, menu, entries):
        offset = menu.current_page * self.per_page
        return '\n'.join(f'{i}. {v}' for i, v in enumerate(entries, start=offset))

@bot.command()
async def pages(ctx):
    data = [f'Item {i}' for i in range(1, 100)]
    pages = menus.MenuPages(source=MySource(data))
    await pages.start(ctx)
```

### Wait For Message

```python
@bot.command()
async def ask(ctx):
    await ctx.send('What is your name?')

    def check(m):
        return m.author == ctx.author and m.channel == ctx.channel

    try:
        msg = await bot.wait_for('message', check=check, timeout=30.0)
        await ctx.send(f'Hello {msg.content}!')
    except asyncio.TimeoutError:
        await ctx.send('You took too long!')
```

### Webhooks

```python
# Create webhook
webhook = await channel.create_webhook(name='My Webhook')

# Send via webhook
await webhook.send('Message from webhook!', username='Custom Name')

# Get webhooks
webhooks = await channel.webhooks()
for webhook in webhooks:
    print(webhook.name)
```

## Useful Links

- Documentation: https://discordpy.readthedocs.io/en/stable/
- API Reference: https://discordpy.readthedocs.io/en/stable/api.html
- Discord API Docs: https://discord.com/developers/docs
- Developer Portal: https://discord.com/developers/applications
- GitHub: https://github.com/Rapptz/discord.py
