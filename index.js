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
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionsBitField 
} = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const JAIL_CHANNEL_ID = '1535376789357068298';
const NO_ROLE_ID = '1535403948121395300';
const COLOR_CHANNEL_ID = '1535406298781192292';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // نظام تحديث رسالة الألوان كل 1:30 دقيقة (90000 ميللي ثانية)
    setInterval(async () => {
        try {
            const channel = await client.channels.fetch(COLOR_CHANNEL_ID);
            if (!channel) return;
            
            const messages = await channel.messages.fetch({ limit: 5 });
            const botMsg = messages.find(m => m.author.id === client.user.id);

            const embed = new EmbedBuilder()
                .setTitle('رول الصور واللايف')
                .setImage('https://i.imgur.com/your-third-image-link.png') // استبدلها برابط الصورة الثالثة
                .setColor('#b0c4de');

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('color_0').setLabel('0').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_1').setLabel('1').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_2').setLabel('2').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_3').setLabel('3').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_4').setLabel('4').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('color_5').setLabel('5').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_6').setLabel('6').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_7').setLabel('7').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_8').setLabel('8').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_9').setLabel('9').setStyle(ButtonStyle.Secondary)
            );

            const row3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('color_10').setLabel('10').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_11').setLabel('11').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('color_1010').setLabel('1010').setStyle(ButtonStyle.Secondary)
            );

            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_live').setLabel('live').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('btn_pic').setLabel('pic').setStyle(ButtonStyle.Primary)
            );

            if (botMsg) {
                await botMsg.edit({ embeds: [embed], components: [row1, row2, row3, row4] });
            } else {
                await channel.send({ embeds: [embed], components: [row1, row2, row3, row4] });
            }
        } catch (error) {
            console.error('Error updating color message:', error);
        }
    }, 90000);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    // 1. اص (Mute)
    if (command === 'اص') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            await member.timeout(7 * 24 * 60 * 60 * 1000); // إسكات مؤقت طويل
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 2. تكلم (Unmute)
    if (command === 'تكلم') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            await member.timeout(null);
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 3. سجن
    if (command === 'سجن') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            // إخفاء كل الرومات وإعطاء صلاحية للروم المحدد فقط
            const guild = message.guild;
            const jailChannel = guild.channels.cache.get(JAIL_CHANNEL_ID);
            if (jailChannel) {
                await jailChannel.permissionOverwrites.create(member, { ViewChannel: true, SendMessages: true });
            }
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 4. فك سجن
    if (command === 'فك' && args[0]?.toLowerCase() === 'سجن') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            const guild = message.guild;
            const jailChannel = guild.channels.cache.get(JAIL_CHANNEL_ID);
            if (jailChannel) {
                await jailChannel.permissionOverwrites.delete(member);
            }
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 5. باند
    if (command === 'باند') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            await member.ban();
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 6. فك باند
    if (command === 'فك' && args[0]?.toLowerCase() === 'باند') {
        const userId = args[1];
        if (!userId) return;
        try {
            await message.guild.members.unban(userId);
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 7. طرد (Kick)
    if (command === 'طرد' || command === 'kick') {
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            await member.kick();
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 8. طرد من الروم (Voice Disconnect)
    if (command === 'طرد' && args[0]?.toLowerCase() === 'من' && args[1]?.toLowerCase() === 'الروم') {
        const member = message.mentions.members.first();
        if (!member || !member.voice.channel) return;
        try {
            await member.voice.disconnect();
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 9. تايم (Timeout)
    if (command === 'تايم') {
        const member = message.mentions.members.first();
        const durationMinutes = parseInt(args[1]) || 10;
        if (!member) return;
        try {
            await member.timeout(durationMinutes * 60 * 1000);
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 10. مسح (Clear messages)
    if (command === 'مسح') {
        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount)) return;
        try {
            await message.channel.bulkDelete(amount + 1, true);
        } catch {
            await message.react('❌');
        }
    }

    // 11. قفل (Lock channel)
    if (command === 'قفل') {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 12. فتح (Unlock channel)
    if (command === 'فتح') {
        try {
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 13. نو رول (No Role Request System)
    if (command === 'no' && args[0]?.toLowerCase() === 'role') {
        if (!isAdmin) {
            await message.react('❌');
            return;
        }
        const member = message.mentions.members.first();
        if (!member) return;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`norole_1_${member.id}`).setLabel('1day').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`norole_2_${member.id}`).setLabel('2day').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`norole_3_${member.id}`).setLabel('3day').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`norole_inf_${member.id}`).setLabel('لانهائي').setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({
            content: `Are you sure to give him no role?\nAnd how long ?`,
            components: [row]
        });
    }

    // Removal no role
    if (command === 'removal' && args[0]?.toLowerCase() === 'no' && args[1]?.toLowerCase() === 'role') {
        if (!isAdmin) {
            await message.react('❌');
            return;
        }
        const member = message.mentions.members.first();
        if (!member) return;
        try {
            await member.roles.remove(NO_ROLE_ID);
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }

    // 14. Crator role Guide & Creation
    if (command === 'crator' && args[0]?.toLowerCase() === 'role') {
        const targetMember = message.mentions.members.first();
        const roleName = args.slice(1).join(' ');

        if (!isAdmin) {
            await message.react('❌');
            return;
        }

        if (!targetMember || !roleName) {
            // شرح الطريقة
            await message.reply('Are you sure about the creation of the roller\nAnd what is the name of the roller and the person who gives it');
            return;
        }

        try {
            const existingRole = message.guild.roles.cache.find(r => r.name === roleName);
            if (existingRole) {
                await message.react('❌');
                return;
            }
            const newRole = await message.guild.roles.create({ name: roleName });
            await targetMember.roles.add(newRole);
            await message.react('✅');
        } catch {
            await message.react('❌');
        }
    }
});

// التعامل مع الأزرار والتفاعلات
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const [action, sub, targetId] = interaction.customId.split('_');

    // أزرار النو رول
    if (action === 'norole') {
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) return interaction.reply({ content: 'Member not found', ephemeral: true });

        let timeText = '';
        try {
            await member.roles.add(NO_ROLE_ID);
            if (sub === '1') timeText = '1 day';
            else if (sub === '2') timeText = '2 days';
            else if (sub === '3') timeText = '3 days';
            else if (sub === 'inf') timeText = 'Permanent';

            await interaction.update({ content: `Done giving no role for ${timeText}`, components: [] });
        } catch {
            await interaction.reply({ content: 'Error applying role', ephemeral: true });
        }
    }

    // أزرار الألوان
    if (action === 'color') {
        const colorIndex = sub;
        await interaction.reply({ content: `جاك رول اللون ${colorIndex}`, ephemeral: true });
    }

    // زر Live
    if (interaction.customId === 'btn_live') {
        const embed = new EmbedBuilder()
            .setTitle('رول الصور واللايف')
            .setImage('https://i.imgur.com/rtyh-blue-image-link.png') // استبدل برابط صورة ريث الزرقاء (الصورة 26)
            .setColor('#1e90ff');

        await interaction.update({ embeds: [embed] });
        await interaction.followUp({ content: 'جاك رول Live', ephemeral: true });
    }

    // زر Pic
    if (interaction.customId === 'btn_pic') {
        await interaction.reply({ content: 'جاك رول Pic', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
