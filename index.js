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
  ButtonStyle 
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

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  if (message.content === '!help') {
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

    const channel = message.channel;
    const imageUrl = 'https://cdn.discordapp.com/attachments/1535193306701504532/1535489425520459828/05994202-493A-4B2D-9FD9-F2D39872FC84.png';

    await channel.send({ content: imageUrl });
    await channel.send({ content: ' ', components: [row1, row2, row3] });

    setInterval(async () => {
      try {
        const fetchedMessages = await channel.messages.fetch({ limit: 100 });
        for (const msg of fetchedMessages.values()) {
          try { await msg.delete(); } catch (err) {}
        }
        await channel.send({ content: imageUrl });
        await channel.send({ content: ' ', components: [row1, row2, row3] });
      } catch (err) {}
    }, 30000);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const indexStr = interaction.customId.replace('role_', '');
  const index = indexStr === '1010' ? 12 : parseInt(indexStr);
  const targetRoleId = roleIds[index];
  const member = interaction.member;

  if (index === 0) {
    try {
      const rolesToRemove = roleIds.slice(1);
      await member.roles.remove(rolesToRemove);
      await interaction.reply({ content: 'تم ازالة اللون', ephemeral: true });
    } catch (e) {
      await interaction.reply({ content: 'حدث خطأ', ephemeral: true });
    }
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
  } catch (e) {
    await interaction.reply({ content: 'حدث خطأ', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
