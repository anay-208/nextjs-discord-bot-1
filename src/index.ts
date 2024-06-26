import fs from 'node:fs';
import path from 'node:path';
import discord, { Events, GatewayIntentBits, Partials, User } from 'discord.js';
import './assert-env-vars';

import { FeatureFile } from './types';
import { isJsOrTsFile } from './utils';
import { slashCommands, contextMenuCommands } from './commands';
import { HELP_CHANNEL_ID } from './constants';

const INTRO_CHANNEL_ID = '766393115044216854';
const VERIFIED_ROLE = '930202099264938084';

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('No bot token found!');
}

const client = new discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const features: FeatureFile[] = [];
const featureFiles = fs
  .readdirSync(path.resolve(__dirname, './features'))
  // Look for files as TS (dev) or JS (built files)
  .filter(isJsOrTsFile);

for (const featureFile of featureFiles) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const feature = require(`./features/${featureFile}`) as FeatureFile;
  features.push(feature);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  features.forEach((f) => f.onStartup?.(client));
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    slashCommands
      .find((c) => c.data.name === interaction.commandName)
      ?.execute(interaction);
  }

  if (interaction.isMessageContextMenuCommand()) {
    contextMenuCommands
      .find((c) => c.data.name === interaction.commandName)
      ?.execute(interaction);
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  // if user types into the intros channel, give them the verified role
  if (message.channel.id == INTRO_CHANNEL_ID) {
    message.member?.roles
      .add(VERIFIED_ROLE)
      .catch((err) => console.log(err.message, 'Verify'));
  }

  features.forEach((f) => f.onMessage?.(client, message));
});

client.on('messageDelete', async (message) => {
  // if user deletes the original message for a thread, delete the thread
  if (message.channelId !== message.id) return
  if (!message.inGuild()) return

  // only #help-forum is counted
  if (message.channel.parentId !== HELP_CHANNEL_ID) return

  const channelMessages = await message.channel.messages.fetch({ limit: 10 });

  // only count messages that are not a bot & if no messages, delete the thread
  const humanMessages = channelMessages.filter(m => !m.author.bot);
  if (humanMessages.size === 0) {
    message.channel.delete('OP deleted initial message, so removing thread')

  } else {
    // tell the mods about this to manually clean up
    if (!process.env.MOD_LOG_CHANNEL_ID) return;
    const modLogChannel = client.channels.cache.get(process.env.MOD_LOG_CHANNEL_ID)
    if (!modLogChannel?.isTextBased()) return;

    await modLogChannel.send({
      content: `Original message in thread deleted: ${message.channel.url}`,
    })
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.log('Error while trying to fetch an user', error);
    }
  }

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.log('Error while trying to fetch a reaction message', error);
    }
  }

  if (reaction.partial) {
    try {
      const fetchedReaction = await reaction.fetch();
      features.forEach(
        (f) => f.onReactionAdd?.(client, fetchedReaction, user as User)
      );
    } catch (error) {
      console.log('Error while trying to fetch a reaction', error);
    }
  } else {
    features.forEach((f) => f.onReactionAdd?.(client, reaction, user as User));
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.partial) {
    try {
      await user.fetch();
    } catch (error) {
      console.log('Error while trying to fetch an user', error);
    }
  }

  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.log('Error while trying to fetch a reaction message', error);
    }
  }

  if (reaction.partial) {
    try {
      const fetchedReaction = await reaction.fetch();
      features.forEach(
        (f) => f.onReactionRemove?.(client, fetchedReaction, user as User)
      );
    } catch (error) {
      console.log('Error while trying to fetch a reaction', error);
    }
  } else {
    features.forEach(
      (f) => f.onReactionRemove?.(client, reaction, user as User)
    );
  }
});

client.on("threadUpdate", (oldChannel, channel) => {
  // make sure the rule threads stay pinned
  const threads = ['1138338531983491154', '1159350273056190524']

  if (!threads.includes(channel.id)) return
  if (channel.archived) channel.setArchived(false, 'Keep this thread pinned') 
  if (!channel.flags.has('Pinned')) channel.pin('Keep this thread pinned')
})

// Wake up 🤖
client.login(process.env.DISCORD_BOT_TOKEN);
