import { Client, StreamDispatcher } from 'discord.js';
import ytdl from 'ytdl-core-discord';
import search from 'youtube-search';

require('dotenv').config();

const client = new Client();

const COMMAND_PREFIX = '!';
// const COMMAND_JOIN = COMMAND_PREFIX + 'join';
const COMMAND_PLAY = COMMAND_PREFIX + 'play';
const COMMAND_PAUSE = COMMAND_PREFIX + 'pause';
const COMMAND_STOP = COMMAND_PREFIX + 'stop';
const COMMAND_VOLUME = COMMAND_PREFIX + 'volume';

let dispatcher: StreamDispatcher;

process.on('unhandledRejection', console.error);

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
  if (!msg.guild) return;

  if (msg.content.startsWith(COMMAND_PLAY)) {
    const match = msg.content.match(new RegExp(`(${COMMAND_PLAY})(.*)`));
    if (match !== null && match.length > 0) {
      const query = match[2];

      // Only try to join the sender's voice channel if they are in one themselves
      if (msg.member.voiceChannel) {
        msg.member.voiceChannel
          .join()
          .then((connection) => {
            if (query != null) {
              search(
                query,
                { maxResults: 1, key: process.env.YOUTUBE_API_KEY },
                async (err, results) => {
                  if (err) {
                    msg.reply(err.message);
                    return;
                  }
                  if (results === undefined) {
                    msg.reply('No matching results found');
                    return;
                  }
                  const video = results[0];
                  msg.reply(`Searching for "${video.title}"`);
                  dispatcher = connection.playOpusStream(await ytdl(video.link));
                  dispatcher.setVolume(0.5);
                  dispatcher.on('start', () => msg.channel.send(`Now Playing: ${video.title}`));
                  dispatcher.on('end', () => msg.channel.send('Finished playing'));
                  dispatcher.on('error', (e) => console.log('Error: ', e));

                  connection.on('disconnect', () => dispatcher.end());
                },
              );
            } else msg.reply('Please give something for me to play.');
          })
          .catch((e) => msg.reply('Error: ' + e));
      } else {
        msg.reply('You need to join a voice channel first!');
      }
    }
  }
  if (msg.content === COMMAND_PAUSE) {
    msg.reply('Playback paused.');
    dispatcher.pause();
  }

  if (msg.content === COMMAND_STOP) {
    msg.reply('Playback stopped.');
    dispatcher.end();
  }

  if (msg.content === COMMAND_VOLUME) {
    const match = msg.content.match(new RegExp(`(${COMMAND_VOLUME}) ([-.0-9]+)`));
    if (match !== null && match.length > 0) {
      const volume = parseFloat(match[2]);
      msg.reply(`Setting volume to ${volume}`);
      dispatcher.setVolume(volume);
    }
  }
});
client.login(process.env.DISCORD_BOT_TOKEN);
