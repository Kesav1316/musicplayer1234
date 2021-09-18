const Discord = require('discord.js'); require('discord-reply');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const math = require('mathjs');
const pog = require('./functions');

const prefix = 'p';

let StatusNumber = 0;

//pog.changeNow(); FALSE = PLAYING NORMALLY <> TRUE = PLAYING IN Q

const client = new Discord.Client();

function ChangeStatus()
{
    if (StatusNumber === 0) { ChangeStatusToNormal(); }

    else if (StatusNumber === 1) { client.user.setActivity('songs for myself', {type: 'PLAYING'}); }

    else if (StatusNumber > 1) { client.user.setActivity(`songs for ${StatusNumber.toString()} users`, {type: 'PLAYING'}); }

    else { StatusNumber = 0; ChangeStatus(); }
};

function ChangeStatusToNormal() { client.user.setActivity('pls help', {type: 'PLAYING'}); };

client.once('ready' , () => { console.log('Music bot is online'); ChangeStatusToNormal(); });




client.on('voiceStateUpdate', (OldState, NewState) =>
{
    if (OldState.id === '742640664222892194' || NewState.id === '742640664222892194')
    {
        if (client.voice.connections.size === 0)
        {
            StatusNumber = 0;

            pog.clear(OldState.guild.id);
            pog.clearNow(OldState.guild.id);
            pog.counter.clear(OldState.guild.id);
            pog.changeNow(OldState.guild.id, false);
            
            ChangeStatus();
        }

        else
        {
            if (NewState.channelID === null) // LEAVING A VC
            {
                pog.clear(OldState.guild.id);
                pog.clearNow(OldState.guild.id);
                pog.counter.clear(OldState.guild.id);
                pog.changeNow(OldState.guild.id, false);

                const user_count = client.voice.client.channels.cache.get(OldState.channelID).members.size;

                setTimeout(() => 
                {
                    const old_number = StatusNumber;

                    StatusNumber = math.subtract(old_number, user_count);

                    ChangeStatus();

                }, 1000 * 2);
            }

            else // JOINING A VC
            {
                setTimeout(() => 
                {
                    const user_count = client.voice.client.channels.cache.get(NewState.channelID).members.size;
                    
                    const old_number = StatusNumber;

                    StatusNumber = math.add(old_number, user_count);

                    ChangeStatus();

                }, 1000 * 2);
            }
        }
    }

    else
    {
        const vc_list = [];

        const number = math.subtract(client.voice.connections.toJSON().length, 1);
    
        for (let index = 0; number >= index; index++)
        {
            const hello = client.voice.connections.toJSON()[index].channel;
    
            vc_list.push(hello);
        }

        const OldChannel_ID = OldState.channelID;
        const NewChannel_ID = NewState.channelID;

        if (OldChannel_ID === null)
        {
            //1. TO A VC WITH MUSIC
            if (vc_list.some(x => x === NewChannel_ID))
            {
                StatusNumber++; ChangeStatus();
            }

            //2. TO A VC WITHOUT MUSIC
        }

        else
        {
            //1. CAN BE IN A VC WITH MUSIC
            if (vc_list.some(x => x === OldChannel_ID))
            {
                //1. CAN GO IN A VC WITH MUSIC

                //2. CAN GO IN A VC WITHOUT MUSIC
                //3. LEAVE VC
                if (!vc_list.some(x => x === NewChannel_ID) || NewChannel_ID === null)
                {
                    StatusNumber--; ChangeStatus();
                }
            }
            
            //2. CAN BE IN A VC WITHOUT MUSIC
            else
            {
                //1. CAN GO IN A VC WITH MUSIC
                if (vc_list.some(x => x === NewChannel_ID))
                {
                    StatusNumber++; ChangeStatus();
                }
                
                //2. CAN GO IN A VC WITHOUT MUSIC
                //3. LEAVE VC
            }
        }
    }
});




client.on
('message', (message) =>
{   
    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();









    function NowPlaying()
    {
        const qp = pog.get.NowPlaying(message.guild.id);
        
        if (qp === false) //Playing in play();
        {
            if (pog.get.now(message.guild.id).SongAndLink[0] === undefined) { message.channel.send('no song is playing nowo'); }
            
            else
            {
                const NowPlaying = new Discord.MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription('Now playing ' + pog.get.now(message.guild.id).SongAndLink[0] + '\r\nby **' + pog.get.now(message.guild.id).Channel[0] + '**');
            
                message.channel.send(NowPlaying);
            }
        }

        else if (qp === true) //Playing in qplay();
        {
            const qlist = pog.get.qlist(message.guild.id);
            const channelname = pog.get.channel(message.guild.id);
            const Counter = pog.get.counter(message.guild.id);

            const embed = new Discord.MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setDescription('Now playing ' + qlist[Counter] + '\r\nby **' + channelname[Counter] + '**');

            message.channel.send(embed);
        }
    };




    function play(song)
    {
        const vc = message.member.voice.channel;

        pog.clearNow(message.guild.id);

        if (ytdl.validateURL(song))
        {
            yts({videoId: ytdl.getURLVideoID(song)}).then( (result) =>
            {
                pog.push.now(message.guild.id, result.title, result.url, result.author.name);

                const stream = ytdl(result.url, { filter: 'audioonly', highWaterMark: 1<<25 });
    
                vc.join().then(ss => ss.play(stream, { seek: 0, volume: 1 }).on('finish', () => { message.channel.send('song over'); pog.clearNow(message.guild.id); }));

                NowPlaying();
            });
        }

        else
        {
            yts(song).then( (result) =>
            {
                pog.push.now(message.guild.id, result.all[0].title, result.all[0].url, result.all[0].author.name);

                const stream = ytdl(result.all[0].url, { filter: 'audioonly', highWaterMark: 1<<25 });
    
                vc.join().then(ss => ss.play(stream, { seek: 0, volume: 1 }).on('finish', () => { message.channel.send('song over'); pog.clearNow(message.guild.id); }));

                NowPlaying();
            });
        }
    };




    function qplay()
    {
        const vc = message.member.voice.channel;
        
        const link = pog.get.link(message.guild.id);
        const Counter = pog.get.counter(message.guild.id);

        if (link.length !== 0)
        {
            if (link[Counter])
            {
                pog.changeNow(message.guild.id, true);

                const stream = ytdl(link[Counter], { filter: 'audioonly', highWaterMark: 1<<25 });

                NowPlaying();
        
                vc.join().then(ss => ss.play(stream, { seek: 0, volume: 1 }).on('finish', () => { pog.counter.change(message.guild.id, math.add(Counter, 1)); qplay(); }));
            }
            else { vc.join().then(ss => ss.dispatcher.end()); pog.counter.clear(message.guild.id); pog.changeNow(message.guild.id, false); pog.clear(message.guild.id); message.channel.send('song over / q over / q cleared'); }
        }
        else { message.channel.send('no songs in q'); pog.counter.clear(message.guild.id); pog.changeNow(message.guild.id, false); }
    };









    if (command == 'ls')
    {
        let one = args [0];
        let two = args [1];
        let three = args [2];

        const vc = message.member.voice.channel;

        if (one)
        {
            if (one.toLowerCase() === 'play')
            {
                if (vc)
                {
                    if (two)
                    {
                        const keyword = message.content.slice(8);
    
                        play(keyword);

                        pog.changeNow(message.guild.id, false);
    
                        if (pog.get.link(message.guild.id).length !== 0)
                        {
                            message.channel.send('__there are some songs in q__\r\n\r\nsend **`yes`** if u want to clear the q\r\nsend **`no`** if u dont want to clear the q\r\n\r\nif u dont send a msg within **30 secs**, q will be cleared automatically\r\nbtw u __can send any msgs__ within that **30 sec**, but if u send **`yes`** or **`no`** i will clear the q acc to it');
    
                            const filter = (m) => m.author.id === message.author.id;
                            const collector = new Discord.MessageCollector(message.channel, filter, {time: 1000 * 30});
                        
                            collector.on('collect', (xyz) =>
                            {
                                if (xyz.content.toLowerCase() === 'yes') { collector.stop(); }
    
                                else if (xyz.content.toLowerCase() === 'no') { collector.stop(); }
                            });
                        
                            collector.on('end', (xyz) =>
                            {
                                const response = xyz.toJSON();
                        
                                if (response.length === 0) { pog.clear(message.guild.id); pog.counter.clear(message.guild.id); message.channel.send('q cleared automatically'); }
                        
                                else if (response.length === 1)
                                {
                                    if (response[0].content.toLowerCase() === 'yes') { pog.clear(message.guild.id); pog.counter.clear(message.guild.id); message.channel.send('q cleared'); }
                        
                                    else if (response[0].content.toLowerCase() === 'no') { message.channel.send('q not cleared'); }   
                                }
                        
                                else if (response.length > 1)
                                {
                                    const data = [];
                        
                                    xyz.forEach((msg) => { data.push(msg.content.toLowerCase()); });
                                
                                    if (data.some(message => message === 'yes')) { pog.clear(message.guild.id); pog.counter.clear(message.guild.id); message.channel.send('q cleared'); }
                        
                                    else if (data.some(message => message === 'no')) { message.channel.send('q not cleared'); }
                        
                                    else { message.channel.send('q cleared automatically'); }
                                }
                            });
                        }
                    }
    
                    else { message.channel.send('pls give yt link / song name'); }
                }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'q')
            {
                if (two)
                {
                    if (vc)
                    {
                        if (two.toLowerCase() === 'add')
                        {
                            if (three)
                            {    
                                if (ytdl.validateURL(three))
                                {
                                    yts({ videoId: ytdl.getURLVideoID(three) }).then( (result) =>
                                    {
                                        const link = result.url;
                                        const song = result.title;
                                        const channel = result.author.name;
    
                                        const ade = new Discord.MessageEmbed()
                                        .setColor(message.guild.me.displayHexColor)
                                        .setTitle('New song added to q')
                                        .setDescription('[' + song + ']' + '(' + link + ')\r\nby **' + channel + '**');
        
                                        message.channel.send(ade);
        
                                        pog.push.links(message.guild.id, link);
                                        pog.push.channels(message.guild.id, channel);
                                        pog.push.qlist(message.guild.id, `[${song}](${link})`);
                                    } );
                                }
    
                                else
                                {
                                    const keyword = message.content.slice(10);
    
                                    yts(keyword).then( (result) =>
                                    {
                                        const link = result.all[0].url;
                                        const song = result.all[0].title;
                                        const channel = result.all[0].author.name;
        
                                        const ade = new Discord.MessageEmbed()
                                        .setColor(message.guild.me.displayHexColor)
                                        .setTitle('New song added to q')
                                        .setDescription('[' + song + ']' + '(' + link + ')\r\nby **' + channel + '**');
        
                                        message.channel.send(ade);
        
                                        pog.push.links(message.guild.id, link);
                                        pog.push.channels(message.guild.id, channel);
                                        pog.push.qlist(message.guild.id, `[${song}](${link})`);
                                    });
                                }
                            }
                            
                            else { message.channel.send('pls give yt link / song name'); }
                        }
                        
                        else if (two.toLowerCase() === 'play')
                        {
                            if (three)
                            {
                                if (!isNaN(three))
                                {
                                    if (pog.get.link(message.guild.id).length > math.round(three))
                                    {
                                        if (math.round(three) > 0) { pog.counter.change(message.guild.id, math.round(three)); qplay(); pog.clearNow(message.guild.id); }
                                    }
                                }
                            }
    
                            else { pog.counter.clear(message.guild.id); qplay(); pog.clearNow(message.guild.id); }
                        }
                    }

                    else { message.channel.send('pls join a vc'); }
                }

                else
                {
                    const queue = pog.get.link(message.guild.id);

                    if (queue.length !== 0)
                    {
                        const qlist = []; let index = 0;
                        
                        pog.get.qlist(message.guild.id).forEach((msg) => { qlist.push('**' + index + '**. ' + msg); index++; });

                        const qem = new Discord.MessageEmbed()
                        .setColor(message.guild.me.displayHexColor)
                        .setTitle('Current Queue')
                        .setDescription(qlist);

                        message.channel.send(qem);
                    }

                    else { message.channel.send('no song in q'); }
                }
            }

            else if (one.toLowerCase() === 'stop')
            {
                if (vc) { vc.join().then((smth) => smth.dispatcher.end()); pog.clear(message.guild.id); pog.clearNow(message.guild.id); pog.counter.clear(message.guild.id); pog.changeNow(message.guild.id, false); }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'join')
            {
                if (vc) { vc.join(); }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'leave')
            {
                if (vc) { vc.leave(); }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'pause')
            {
                if (vc) { vc.join().then((smth) => { smth.dispatcher.pause(); }); }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'resume')
            {
                if (vc) { vc.join().then((smth) => { smth.dispatcher.resume(); }); }
                
                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'ping')
            {
                const dummy = new Discord.MessageEmbed()
                .setColor('#2F3136')
                .setTitle('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _')
                .setDescription('_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _');
        
                message.channel.send('_ _')
                .then((msg) =>
                {
                    msg.edit(dummy); msg.react('<a:spin_think:875382105188749313>');
        
                    const ping_value = msg.createdTimestamp - message.createdTimestamp;
                    const ping_divide = math.divide(ping_value, 4);
                    const final_ping = math.round(ping_divide);
        
                    let ping_emoji = '<:0_100:883571180240523274>';
        
                    let EmbedColor = '#3BA55C';
        
                    if (final_ping > 100) ping_emoji = '<:100_340:883571179665899561>';
                    if (final_ping > 340) ping_emoji = '<:340_plus:883571180257304596>';
            
                    if (final_ping > 100) EmbedColor = '#FAA81A';
                    if (final_ping > 340) EmbedColor = '#ED4245';
        
                    const ping_embed = new Discord.MessageEmbed()
                    .setColor('#2F3136')
                    .setTitle(':ping_pong: Pong !')
                    .setDescription(final_ping + ' ms (aprox)\r\nRegion: :flag_us: USA');
        
                    const new_ping_embed = new Discord.MessageEmbed()
                    .setColor(EmbedColor)
                    .setTitle(':ping_pong: Pong !')
                    .setDescription(final_ping + ' ms (aprox)\r\nRegion: :flag_us: USA');
        
                    msg.edit(ping_embed); setTimeout(() => { msg.reactions.removeAll(); msg.react(ping_emoji); }, 1000 * 2); setTimeout(() => { msg.edit(new_ping_embed); }, 1000 * 3);
                }
                );
            }

            /**/
            else if (one.toLowerCase() === 'counter') { if (message.author.id === '580322451729154049' || message.author.id === '580355433257107458') { message.channel.send(pog.get.counter(message.guild.id)); } } 

            else if (one.toLowerCase() === 'send') { if (message.author.id === '580322451729154049' || message.author.id === '580355433257107458') { const attach = new Discord.MessageAttachment('music.json'); message.channel.send(attach); } }
            /**/

            else if (one.toLowerCase() === 'clear')
            {
                if (vc)
                {
                    const emojis = ['👍', '✌️', '🧹', '🧽', '🧼'];
                    const randomemoji = emojis[math.round(math.random(0, math.subtract(emojis.length, 1)))];

                    pog.clear(message.guild.id); pog.counter.clear(message.guild.id);

                    message.react(randomemoji);
                }

                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'skip')
            {
                if (vc) { pog.counter.change(message.guild.id, math.add(pog.get.counter(message.guild.id), 1)); qplay(); }
                
                else { message.channel.send('pls join a vc'); }
            }

            else if (one.toLowerCase() === 'now') { NowPlaying(); }

            else if (one.toLowerCase() === 'search')
            {
                if (two)
                {
                    const search_words = message.content.slice(11);

                    yts(search_words).then((result) =>
                    {
                        const list = [];

                        for (let index = 0; index < 5; index++)
                        {
                            if (result.all[index].title !== undefined) { list.push(`:small_orange_diamond: [${result.all[index].title}](${result.all[index].url})`); }
                        }

                        const EMBED = new Discord.MessageEmbed()
                        .setColor(message.guild.me.displayHexColor)
                        .setDescription(list);

                        message.channel.send(EMBED).then(async function (message)
                        {
                            const filter = (reaction) => reaction
                            const collector = message.createReactionCollector(filter, {time : 1000 * 15});
                
                            const new_list = [];
                
                            await message.react('➡️');
                
                            collector.on('collect', (reaction) =>
                            {
                                if (reaction.emoji.name === '➡️')
                                {
                                    for (let honlo = 5; honlo < 10; honlo++)
                                    {
                                        if (result.all[honlo].title !== undefined) { new_list.push(`:small_orange_diamond: [${result.all[honlo].title}](${result.all[honlo].url})`); }
                                    }
                
                                    const EMBED_NEW = new Discord.MessageEmbed()
                                    .setColor(message.guild.me.displayHexColor)
                                    .setDescription(new_list);
                
                                    message.channel.send(EMBED_NEW).then(async function (msg)
                                    {
                                        const collector2 = msg.createReactionCollector(filter, {time : 1000 * 15});

                                        await msg.react('⬅️');

                                        collector2.on('collect', (reaction) =>
                                        {
                                            if (reaction.emoji.name === '⬅️')
                                            {
                                                message.channel.startTyping();

                                                setTimeout(() =>
                                                {
                                                    message.channel.stopTyping();
                                                    message.lineReplyNoMention(`bruh <@${reaction.toJSON().users[1]}>, are u so lazy to even scroll a bit up and look into this ? :rofl:`);
                                                    
                                                }, 1000 * 2);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    });
                }
                else { message.channel.send('bro, give the name of the song which u want to search :sigh: (yea not a emoji)'); }
            }

            else if (one.toLowerCase() === 'help')
            {
                const help = new Discord.MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setTitle('commands list aaaaaa')
                .setDescription('NOTE: All these commands ||(actually not all)|| will not work unless you are in a vc')
                .addField('pls play `song name / yt link`', 'Plays the song')
                .addField('pls q', 'Gives the list of the songs present in the q')
                .addField('pls q add `song name / yt link`', 'adds the song to the q')
                .addField('pls q play', 'plays all the songs which are in the q')
                .addField('pls q play `number`', 'type `pls q` to get the q which shows the number assigend to each song in the q, type that number in the place of the **`number`** to play that specific song from the q')
                .addField('pls stop', 'stops the current song, and if there is any song in q, it will be cleared as well')
                .addField('pls join', 'joins the vc which ur in')
                .addField('pls leave', 'leaves the vc')
                .addField('pls pause', 'pauses the current playing song')
                .addField('pls resume', 'resumes the paused song')
                .addField('pls clear', 'clears the songs in the q')
                .addField('pls skip', 'skips the current song and plays the nxt song in the q.\r\nNoTE: This works only when the song is playing from the q')
                .addField('pls now', 'shows the song which is currently playing')
                .addField('pls search `song name`', 'Searchs yt for the `song name` which u gave, and gives the top 5 results.\r\nPROOOOO TIP: React to the emoji within 15 secs if u want more results')
                .addField('pls help', 'returns this msg');
        
                message.channel.send(help);
            }
        }
    }
}
);

client.login('ODc2NzcyMjI3NzM4MTA3OTQ0.YRo7xA.9rA_Mw7QESRsEg1RnEyL8r69_D8');