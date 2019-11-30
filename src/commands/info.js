const zlib = require('zlib');

module.exports = {
    info: {
        name: 'Info',
        desc: 'info <name>\ninfo <name> config\ninfo <name> config <num>',
        help: 'info',
        category: 'Accounts',
        uses: [
            'info',
            'i'
        ]
    },
    execute: (bot, r, msg, args) => {
        global.search = (err, cb) => {
            if (typeof cb === "undefined" || cb.length < 1 || cb == undefined) return msg.channel.createMessage('User not found');
            cb = cb[0];
            var e = msg.channel.createEmbed()
                .author(cb.name, 'https://minotar.net/helm/' + cb.id + '/100.png')
                .color(7531934)
                .footer("Wynntils", bot.user.avatarURL);
            if (args[1] === 'config') {
                if (!msg.member.roles.includes("394189673678766091") && !msg.member.roles.includes("439546118964117534") && !msg.member.roles.includes("394189812816412692"))
                    return msg.channel.createMessage("Sorry, you don't have permissions to use this!");
                if (typeof args[2] === "undefined") {
                    var i = 0;
                    var z = 0;
                    var count = 0;
                    var map = [];
                    Object.keys(cb.configFiles).forEach((x) => {
                        if (count > 1800) {
                            z++;
                            count = 0;
                        }
                        if (typeof map[z] === "undefined") map[z] = '';
                        var str = i + ': `' + x + '`\n';
                        map[z] += str;
                        count += str.length;
                        i++;
                    });
                    for (var y in map) {
                        e.description(map[y]);
                        e.footer("Wynntils | Page " + (Number(y)+1), bot.user.avatarURL);
                        e.send().catch(e => { bot.error(e);});
                    }
                    return;
                } else {
                    const key = isNaN(args[2]) ? args[2] : Object.keys(cb.configFiles)[args[2]];
                    let configData = Buffer.from(cb.configFiles[key], 'base64');
                    if (configData[0] === 0x78) {
                        // ZLIB magic word, possibly zipped
                        try {
                            configData = zlib.inflateSync(configData);
                        } catch (e) { /* Error inflating, continue without */ }
                    }
                    e.description('```json\n' + configData.toString('latin1') + ' ```');
                    e.footer('Wynntils | ' + key, bot.user.avatarURL);
                }
            } else {
                e.field('Account Type',cb.accountType, true);
                e.field('Latest Version',cb.latestVersion, true);
                e.field('Last Online',new Date(cb.lastActivity).toDateString(), true);
                e.field('Cape',cb.activeModels.capeActive, true);
                e.field('Ears',cb.activeModels.earsActive, true);
                e.field('Elytra',cb.activeModels.elytraActive, true);
            }
            if (typeof e.sendable.description !== "undefined" && e.sendable.description.length > 2000) {
                msg.channel.createMessage('Message would be too long...');
            } else {
                e.send().catch(e => { bot.error(e); });
            }
        };

        if (typeof args[0] === "undefined") {
            r.table('users').filter({ discordInfo: { id: msg.author.id } }).run((err, cb) => {
                if (cb.length < 1 || cb == undefined) return msg.channel.createMessage('Missing arguments!');
                cb = cb[0];
                var s = cb.name;
                r.table('users').getAll(s, { index: 'name' }).run((err, cb) => { search(err, cb); });
            });
        } else if (args[0] === '@') {
            if (!msg.member.roles.includes("394189673678766091") && !msg.member.roles.includes("439546118964117534") && !msg.member.roles.includes("394189812816412692"))
                return msg.channel.createMessage("Sorry, you don't have permissions to use this!");

            // List all user roles
            r.table('users').filter(r.row('accountType').ne('NORMAL')).run().then(res => {
                const list = {};
                for (const cb of res) {
                    if (!(cb.accountType in list)) list[cb.accountType] = [];
                    list[cb.accountType].push(cb.name);
                }
                const e = msg.channel.createEmbed()
                    .color(7531934)
                    .footer("Wynntils", bot.user.avatarURL);

                for (const type in list) {
                    if (!list.hasOwnProperty(type)) continue;

                    e.field(type, '\n'.join(list[type]));
                }

                e.send().catch(e => { bot.error(e); });
            });
        } else {
            if (!msg.member.roles.includes("394189673678766091") && !msg.member.roles.includes("439546118964117534") && !msg.member.roles.includes("394189812816412692"))
                return msg.channel.createMessage("Sorry, you don't have permissions to use this!");
            var s = args[0];
            r.table('users').getAll(s, { index: 'name' }).run((err, cb) => { search(err, cb); });
        }
    }
};