import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { ContextMenuCommand } from '../../types';
import {
  SHOWCASE_CHANNEL_ID,
  CONTENT_SHOWCASE_CHANNEL_ID,
  HELP_CHANNEL_ID,
  VERCEL_HELP_CHANNEL_ID,
  DISCUSSIONS_CHANNEL_ID,
  ANNOUNCEMENT_CHANNEL_ID,
} from '../../constants';

type Option = {
  name: string;
  description?: string;
  emoji?: string;
  reply: {
    title: string;
    content: string;
  };
};

export const responses: Option[] = [
  {
    name: 'Use #help-forum to get help',
    description: 'The #help-forum channel is the best place to ask questions',
    reply: {
      title: 'Use #help-forum for questions',
      content:
        `Got a question? Head over to the <#${HELP_CHANNEL_ID}> channel. It's our go-to spot for all your questions.`
    },
  },
  {
    name: 'Discussions',
    description: "Explains why the user doesn't have access to the discussions channel",
    reply: {
      title: 'Access to Discussions Channel',
      content: `We have limited write access to <#${DISCUSSIONS_CHANNEL_ID}>. You need to be active in the <#${HELP_CHANNEL_ID}> channel to gain write access. [Learn more](https://nextjs-faq.com/on-general-being-removed).`
    }
  },
  {
    name: 'Not Enough Info',
    description: 'Replies with directions for questions with not enough information',
    reply: {
      title: 'Please add more information to your question',
      content:
        'Your question currently does not have sufficient information for people to be able to help. Please add more information to help us help you, for example: relevant code snippets, a reproduction repository, and/or more detailed error messages. See more info on how to ask a good question in https://discord.com/channels/752553802359505017/1138338531983491154 and https://discord.com/channels/752553802359505017/752553802359505020/1108132433917919292.',
    },
  },
  {
    name: 'Improve Forum Question Title',
    description: 'Tell the user to update their question title to make it more descriptive',
    reply: {
      title: 'Please improve the title of your question',
      content:
        'To ensure you get the best possible assistance, could you please change your thread title to be more descriptive? Specific titles attract the attention of users who can help and make it easier for others to find similar solutions in the future. You can change the title by going to `•••` → `Edit Post` → `Post Title`.'
    },
  },
  {
    name: 'Crossposting or Reposting',
    description: 'Keep the question in one channel and wait for a response',
    reply: {
      title:
        'Crossposting and reposting the same question across different channels is not allowed',
      content:
        'Crossposting (posting a question in a channel and send the question link to another channel) and reposting (posting the same question in several channels) are not allowed in this server. See the server rules in https://discord.com/channels/752553802359505017/752553802359505020/1108132432609284187 for more information.',
    },
  },
  {
    name: "Don't Ask to Ask",
    reply: {
      title: "Don't ask to ask, just ask!",
      content:
        'Please just ask your question directly: https://dontasktoask.com.',
    },
  },
  {
    name: 'Explain Why a Help Post is not Answered',
    description: 'Let the user know why their post is not replied, and future directions for them.',
    reply: {
      title: 'Why your post might have not had answers',
      content: [
        'People who help here are all volunteers, they are not paid so not required to attend to any forum posts. So if a post doesn’t have a response, there are four possible cases:',
        '1. People who may help have not been active yet or did not find the question. In this case you can bump the question later to make it float up the channel so those people might be able to see it. Don’t do it more than once per day.',
        '2. No one can answer, usually because the question concerns technologies that are too niche or the question is too hard. For example, many people are not able to help with questions about hosting on very niche platforms.',
        '3. The question is bad. Following the “resources for good questions” in https://discord.com/channels/752553802359505017/1138338531983491154 will help you avoid this third scenario.',
        '4. The question is too long. Keep it concise please, people who help may not have sufficient spare time and energy to read through a help request that is too long.'
      ].join("\n\n"),
    },
  },
  {
    name: 'Promotion',
    description: 'Replies with the server rules for promotion',
    reply: {
      title: 'Promotion is not allowed outside the respective channels',
      content:
        `We have a few channels that allow for self-promotion: <#${SHOWCASE_CHANNEL_ID}> exclusively for Next.js applications and <#${CONTENT_SHOWCASE_CHANNEL_ID}> for general web development-related content. Sharing promotional links such as referral links, giveaways/contests or anything that would be a plain advertisement is discouraged and may be removed.\n\nIf what you want to share doesn't fit the promotion channels, contact a moderator to know if the post is valid before posting it.`,
    },
  },
  {
    name: 'Jobs',
    description: 'Replies with directions for job posts',
    reply: {
      title: 'Job posts are not allowed in the server',
      content: "We do not allow job posts in this server, unless it's in the context of a discussion. You may check the latest official job threads announced in the <#${ANNOUNCEMENT_CHANNEL_ID}> channel.",
    },
  },
  {
    name: 'Ping',
    description: 'Explains why we discourage pinging other members',
    reply: {
      title: "Don't ping or DM other devs you aren't actively talking to",
      content:
        "Do not ping other people in order to get attention to your question unless they are actively involved in the discussion. If you're looking to get help, it is a lot better to post your question in a public channel so other people can help or learn from the questions.",
    },
  },
  {
    name: 'No Vercel-specific questions',
    description: "Use Vercel's official community forum for Vercel help",
    reply: {
      title: 'Please keep the content primarily Next.js-focused',
      content:
        `This Discord server is dedicated to all things Next.js, and is not a Vercel support server. Vercel-specific questions are best suited for the official Vercel community at https://vercel.community. See more resources at <#${VERCEL_HELP_CHANNEL_ID}>.`
    },
  }
];

// select menu generated here because it will be the same every time
const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>();
const selectMenu = new StringSelectMenuBuilder()
  .setCustomId('replyWithIssue')
  .setPlaceholder('Choose the response that will be the most help');

actionRow.addComponents(selectMenu);

for (const response of responses) {
  const option = new StringSelectMenuOptionBuilder()
    .setLabel(response.name)
    .setValue(response.name);

  if (response.description) option.setDescription(response.description);
  if (response.emoji) option.setEmoji({ name: response.emoji });

  selectMenu.addOptions(option);
}

export const command: ContextMenuCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('Reply with issue...')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const { targetMessage } = interaction;

    // mainly for type safety
    if (!interaction.isMessageContextMenuCommand()) return;

    if (targetMessage.author.bot) {
      interaction.reply({
        content: 'You cannot reply to a bot message',
        ephemeral: true,
      });
      return;
    }

    const interactionReply = await interaction.reply({
      components: [actionRow],
      ephemeral: true,
    });

    try {
      // wait for a a chosen option
      const newInteraction = await interactionReply.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 5 * 60 * 1000, // 5 minutes (more than enough time)
        filter: (i) => i.user.id === interaction.user.id,
      });

      const requestor = interaction.user;
      const requestorAsMember = interaction.inCachedGuild()
        ? interaction.member
        : null;

      const replyChosen = newInteraction.values[0];
      const response = responses.find((r) => r.name == replyChosen);

      if (!response) {
        newInteraction.reply({
          content: 'Unknown reply option',
          ephemeral: true,
        });
        return;
      }

      Promise.all([
        targetMessage.reply({
          embeds: [
            {
              title: response.reply.title,
              description: response.reply.content,
              footer: {
                text: `Requested by ${requestorAsMember?.displayName || requestor.username}`,
                icon_url:
                  requestorAsMember?.displayAvatarURL() ||
                  requestor.displayAvatarURL(),
              },
            },
          ],
        }),

        interaction.deleteReply()
      ]);
    } catch (err) {
      console.error(err);
    }
  },
};
