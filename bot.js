const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const express = require('express');

// --- 1. سيرفر ويب مصغر عشان رندر يستانس وما يعطينا خطأ بورت ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Discord bot is alive and running!');
});

app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});

// --- 2. إعدادات بوت الديسكورد الأساسية ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// قائمة الرولات مرتبة من 0 إلى 1010
const rolesMap = {
    'role_0': '1535430257316864152',
    'role_1': '1535430309326233772',
    'role_2': '1535430574737592390',
    'role_3': '1535430705880764487',
    'role_4': '1535430858633388092',
    'role_5': '1535431081640206346',
    'role_6': '1535431352881651872',
    'role_7': '1535431435001925723',
    'role_8': '1535431536122265640',
    'role_9': '1535431730394177616',
    'role_10': '1535431845464903761',
    'role_11': '1535431957251367002',
    'role_1010': '1535432094635921510'
};

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content === '!help') {
        const embed = new EmbedBuilder()
            .setTitle('رول الصور واللايف')
            .setImage('https://cdn.discordapp.com/attachments/1535331262343024640/1535434690872348702/B0D8C494-4238-4411-9D59-979A17AEBD16.png?ex=6a77c07d&is=6a766efd&hm=299382d949328dbe15213021bca24f1dbe341881fcf753758a6223f7052339a6&')
            .setColor('#2f3136');

        // إنشاء صفوف الأزرار من 0 إلى 1010
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_0').setLabel('0').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1').setLabel('1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_2').setLabel('2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_3').setLabel('3').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_4').setLabel('4').setStyle(ButtonStyle.Secondary),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_5').setLabel('5').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_6').setLabel('6').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_7').setLabel('7').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_8').setLabel('8').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_9').setLabel('9').setStyle(ButtonStyle.Secondary),
        );

        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('role_10').setLabel('10').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_11').setLabel('11').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('role_1010').setLabel('1010').setStyle(ButtonStyle.Secondary),
        );

        await message.channel.send({
            embeds: [embed],
            components: [row1, row2, row3]
        });
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const roleId = rolesMap[interaction.customId];
    if (!roleId) return;

    const member = interaction.member;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
        return interaction.reply({ content: 'الرول غير موجود في السيرفر!', ephemeral: true });
    }

    try {
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            await interaction.reply({ content: `تم إزالة رول ${role.name} بنجاح`, ephemeral: true });
        } else {
            await member.roles.add(roleId);
            await interaction.reply({ content: `تم إعطاؤك رول ${role.name} بنجاح`, ephemeral: true });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'حدث خطأ أثناء معالجة الرول، تأكد من صلاحيات البوت.', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
