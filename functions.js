const fs = require('fs');

const file = 'music.json';

module.exports =
{
   push :
   {
       links: function(ServerID, Data)
       {
            const data = JSON.parse(fs.readFileSync(file).toString());
   
            data[ServerID]['links'].push(Data);
    
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
       },

       channels: function(ServerID, Data)
       {
            const data = JSON.parse(fs.readFileSync(file).toString());
   
            data[ServerID]['channels'].push(Data);
    
            fs.writeFileSync(file, JSON.stringify(data, null, 2));
       },

       qlist: function(ServerID, Data)
       {
          const data = JSON.parse(fs.readFileSync(file).toString());
   
          data[ServerID]['qlist'].push(Data);
  
          fs.writeFileSync(file, JSON.stringify(data, null, 2));
       },

       now: function(ServerID, Song, Link, Channel)
       {
          const data = JSON.parse(fs.readFileSync(file).toString());
   
          data[ServerID]['now']['SongAndLink'].push(`[${Song}](${Link})`);
          data[ServerID]['now']['Channel'].push(Channel);
  
          fs.writeFileSync(file, JSON.stringify(data, null, 2));
       }
   },

   get:
   {
        link: function(ServerID)
        {
             const read = JSON.parse(fs.readFileSync(file).toString());
  
             return read[ServerID]['links'];
        },

        channel: function(ServerID)
        {
             const read = JSON.parse(fs.readFileSync(file).toString());
  
             return read[ServerID]['channels'];
        },

        qlist: function(ServerID)
        {
             const read = JSON.parse(fs.readFileSync(file).toString());
  
             return read[ServerID]['qlist'];
        },

        counter: function(ServerID)
        {
             const data = JSON.parse(fs.readFileSync(file).toString());

             return data[ServerID]['counter'];
        },

        now: function(ServerID)
        {
             const data = JSON.parse(fs.readFileSync(file).toString());

             const result =
             {
                  "SongAndLink" : data[ServerID]['now']['SongAndLink'],
                  "Channel" : data[ServerID]['now']['Channel']
             };

             return result;
        },

        NowPlaying: function(ServerID)
        {
             const data = JSON.parse(fs.readFileSync(file).toString());

             return data[ServerID]['NowPlaying'];
        }
   },

   clear: function(ServerID)
   {
     const data = JSON.parse(fs.readFileSync(file).toString());

     delete data[ServerID]['links'];
     data[ServerID]['links'] = [];

     delete data[ServerID]['channels'];
     data[ServerID]['channels'] = [];

     delete data[ServerID]['qlist'];
     data[ServerID]['qlist'] = [];

     fs.writeFileSync(file, JSON.stringify(data, null, 2));
   },

   clearNow: function(ServerID)
   {
        const data = JSON.parse(fs.readFileSync(file).toString());

        delete data[ServerID]['now']['SongAndLink'];
        data[ServerID]['now']['SongAndLink'] = [];

        delete data[ServerID]['now']['Channel'];
        data[ServerID]['now']['Channel'] = [];

        fs.writeFileSync(file, JSON.stringify(data, null, 2));
   },

   counter: 
   {
        clear: function(ServerID)
        {
             const data = JSON.parse(fs.readFileSync(file).toString());

             delete data[ServerID]['counter'];
             data[ServerID]['counter'] = 0;

             fs.writeFileSync(file, JSON.stringify(data, null, 2));
        },

        change: function(ServerID, ToNumber = new Number)
        {
             const data = JSON.parse(fs.readFileSync(file).toString());

             delete data[ServerID]['counter'];
             data[ServerID]['counter'] = ToNumber;

             fs.writeFileSync(file, JSON.stringify(data, null, 2));
        }
   },

   changeNow: function(ServerID, True_or_False = new Boolean)
   {
        const data = JSON.parse(fs.readFileSync(file).toString());

        data[ServerID]['NowPlaying'] = True_or_False;

        fs.writeFileSync(file, JSON.stringify(data, null, 2));
   }
}