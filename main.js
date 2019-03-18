const Discord = require('discord.js')
const fs = require('fs');
const fetch = require("node-fetch");

const client = new Discord.Client();
const IMGUR_API_CLIENT_ID = '31830e5e5536d70';
const IMGUR_API_CLIENT_SECRET = '3c4009e82e42972f2ca03e8d162fafcba5e4ef44';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
    let content = msg.content.toLowerCase();
    switch (content) {
        case 'pls roast':
            msg.reply('git gud nerd');
            break;
        case 'ping':
            msg.reply('Pong!');
            break;
        case 'marco':
            msg.reply('polo!');
            break;
        case 'animeme':
            let randomMeme = new randImg;
            let img = new Discord.RichEmbed();
            img.attachFile(randomMeme.imgPath);
            msg.reply(img);
            break;
        default:
            break;
    }
    if (content.startsWith('>a ')) {
        animeCallApi(msg);
    } else if (content.startsWith('>im ')) {
        imgurSearchApi(msg);
    }
})

class randImg {
    constructor() {
        this.imgId = Math.round(58*Math.random()); // 58 images, one is randomly selected by number
        this.imgFileName = this.imgId + '.png';
        this.imgPath = fs.readFileSync('./Animemes/'+ this.imgFileName + '/');
    }
}

function imgurSearchApi(msg) {
    let queryTerm = msg.content.replace('>im ', '').replace(/\s/g, '%20');
    let url = 'https://api.imgur.com/3/gallery/search/top/all?q=' + queryTerm;
    let options = {
        headers: {
            Authorization: `Client-ID ${IMGUR_API_CLIENT_ID}`
        }
    }
    fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

    function handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
    function handleData(data) {
        let link = data.data[0].link
        console.log(link);
        msg.reply(link);
    }
    function handleError(error) {
        console.error(error);
    }
}

function animeCallApi(msg) {
    // Here we define our query as a multi-line string
    let query = `
    query ($search: String) { # Define which variables will be used in the query (id)
        Page (page: 1, perPage: 1) {
            media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                title {
                    romaji
                    english
                    native
                }
                description
            }
        }
    }
    `;

    // Define our query variables and values that will be used in the query request

    let variables = {
        search: msg.content.replace('>a ', '')
    };

    // Define the config we'll need for our Api request
    let url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

    // Make the HTTP Api request
    fetch(url, options).then(handleResponse).then(handleData).catch(handleError);

    function handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }
    function handleData(data) {
        let pageData = data.data.Page;
        function name(pageJson) {
            if ((typeof pageJson.media[0].title.romaji) === 'string') {
                return pageJson.media[0].title.romaji;
            } else if ((typeof pageJson.media[0].title.english) === 'string') {
                return pageJson.media[0].title.english;
            } else if ((typeof pageJson.media[0].title.native) === 'string') {
                return pageJson.media[0].title.native;
            } else {
                return 'No title found.';
            }
        }
        function description(pageJson) {
            if ((typeof pageJson.media[0].description) === 'string') {
                return pageJson.media[0].description;
            } else {
                return 'No description found.';
            }
        }
        let title = name(pageData);
        console.log(title);
        let breakRegex = /<br>/gi;
        let summary = description(pageData).replace(breakRegex, '');
        //console.log(summary);
        try {
            let aniSearch = new Discord.RichEmbed();
            aniSearch.setTitle(title).setDescription(summary).setColor([Math.round(255*Math.random()),Math.round(255*Math.random()),Math.round(255*Math.random())]);
            msg.reply(aniSearch);
        } catch (error) {
            handleError(error);
        }    
    }
    function handleError(error) {
        console.error(error);
    }
}

client.login('NTU2NjAyNzUxNDY3OTEzMjE3.D28Jsw.fSzMHJZKyq0WSLkQTTSm2AAiUJY')