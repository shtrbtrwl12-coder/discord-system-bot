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
  PermissionsBitField 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember]
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

const MUTED_ROLE_ID = '1535504124622143508'; // أيدي رول الميوت
const JAIL_ROLE_ID = '1535376614735609977';  // أيدي رول السجن
const TIME_ROLE_ID = '1535522564061929512';  // أيدي رول صانع التايم
const CLEAR_ROLE_ID = '1535523717650583602'; // أيدي رول المسح
const LOCK_ROLE_ID = '1535523952498057338';  // أيدي رول القفل والفتح

const COLOR_CHANNEL_ID = '1535406298781192292'; // روم الألوان
const PIC_LIVE_CHANNEL_ID = '1535490093358252074'; // روم الصور واللايف
const IMAGE_ONLY_CHANNEL_ID = '1535490327610400810'; // روم الصور فقط
const TELLONYM_CHANNEL_ID = '1535490429724921986'; // روم روابط التليتون
const IMAGE_CHANNEL_ID = '1535375475289890879'; // روم إرسال الصورة المطلوبة
const CUSTOM_EMOJI_ID = '1535510817703862282'; // أيدي الإيموجي الجديد لروم الصور

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // --- إرسال الصورة المطلوبة في الروم المحدد ---
  const imageTargetChannel = await client.channels.fetch(IMAGE_CHANNEL_ID).catch(() => null);
  if (imageTargetChannel) {
    const fetchedImgMsgs = await imageTargetChannel.messages.fetch({ limit: 5 }).catch(() => null);
    const imgAlreadySent = fetchedImgMsgs ? fetchedImgMsgs.some(m => m.author.id === client.user.id) : false;
    if (!imgAlreadySent) {
      const embed = new EmbedBuilder().setImage('https://cdn.discordapp.com/attachments/1535193306701504532/1535533823956221952/image.png').setColor('#2b2d31');
      await imageTargetChannel.send({ embeds: [embed] }).catch(() => {});
    }
  }

  // --- منطق روم الصور واللايف (يرسل مرة واحدة فقط ولا يتكرر) ---
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

  // --- منطق روم الألوان (يحذف كل الكلام في الروم ويرسل من جديد كل 15 ثانية) ---
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

// --- دوال مساعدة للوقت والعضو المستهدف ---
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

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // --- نظام روم الصور فقط ---
  if (message.channel.id === IMAGE_ONLY_CHANNEL_ID) {
    const hasImage = message.attachments.size > 0 || message.embeds.length > 0 || /https?:\/\/.*\.(png|jpg|jpeg|gif|webp)/i.test(message.content);
    if (hasImage) {
      await message.react(CUSTOM_EMOJI_ID).catch(() => {});
    } else {
      await message.delete().catch(() => {});
    }
    return;
  }

  // --- نظام روم روابط التليتون فقط ---
  if (message.channel.id === TELLONYM_CHANNEL_ID) {
    const isTellonym = /tellonym\.me/i.test(message.content);
    if (!isTellonym) {
      await message.delete().catch(() => {});
    }
    return;
  }

  const contentLower = message.content.toLowerCase().trim();

  // --- نظام Crator role (يدعم كابيتال وسمول) ---
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

  // --- نظام "باند" أو "طياره" ---
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

  // --- نظام "فك باند" ---
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

  // --- نظام "برا" (طرد من السيرفر) ---
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

  // --- نظام "سجن" ---
  if (command === 'سجن') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
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

  // --- نظام "لاسجن" ---
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

  // --- نظام "اص" لتسكيت الشخص ---
  if (command === 'اص') {
    try {
      const targetMember = await getTargetMember(message);
      if (!targetMember) {
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

  // --- نظام "تكلم" ---
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

  // --- نظام "تايم" (يتطلب رول التايم) ---
  if (command === 'تايم') {
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
      let contentWithoutCommand = message.content.replace('تايم', '').replace(/<@!?\d+>/g, '').trim();
      const durationMs = parseDuration(contentWithoutCommand);

      await targetMember.timeout(durationMs, 'تايم إداري');
      await message.react('✅').catch(() => {});
    } catch (err) {
      await message.react('❌').catch(() => {});
    }
    return;
  }

  // --- نظام "لاتايم" ---
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

  // --- نظام "مسح" (يتطلب رول المسح) ---
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

  // --- نظام "قفل" (يتطلب رول القفل) ---
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

  // --- نظام "فتح" (يتطلب رول القفل) ---
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

  // --- نظام "فحص النو رول" (لأصحاب صلاحية Administrator) ---
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
  if (!interaction.isButton()) return;
  const member = interaction.member;
  const customId = interaction.customId;

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
      await member.roles.remove(rolesToRemove);
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
});

client.login(process.env.TOKEN);
