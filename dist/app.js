"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const TOKEN = 'NjM0Njg0NDg2NzY4MTMyMDk2.XanuVg.hDZkh8fH1jgrEPidyi_oaQgFQvU';
const client = new discord_js_1.Client();
const COMMAND_PREFIX = '!';
const COMMAND_JOIN = COMMAND_PREFIX + 'join';
const COMMAND_PLAY = COMMAND_PREFIX + 'play';
const COMMAND_PAUSE = COMMAND_PREFIX + 'pause';
const COMMAND_STOP = COMMAND_PREFIX + 'stop';
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! Now even more powerful!`);
});
client.on('message', (msg) => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});
client.on('message', (msg) => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!msg.guild)
        return;
    const msgSubs = msg.content.split(' ');
    if (msg.content.startsWith(COMMAND_PLAY)) {
        // Only try to join the sender's voice channel if they are in one themselves
        if (msg.member.voiceChannel) {
            msg.member.voiceChannel
                .join()
                .then((connection) => {
                // Connection is an instance of VoiceConnection
                msg.reply('I have successfully connected to the channel!');
                if (msgSubs[1] != null) {
                    ytdl_core_1.default.getInfo(msgSubs[1], (err, info) => {
                        msg.reply(`Begin playing: "${info.title}" Duration: ${info.timestamp}`);
                        if (err) {
                            msg.reply(`Error ${err}`);
                        }
                    });
                    connection.playStream(ytdl_core_1.default(msgSubs[1]));
                }
                else
                    msg.reply('Please give something for me to play.');
            })
                .catch(console.log);
        }
        else {
            msg.reply('You need to join a voice channel first!');
        }
    }
});
client.login(TOKEN);
//# sourceMappingURL=app.js.map