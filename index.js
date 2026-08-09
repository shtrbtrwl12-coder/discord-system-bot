const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  AuditLogEvent 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildModeration
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User, Partials.GuildBan]
});

const roleIds = [
  "1535430257316864152", // 0
  "1535430309326233772", // 1
  "1535430574737592390", // 2
  "1535430705880764487", // 3
  "1535430858633388092", // 4
  "1535431081640206346", // 5
  "1535431352881651872", // 6
  "1535431435001925723", // 7
  "1535431536122265640", // 8
  "1535431730394177616", // 9
  "1535431845464903761", // 10
  "1535431957251367002", // 11
  "1535432094635921510"  // 1010
];

const picLiveRoles = {
  'role_pic': '1535409758197260459',
  'role_live': '1535409840430645308'
};

const userMessageLogs = new Map();
const savedRolesMap = new Map();

const MUTED_ROLE_ID = '1535504124622143508'; 
const JAIL_ROLE_ID = '1535376614735609977';  
const TIME_ROLE_ID = '1535522564061929512';  
const CLEAR_ROLE_ID = '1535523717650583602'; 
const LOCK_ROLE_ID = '1535523952498057338';  
const NO_ROLE_ID = '1535403948121395300';   
const PROTECTED_ROLE_ID = '1535375782736560128'; 
const ALLOWED_NO_ROLE_IDS = ['1535845072690741360', '1535375782736560128'];
const OS_MIN_ROLE_ID = '1535724113690099843'; 
const TARGET_GUILD_ID = '1535375474656673874';
const HERE_ROLE_ID = '1535822047907811398';

const COLOR_CHANNEL_ID = '1535406298781192292'; 
const PIC_LIVE_CHANNEL_ID = '1535490093358252074'; 
const IMAGE_ONLY_CHANNEL_ID = '1535490327610400810'; 
const TELLONYM_CHANNEL_ID = '1535490429724921986'; 
const IMAGE_CHANNEL_ID = '1535375475289890879'; 
const NEW_IMAGE_CHANNEL_ID = '1535489711420735549'; 

const REMOVE_ROLE_CHANNEL_ID = '1535821718751289354';
const ADDED_ROLE_CHANNEL_ID = '1535822130342658118';

function hasNoRolePermission(member) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  return ALLOWED_NO_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
}

async function stripAndSaveRoles(member) {
  try {
    const rolesToSave = member.roles.cache
      .filter(r => r.id !== NO_ROLE_ID && r.id !== member.guild.id)
      .map(r => r.id);
    
    savedRolesMap.set(member.id, rolesToSave);

    const rolesToRemove = member.roles.cache.filter(r => r.id !== NO_ROLE_ID && r.id !== member.guild.id);
    await member.roles.remove(rolesToRemove);
  } catch (e) { console.error("Error stripping roles:", e); }
}

async function restoreRoles(member) {
  try {
    const savedRoles = savedRolesMap.get(member.id);
    if (savedRoles && savedRoles.length > 0) {
      await member.roles.add(savedRoles).catch(() => {});
      savedRolesMap.delete(member.id);
    }
  } catch (e) { console.error("Error restoring roles:", e); }
}

async function sendLogCustom(guild, content, files = []) {
  try {
    const logChannels = guild.channels.cache.filter(c => c.name && (c.name.toLowerCase().includes('log') || c.name.toLowerCase().includes('لق')));
    for (const channel of logChannels.values()) {
      if (channel.isTextBased()) {
        await channel.send({ content: content, files: files }).catch(() => {});
      }
    }
  } catch (e) {}
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const imageTargetChannel = await client.channels.fetch(IMAGE_CHANNEL_ID).catch(() => null);
  if (imageTargetChannel) {
    const fetchedImgMsgs = await imageTargetChannel.messages.fetch({ limit: 5 }).catch(() => null);
    const imgAlreadySent = fetchedImgMsgs ? fetchedImgMsgs.some(m => m.author.id === client.user.id) : false;
    if (!imgAlreadySent) {
      const embed = new EmbedBuilder().setImage('https://cdn.discordapp.com/attachments/1535193306701504532/1535533823956221952/image.png').setColor('#2b2d31');
      await imageTargetChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  const newImageTargetChannel = await client.channels.fetch(NEW_IMAGE_CHANNEL_ID).catch(() => null);
  if (newImageTargetChannel) {
    const fetchedNewImgMsgs = await newImageTargetChannel.messages.fetch({ limit: 5 }).catch(() => null);
    const newImgAlreadySent = fetchedNewImgMsgs ? fetchedNewImgMsgs.some(m => m.author.id === client.user.id) : false;
    if (!newImgAlreadySent) {
      const newEmbed = new EmbedBuilder().setImage('https://cdn.discordapp.com/attachments/1535193306701504532/1535537278636658710/photo-output.png?ex=6a782008&is=6a76ce88&hm=db78e86a90466f1f944c293002cc0afbc5428647bcb23121cd0549509c32f72e&').setColor('#2b2d31');
      await newImageTargetChannel.send({ embeds: [newEmbed] }).catch(() => {});
    }
  }

  const picChannel = await client.channels.fetch(PIC_LIVE_CHANNEL_ID).catch(() => null);
  if (picChannel) {
    const fetchedPicMsgs = await picChannel.messages.fetch({ limit: 10 }).catch(() => null);
    const alreadySent = fetchedPicMsgs ? fetchedPicMsgs.some(m => m.author.id === client.user.id) : false;
    
    if (!alreadySent) {
      const rowPicLive = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('role_live').setLabel('live').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('role_pic').setLabel('pic').setStyle(ButtonStyle.Secondary)
      );
      const imageUrl = 'https://cdn.discordapp.com/attachments/1535193306701504532/1535496031603662848/B0D8C494-4238-4411-9D59-979A17AEBD16.png';
      const imageEmbed = new EmbedBuilder().setImage(imageUrl).setColor('#2b2d31');
      await picChannel.send({ 
        content: 'لـ رول الصور و اللايف', 
        embeds: [imageEmbed], 
        components: [rowPicLive] 
      });
    }
  }

  const colorChannel = await client.channels.fetch(COLOR_CHANNEL_ID).catch(() => null);
  if (colorChannel) {
    setInterval(async () => {
      try {
        const fetchedMessages = await colorChannel.messages.fetch({ limit: 100 });
        for (const msg of fetchedMessages.values()) {
          try { await msg.delete(); } catch (err) {}
        }
        const colorImageUrl = 'https://cdn.discordapp.com/attachments/1535193306701504532/1535489425520459828/05994202-493A-4B2D-9FD9-F2D39872FC84.png';
        const colorEmbed = new EmbedBuilder().setImage(colorImageUrl).setColor('#2b2d31');

        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('role_0').setLabel('0').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_1').setLabel('1').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_2').setLabel('2').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_3').setLabel('3').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_4').setLabel('4').setStyle(ButtonStyle.Secondary)
        );
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('role_5').setLabel('5').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_6').setLabel('6').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_7').setLabel('7').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_8').setLabel('8').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_9').setLabel('9').setStyle(ButtonStyle.Secondary)
        );
        const row3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('role_10').setLabel('10').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_11').setLabel('11').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('role_1010').setLabel('1010').setStyle(ButtonStyle.Secondary)
        );
        await colorChannel.send({ embeds: [colorEmbed], components: [row1, row2, row3] });
      } catch (err) {}
    }, 15000);
  }
});

function parseDuration(argsText) {
  if (!argsText) return 7 * 24 * 60 * 60 * 1000;
  const cleaned = argsText.replace(/\s+/g, '').toLowerCase();
  const match = cleaned.match(/^(\d+)([smhdwy]|day|week|month)?$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (!unit || unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'd' || unit === 'day') return value * 24 * 60 * 60 * 1000;
  if (unit === 'w' || unit === 'week') return value * 7 * 24 * 60 * 60 * 1000;
  if (unit === 'y') return value * 365 * 24 * 60 * 60 * 1000;

  return 7 * 24 * 60 * 60 * 1000;
}

async function getTargetMember(message) {
  let targetMember = message.mentions.members.first();
  if (!targetMember && message.reference) {
    try {
      const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
      if (repliedMessage) {
        targetMember = await message.guild.members.fetch(repliedMessage.author.id);
      }
    } catch (e) {}
  }
  return targetMember;
}

function hasRoleOrHigher(member, roleId) {
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  const targetRole = member.guild.roles.cache.get(roleId);
  if (!targetRole) return false;
  const memberHighest = member.roles.highest;
  return memberHighest.position >= targetRole.position;
}

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (!oldMember.roles.cache.has(NO_ROLE_ID) && newMember.roles.cache.has(NO_ROLE_ID)) {
    if (newMember.roles.cache.has(PROTECTED_ROLE_ID)) {
      await newMember.roles.remove(NO_ROLE_ID).catch(() => {});
      return;
    }
    await stripAndSaveRoles(newMember);
  } else if (oldMember.roles.cache.has(NO_ROLE_ID) && !newMember.roles.cache.has(NO_ROLE_ID)) {
    await restoreRoles(newMember);
  }
});

client.on('messageDelete', async message => {
  if (message.partial || !message.guild) return;
  
  let attachmentsArr = [];
  if (message.attachments && message.attachments.size > 0) {
    attachmentsArr = Array.from(message.attachments.values()).map(att => att.url);
  }

  let logText = `لُق باك\nتم حذف رسالة بواسطة: <@${message.author ? message.author.id : 'unknown'}>\nفي الروم: <#${message.channel.id}>\nالمحتوى: ${message.content || 'فارغ'}`;
  await sendLogCustom(message.guild, logText, attachmentsArr);
});

client.on('guildMemberRemove', async member => {
  try {
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });
    const kickLog = fetchedLogs.entries.first();
    if (kickLog && kickLog.target && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp < 5000)) {
      const executor = kickLog.executor;
      await sendLogCustom(member.guild, `كيك كيك هذا تاكله يا حلو\nتم طرد العضو: <@${member.id}>\nبواسطة: <@${executor ? executor.id : 'unknown'}>`);
    }
  } catch (e) {}
});

client.on('guildBanAdd', async ban => {
  try {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });
    const banLog = fetchedLogs.entries.first();
    let executorTag = 'مجهول';
    if (banLog && banLog.target && banLog.target.id === ban.user.id && (Date.now() - banLog.createdTimestamp < 5000)) {
      executorTag = `<@${banLog.executor.id}>`;
    }
    await sendLogCustom(ban.guild, `لُق باند\nتم إعطاء باند للعضو: <@${ban.user.id}>\nبواسطة: ${executorTag}`);
  } catch (e) {}
});

client.on('guildBanRemove', async ban => {
  try {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanRemove,
    });
    const unbanLog = fetchedLogs.entries.first();
    let executorTag = 'مجهول';
    if (unbanLog && unbanLog.target && unbanLog.target.id === ban.user.id && (Date.now() - unbanLog.createdTimestamp < 5000)) {
      executorTag = `<@${unbanLog.executor.id}>`;
    }
    await sendLogCustom(ban.guild, `سحب الباند / فك الباند\nتم فك الباند عن العضو: <@${ban.user.id}>\nبواسطة: ${executorTag}`);
  } catch (e) {}
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  
  if (!userMessageLogs.has(userId)) {
    userMessageLogs.set(userId, []);
  }
  
  const timestamps = userMessageLogs.get(userId);
  const windowMs = 5000; 
  const recentMessages = timestamps.filter(timestamp => now - timestamp < windowMs);
  
  recentMessages.push(now);
  userMessageLogs.set(userId, recentMessages);

  if (recentMessages.length >= 5) {
    userMessageLogs.set(userId, []);
    await message.reply("انت تكتب بسرعه !").catch(() => {});
    return;
  }

  if (message.member && message.member.roles.cache.has(NO_ROLE_ID)) {
    const contentLowerCheck = message.content.toLowerCase().trim();
    const argsCheck = message.content.trim().split(/ +/);
    const commandCheck = argsCheck[0];
    if (
      contentLowerCheck.startsWith('هير') || 
      contentLowerCheck === 'setup' || 
      contentLowerCheck.startsWith('delete no role') || 
      contentLowerCheck.startsWith('no role') || 
      contentLowerCheck === 'فحص النو رول' || 
      contentLowerCheck.startsWith('سحب رول') || 
      contentLowerCheck.startsWith('رول') || 
      contentLowerCheck === 'امسح لي' || 
      contentLowerCheck.startsWith('delete role') || 
      contentLowerCheck.startsWith('crator role') || 
      ['باند', 'طياره', 'فك', 'برا', 'سجن', 'لاسجن', 'اص', 'تكلم', 'تايم', 'لاتايم', 'مسح', 'قفل', 'فتح', 'فحص'].includes(commandCheck)
    ) {
      await message.react('❌').catch(() => {});
      return;
    }
  }

  const contentLower = message.content.toLowerCase().trim();

  if (contentLower.startsWith('هير')) {
    try {
      const targetMember = await getTargetMember(message);
      if (targetMember) {
        if (!targetMember.roles.cache.has(HERE_ROLE_ID)) {
          await targetMember.roles.add(HERE_ROLE_ID);
          await message.react('✅').catch(() => {});
        } else {
          await message.react('❌').catch(() => {});
        }
        return;
      }
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
  }

  if (!message.content) {
    if (message.channel.id === IMAGE_ONLY_CHANNEL_ID || message.channel.id === '1535490327610400810') {
      if (message.attachments.size > 0 || message.embeds.length > 0) {
        await message.react('R_').catch(async () => {
          const emoji = message.guild.emojis.cache.find(e => e.name === 'R_');
          if (emoji) await message.react(emoji).catch(() => {});
        });
      }
    }
    return;
  }

  if (message.channel.id === IMAGE_ONLY_CHANNEL_ID) {
    const hasImage = message.attachments.size > 0 || message.embeds.length > 0 || /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/i.test(message.content);
    if (hasImage) {
      await message.react('R_').catch(async () => {
        const emoji = message.guild.emojis.cache.find(e => e.name === 'R_');
        if (emoji) await message.react(emoji).catch(() => {});
      });
    } else {
      await message.delete().catch(() => {});
    }
    return;
  }

  if (message.channel.id === '1535490327610400810') {
    const hasImage = message.attachments.size > 0 || message.embeds.length > 0 || /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/i.test(message.content);
    if (hasImage) {
      await message.react('R_').catch(async () => {
        const emoji = message.guild.emojis.cache.find(e => e.name === 'R_');
        if (emoji) await message.react(emoji).catch(() => {});
      });
    }
  }

  if (message.channel.id === TELLONYM_CHANNEL_ID) {
    const isTellonym = /tellonym\.me/i.test(message.content);
    if (!isTellonym) {
      await message.delete().catch(() => {});
    }
    return;
  }

  if (contentLower === 'setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return;
    }
    try {
      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('perm_BanMembers').setLabel('باند').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('perm_KickMembers').setLabel('طرد').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('perm_ModerateMembers').setLabel('تايم').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('perm_ManageMessages').setLabel('حذف رسائل').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('perm_MuteMembers').setLabel('إسكات').setStyle(ButtonStyle.Secondary)
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('perm_ManageChannels').setLabel('إدارة الرومات').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('perm_ManageRoles').setLabel('إدارة الرولات').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('perm_Administrator').setLabel('إداري كامل').setStyle(ButtonStyle.Danger)
      );

      await message.reply({ content: 'اختر الصلاحية التي تريد ربطها برول:', components: [row1, row2] });
      await message.react('✅').catch(() => {});
    } catch (e) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('delete no role')) {
    if (!hasNoRolePermission(message.member)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      let targetMember = await getTargetMember(message);
      if (!targetMember && hasNoRolePermission(message.member)) {
        targetMember = message.member;
      }
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      if (targetMember.roles.cache.has(NO_ROLE_ID)) {
        await targetMember.roles.remove(NO_ROLE_ID);
        await message.react('✅').catch(() => {});
      } else {
        await message.react('❌').catch(() => {});
      }
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('no role')) {
    if (!hasNoRolePermission(message.member)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const targetMembers = Array.from(message.mentions.members.values());
      if (targetMembers.length === 0) {
        await message.react('❌').catch(() => {});
        return;
      }

      if (targetMembers.some(m => m.roles.cache.has(PROTECTED_ROLE_ID))) {
        await message.react('❌').catch(() => {});
        return;
      }

      const targetIds = targetMembers.map(m => m.id).join(',');
      const mentionsText = targetMembers.map(m => `<@${m.id}>`).join(', ');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`norole_1d_${message.author.id}_${targetIds}`).setLabel('1day').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`norole_2d_${message.author.id}_${targetIds}`).setLabel('2day').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`norole_3d_${message.author.id}_${targetIds}`).setLabel('3day').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`norole_inf_${message.author.id}_${targetIds}`).setLabel('∞').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`norole_num_${message.author.id}_${targetIds}`).setLabel('عدد (ساعات)').setStyle(ButtonStyle.Primary)
      );

      await message.reply({ 
        content: `Are you sure of this procedure?\nAnd how long for ${mentionsText}?`, 
        components: [row] 
      });
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower === 'فحص النو رول') {
    if (!hasNoRolePermission(message.member)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      await message.guild.members.fetch();
      const membersWithNoRole = message.guild.members.cache.filter(m => !m.user.bot && m.roles.cache.has(NO_ROLE_ID));
      
      if (membersWithNoRole.size === 0) {
        await message.reply("don’t have no role");
        await message.react('❌').catch(() => {});
        return;
      }

      const sortedMembers = Array.from(membersWithNoRole.values()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);

      let responseText = "";
      sortedMembers.forEach((m, index) => {
        responseText += `${index + 1}- <@${m.id}>\n`;
      });

      await message.reply(responseText);
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('سحب رول')) {
    if (message.channel.id === ADDED_ROLE_CHANNEL_ID) {
      const warnMsg = await message.reply(`هذا الروم مخصص لإضافة الرولات فقط! يرجى استخدام <#${REMOVE_ROLE_CHANNEL_ID}>`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 3000);
      await message.delete().catch(() => {});
      return;
    }

    const argsWithoutCmd = message.content.slice(7).trim();
    let targetMember = message.mentions.members.first();
    
    if (!targetMember && message.reference) {
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        targetMember = await message.guild.members.fetch(replied.author.id);
      } catch (e) {}
    }

    let roleQuery = argsWithoutCmd.replace(/<@!?\d+>/g, '').trim();

    if (targetMember && roleQuery) {
      try {
        const foundRole = message.guild.roles.cache.find(r => r.name.toLowerCase().startsWith(roleQuery.toLowerCase()) || r.name.toLowerCase().includes(roleQuery.toLowerCase()));
        if (!foundRole) {
          await message.react('❌').catch(() => {});
          return;
        }
        if (targetMember.roles.cache.has(foundRole.id)) {
          await targetMember.roles.remove(foundRole);
          await message.react('✅').catch(() => {});
        } else {
          await message.react('❌').catch(() => {});
        }
      } catch (e) {
        await message.react('❌').catch(() => {});
      }
    } else {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('رول')) {
    if (message.channel.id === REMOVE_ROLE_CHANNEL_ID) {
      const warnMsg = await message.reply(`هذا الروم مخصص لسحب الرولات فقط! يرجى استخدام <#${ADDED_ROLE_CHANNEL_ID}>`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 3000);
      await message.delete().catch(() => {});
      return;
    }

    const argsWithoutCmd = message.content.slice(3).trim();
    let targetMember = message.mentions.members.first();
    
    if (!targetMember && message.reference) {
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        targetMember = await message.guild.members.fetch(replied.author.id);
      } catch (e) {}
    }

    let roleQuery = argsWithoutCmd.replace(/<@!?\d+>/g, '').trim();

    if (targetMember && roleQuery) {
      try {
        if (targetMember.roles.cache.has(NO_ROLE_ID)) {
          await message.react('❌').catch(() => {});
          return;
        }

        const foundRole = message.guild.roles.cache.find(r => r.name.toLowerCase().startsWith(roleQuery.toLowerCase()) || r.name.toLowerCase().includes(roleQuery.toLowerCase()));
        if (!foundRole) {
          await message.react('❌').catch(() => {});
          return;
        }
        await targetMember.roles.add(foundRole);
        await message.react('✅').catch(() => {});
      } catch (e) {
        await message.react('❌').catch(() => {});
      }
    } else {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower === 'امسح لي') {
    try {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`del_all_${message.author.id}`).setLabel('الكل').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`del_num_${message.author.id}`).setLabel('عدد').setStyle(ButtonStyle.Secondary)
      );
      await message.reply({ content: 'اختر طريقة حذف رسائلك في هذا الروم:', components: [row] });
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('delete role')) {
    const roleNameArgs = message.content.slice(11).trim();
    if (!roleNameArgs) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const roleToDelete = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleNameArgs.toLowerCase());
      if (!roleToDelete) {
        await message.react('❌').catch(() => {});
        return;
      }
      await roleToDelete.delete('Deleted by delete role command');
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (contentLower.startsWith('crator role')) {
    const args = message.content.split(' ');
    const roleName = args.slice(2).join(' ');
    
    let targetMember = message.mentions.members.first();
    if (!targetMember && message.reference) {
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        targetMember = await message.guild.members.fetch(replied.author.id);
      } catch (e) {}
    }

    if (targetMember && roleName) {
      try {
        if (targetMember.roles.cache.has(NO_ROLE_ID)) {
          await message.react('❌').catch(() => {});
          return;
        }
        const newRole = await message.guild.roles.create({
          name: roleName,
          reason: 'Created by Crator role command'
        });
        await targetMember.roles.add(newRole);
        await message.react('✅').catch(() => {});
      } catch (e) {
        await message.react('❌').catch(() => {});
      }
    } else {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  const args = message.content.trim().split(/ +/);
  const command = args[0];

  if (command === 'باند' || command === 'طياره') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      await targetMember.ban({ reason: 'بواسطة الأوامر الإدارية' });
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'فك') {
    if (args[1] === 'باند') {
      try {
        const userId = args[2] ? args[2].replace(/[<@!>]/g, '') : null;
        if (!userId) {
          await message.react('❌').catch(() => {});
          return;
        }
        await message.guild.members.unban(userId);
        await message.react('✅').catch(() => {});
      } catch (err) {
        await message.react('❌').catch(() => {});
      }
      return;
    }
  }

  if (command === 'برا') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      await targetMember.kick('طرد بواسطة الأوامر');
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'سجن') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember || targetMember.roles.cache.has(NO_ROLE_ID)) {
        await message.react('❌').catch(() => {});
        return;
      }
      await targetMember.roles.add(JAIL_ROLE_ID);
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'لاسجن') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      if (targetMember.roles.cache.has(JAIL_ROLE_ID)) {
        await targetMember.roles.remove(JAIL_ROLE_ID);
      }
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'اص') {
    if (!hasRoleOrHigher(message.member, OS_MIN_ROLE_ID)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember || targetMember.roles.cache.has(NO_ROLE_ID)) {
        await message.react('❌').catch(() => {});
        return;
      }
      let contentWithoutCommand = message.content.replace('اص', '').replace(/<@!?\d+>/g, '').trim();
      const durationMs = parseDuration(contentWithoutCommand) || (24 * 60 * 60 * 1000);

      await targetMember.roles.add(MUTED_ROLE_ID);
      await message.react('✅').catch(() => {});

      setTimeout(async () => {
        try {
          if (targetMember.roles.cache.has(MUTED_ROLE_ID)) {
            await targetMember.roles.remove(MUTED_ROLE_ID);
          }
        } catch (e) {}
      }, durationMs);
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'تكلم') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      if (targetMember.roles.cache.has(MUTED_ROLE_ID)) {
        await targetMember.roles.remove(MUTED_ROLE_ID);
      }
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'تايم') {
    if (!message.member.roles.cache.has(TIME_ROLE_ID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember || targetMember.roles.cache.has(NO_ROLE_ID)) {
        await message.react('❌').catch(() => {});
        return;
      }
      let contentWithoutCommand = message.content.replace('تايم', '').replace(/<@!?\d+>/g, '').trim();
      const durationMs = parseDuration(contentWithoutCommand);

      await targetMember.timeout(durationMs, 'تايم إداري');
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'لاتايم') {
    if (!message.member.roles.cache.has(TIME_ROLE_ID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
        await message.react('❌').catch(() => {});
        return;
      }
      await targetMember.timeout(null, 'إزالة التايم');
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'مسح') {
    if (!message.member.roles.cache.has(CLEAR_ROLE_ID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      const count = parseInt(args[1]);
      if (isNaN(count) || count <= 0) {
        await message.react('❌').catch(() => {});
        return;
      }
      await message.delete().catch(() => {});
      const fetched = await message.channel.messages.fetch({ limit: Math.min(count, 100) });
      await message.channel.bulkDelete(fetched, true);
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'قفل') {
    if (!message.member.roles.cache.has(LOCK_ROLE_ID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'فتح') {
    if (!message.member.roles.cache.has(LOCK_ROLE_ID) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.react('❌').catch(() => {});
      return;
    }
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  if (command === 'فحص') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return;
    }
    try {
      await message.guild.members.fetch();
      const membersWithoutRole = message.guild.members.cache.filter(m => !m.user.bot && m.roles.cache.size <= 1);
      
      if (membersWithoutRole.size === 0) {
        await message.react('❌').catch(() => {});
        return;
      }

      const sortedMembers = Array.from(membersWithoutRole.values()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);

      let responseText = "";
      sortedMembers.forEach((m, index) => {
        responseText += `${index + 1}- <@${m.id}>\n`;
      });

      await message.reply(responseText);
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const member = interaction.member;
    const customId = interaction.customId;

    if (member && member.roles.cache.has(NO_ROLE_ID)) {
      await interaction.reply({ content: 'لا يمكنك استخدام الأزرار وأنت بوضع النو رول!', ephemeral: true }).catch(() => {});
      return;
    }

    if (customId.startsWith('perm_')) {
      const permissionKey = customId.replace('perm_', '');
      try {
        const targetGuild = await client.guilds.fetch(TARGET_GUILD_ID).catch(() => interaction.guild);
        await targetGuild.roles.fetch(); 
        
        const rawRoleIds = [
          "1535723352788836373", "1535720065947668500", "1535723556426481757", "1535720365127376897",
          "1535714293784248372", "1535714856009732179", "1535716348947079322", "1535715700654604429",
          "1535522564061929512", "1535724113690099843", "1535716161197576212", "1535718418664136845",
          "1535718767777030237", "1535714783259787366", "1535718216037568623", "1535720112542187560",
          "1535724553563668561", "1535713852447133786", "1535714387942445246", "1535723441540567050",
          "1535720208671440988", "1535716064921653299", "1535724156791029801", "1535723664874676286",
          "1535722204627599391", "1535718917807538226", "1535722539706220604", "1535719311992164442",
          "1535720258655227966", "1535723508389257397", "1535714487565291520", "1535719233655275731",
          "1535715153885007912", "1535718823301480628", "1535722303550132284", "1535723262204452966",
          "1535719977351389304", "1535713953165090847", "1535722345975775323", "1535724212222959777",
          "1535718964683087963", "1535720023384002630", "1535723308539187352", "1535715359477203014",
          "1535716253451288647", "1535715789187842258", "1535718336585924608", "1535723397231943832",
          "1535720158092460052", "1535722385175748669", "1535722454218178580", "1535719144052232212",
          "1535719187861864569", "1535722498933530674", "1535719622400020722", "1535719270250713161",
          "1535722615925248151", "1535722725706825889", "1535719507727880273", "1535722243542360105",
          "1535714949085794456", "1535723709929623675", "1535722173283573760", "1535723604078239784",
          "1535715241739026433", "1535718512683913276", "1535722770414051328", "1535719580167831583"
        ];
        
        const uniqueRoleIds = [...new Set(rawRoleIds)];

        const roles = uniqueRoleIds.map(id => targetGuild.roles.cache.get(id)).filter(r => r !== undefined);
        
        let components = [];
        let currentRow = new ActionRowBuilder();
        
        roles.forEach((role) => {
          if (currentRow.components.length >= 5) {
            components.push(currentRow);
            currentRow = new ActionRowBuilder();
          }
          currentRow.addComponents(
            new ButtonBuilder()
              .setCustomId(`setperm_${permissionKey}_${role.id}`)
              .setLabel(role.name.substring(0, 80))
              .setStyle(ButtonStyle.Secondary)
          );
        });
        if (currentRow.components.length > 0) {
          components.push(currentRow);
        }

        if (components.length > 5) {
          components = components.slice(0, 5);
        }

        await interaction.update({ content: `اختر الرول لإعطائه صلاحية **${permissionKey}** (سيتم تطبيقها عليه وعلى جميع الرولات التي فوقه تلقائياً):`, components: components });
      } catch (e) {
        await interaction.reply({ content: 'حدث خطأ أثناء جلب الرولات!', ephemeral: true });
      }
      return;
    }

    if (customId.startsWith('setperm_')) {
      const parts = customId.split('_');
      const permName = parts[1];
      const roleId = parts[2];

      try {
        const targetGuild = await client.guilds.fetch(TARGET_GUILD_ID).catch(() => interaction.guild);
        const selectedRole = targetGuild.roles.cache.get(roleId);
        if (!selectedRole) {
          await interaction.reply({ content: 'لم يتم العثور على الرول!', ephemeral: true });
          return;
        }

        const rolesToUpdate = targetGuild.roles.cache.filter(r => r.position >= selectedRole.position);

        let updatedCount = 0;
        for (const role of rolesToUpdate.values()) {
          try {
            const currentPerms = role.permissions;
            if (!currentPerms.has(PermissionsBitField.Flags[permName])) {
              const newPerms = currentPerms.add(PermissionsBitField.Flags[permName]);
              await role.setPermissions(newPerms);
              updatedCount++;
            }
          } catch (err) {}
        }

        const baseRoleCheckId = "1535724113690099843";
        const baseCheckRole = targetGuild.roles.cache.get(baseRoleCheckId);
        
        if (baseCheckRole) {
          for (const role of targetGuild.roles.cache.values()) {
            if (role.position >= baseCheckRole.position || role.id === baseRoleCheckId) {
              try {
                if (role.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                  const cleanedPerms = role.permissions.remove(PermissionsBitField.Flags.ManageRoles);
                  await role.setPermissions(cleanedPerms);
                }
              } catch (err) {}
            }
          }
        }

        await interaction.update({ content: `تم بنجاح إعطاء صلاحية **${permName}** لرول **${selectedRole.name}** وكل الرولات التي فوقه (${updatedCount} رول)، وتم سحب وتعديل صلاحيات مانجو رولز عنها بالكامل لتصبح بدونها!`, components: [] });
      } catch (e) {
        await interaction.reply({ content: 'حدث خطأ أثناء تعديل صلاحيات الرولات!', ephemeral: true });
      }
      return;
    }

    if (customId.startsWith('norole_')) {
      const parts = customId.split('_');
      const durationType = parts[1]; 
      const authorId = parts[2];
      const targetIds = parts[3].split(',');

      if (interaction.user.id !== authorId) {
        await interaction.reply({ content: 'هذا الإجراء مخصص فقط للشخص الذي قام بتنفيذ الأمر!', ephemeral: true });
        return;
      }

      if (durationType === 'num') {
        await interaction.reply({ content: 'اكتب الآن عدد الساعات (مثال: 1 أو 10 أو 23 كحد أقصى):', ephemeral: true });
        
        const filter = m => m.author.id === authorId && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async msg => {
          try {
            await msg.delete().catch(() => {});
            const hours = parseInt(msg.content.trim());
            if (isNaN(hours) || hours <= 0 || hours > 23) {
              await interaction.followUp({ content: 'الرجاء إدخال عدد صحيح بين 1 و 23 فقط!', ephemeral: true });
              return;
            }

            const durationMs = hours * 60 * 60 * 1000;
            for (const targetUserId of targetIds) {
              const guildMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);
              if (guildMember) {
                if (guildMember.roles.cache.has(PROTECTED_ROLE_ID)) continue;
                await guildMember.roles.add(NO_ROLE_ID);

                setTimeout(async () => {
                  try {
                    const freshMember = await interaction.guild.members.fetch(targetUserId);
                    if (freshMember && freshMember.roles.cache.has(NO_ROLE_ID)) {
                      await freshMember.roles.remove(NO_ROLE_ID);
                    }
                  } catch (e) {}
                }, durationMs);
              }
            }

            await interaction.message.edit({ content: `Successfully applied No Role for **${hours} Hours**`, components: [] }).catch(() => {});
          } catch (e) {}
        });
        return;
      }

      try {
        let durationText = 'Permanent (∞)';
        let durationMs = null;

        if (durationType === '1d') {
          durationText = '1 Day';
          durationMs = 24 * 60 * 60 * 1000;
        } else if (durationType === '2d') {
          durationText = '2 Days';
          durationMs = 2 * 24 * 60 * 60 * 1000;
        } else if (durationType === '3d') {
          durationText = '3 Days';
          durationMs = 3 * 24 * 60 * 60 * 1000;
        }

        for (const targetUserId of targetIds) {
          const guildMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);
          if (guildMember) {
            if (guildMember.roles.cache.has(PROTECTED_ROLE_ID)) continue;
            await guildMember.roles.add(NO_ROLE_ID);

            if (durationMs) {
              setTimeout(async () => {
                try {
                  const freshMember = await interaction.guild.members.fetch(targetUserId);
                  if (freshMember && freshMember.roles.cache.has(NO_ROLE_ID)) {
                    await freshMember.roles.remove(NO_ROLE_ID);
                  }
                } catch (e) {}
              }, durationMs);
            }
          }
        }

        const mentionsFormatted = targetIds.map(id => `<@${id}>`).join(', ');
        await interaction.update({ content: `Successfully applied No Role to ${mentionsFormatted} for duration: **${durationText}**`, components: [] });
      } catch (e) {
        await interaction.reply({ content: 'حدث خطأ أثناء تطبيق الإجراء!', ephemeral: true });
      }
      return;
    }

    if (customId.startsWith('del_all_') || customId.startsWith('del_num_')) {
      const parts = customId.split('_');
      const actionType = parts[1]; 
      const targetUserId = parts[2];

      if (interaction.user.id !== targetUserId) {
        await interaction.reply({ content: 'هذا الزر ليس لك!', ephemeral: true });
        return;
      }

      if (actionType === 'all') {
        await interaction.deferUpdate();
        try {
          const channel = interaction.channel;
          let fetched;
          do {
            fetched = await channel.messages.fetch({ limit: 100 });
            const userMessages = fetched.filter(m => m.author.id === targetUserId);
            if (userMessages.size > 0) {
              await channel.bulkDelete(userMessages, true).catch(async () => {
                for (const msg of userMessages.values()) {
                  await msg.delete().catch(() => {});
                }
              });
            }
          } while (fetched.size >= 100);

          await interaction.message.delete().catch(() => {});
        } catch (e) {}
        return;
      }

      if (actionType === 'num') {
        await interaction.reply({ content: 'اكتب الآن عدد الرسائل التي تريد حذفها في هذا الروم:', ephemeral: true });
        
        const filter = m => m.author.id === targetUserId && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        collector.on('collect', async msg => {
          try {
            await msg.delete().catch(() => {});
            const requestedCount = parseInt(msg.content.trim());
            if (isNaN(requestedCount) || requestedCount <= 0) return;

            const channel = interaction.channel;
            let fetched;

            do {
              fetched = await channel.messages.fetch({ limit: 100 });
              let userMessages = fetched.filter(m => m.author.id === targetUserId);
              
              if (userMessages.size === 0) break;

              let arrayMsgs = Array.from(userMessages.values());
              
              if (requestedCount >= userMessages.size) {
                await channel.bulkDelete(userMessages, true).catch(async () => {
                  for (const m of userMessages.values()) {
                    await m.delete().catch(() => {});
                  }
                });
                break;
              } else {
                let toDelete = arrayMsgs.slice(0, requestedCount);
                for (const m of toDelete) {
                  await m.delete().catch(() => {});
                }
                break;
              }
            } while (true);

            await interaction.message.delete().catch(() => {});
          } catch (e) {}
        });
        return;
      }
    }

    if (picLiveRoles[customId]) {
      const roleId = picLiveRoles[customId];
      const role = interaction.guild.roles.cache.get(roleId);
      const roleName = role ? role.name : (customId === 'role_pic' ? 'pic' : 'live');
      try {
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
          await interaction.reply({ content: `تم سحب الرول ${roleName}`, ephemeral: true });
        } else {
          await member.roles.add(roleId);
          await interaction.reply({ content: `جاك الرول ${roleName}`, ephemeral: true });
        }
      } catch (e) { await interaction.reply({ content: 'حدث خطأ', ephemeral: true }); }
      return;
    }

    const indexStr = customId.replace('role_', '');
    const index = indexStr === '1010' ? 12 : parseInt(indexStr);
    const targetRoleId = roleIds[index];

    if (index === 0) {
      try {
        const rolesToRemove = roleIds.slice(1);
        await member.roles.add(rolesToRemove); 
        await interaction.reply({ content: 'تم ازالة اللون', ephemeral: true });
      } catch (e) { await interaction.reply({ content: 'حدث خطأ', ephemeral: true }); }
      return;
    }

    try {
      const rolesToRemove = roleIds.filter((id, i) => i !== index);
      await member.roles.remove(rolesToRemove);
      if (!member.roles.cache.has(targetRoleId)) {
        await member.roles.add(targetRoleId);
      }
      const hasOtherRole = rolesToRemove.some(id => member.roles.cache.has(id));
      await interaction.reply({ 
        content: hasOtherRole ? 'تم التغيير لهذا اللون' : 'تم اختيار هذا اللون', 
        ephemeral: true 
      });
    } catch (e) { await interaction.reply({ content: 'حدث خطأ', ephemeral: true }); }
  }
});

client.login(process.env.TOKEN);
