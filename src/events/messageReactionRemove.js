const { roles } = require('../enums/roles');

module.exports = (bot, r) => {
    bot.on('messageReactionRemove', async (msg, emoji, user) => {
        if (user === bot.user.id || !msg.channel.guild) return;
        const member = msg.channel.guild.members.get(user);

        if (msg.id === "534510390705520650") { //In Welcome - can give: Accepted
            member.removeRole(roles.Accepted, "Has declined the rules.");
        } else if (msg.id === "538392565670477825") { //In Self-Roles - can give: Mod Updates and Anime
            if (emoji.id) { //Since anime has an id and the other one doesn't
                member.removeRole(roles.Anime, "Has reacted in self-roles.");
            } else {
                member.removeRole(roles.ModUpdates, "Has reacted in self-roles.");
            }
        }
    });
};