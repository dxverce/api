const fs = require("fs");
const { MessageEmbed } = require("discord.js");

const {
    postListing,
    getListings,
    deleteListing,
} = require("./apiHandler");

const cache = {};

function sleep(milliseconds) {
    try {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    } catch (e) {}
}

function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}

async function sendUserLog(client, id, embed) {
    try {
        if (!cache[id].msg) {
            await client.users.fetch(id);
            const user = client.users.cache.get(id);

            cache[id].msg = await user.send(embed);
        } else {
            await cache[id].msg.edit(embed);
        }
    } catch (e) {}
}

async function autoPoster(id, client) {
    try {
        let userFile = `./users/${id}.json`;
        userFile = JSON.parse(fs.readFileSync(`${userFile}`));

        let {
            key,
            secret,
            username,
            url,
            listings,
            shipping,
            expire,
            autoPost,
            timeInterval,
            premium,
            purgeTime,
            avatar,
            owner,
        } = userFile;

        let factor = userFile.priceFactor;
        if (!factor) factor = 1;

        if (premium && autoPost) {
	    listings = Object.fromEntries(Object.entries(listings).filter(([key, value]) => !value.isDisabled));

            let listingId = shuffle(Object.keys(listings))[0];
            let toPost = listings[listingId];
            let { name, description, price, image, tags } = toPost;

            let listingTags = null;
            if (tags && tags.length != 0) listingTags = tags;
            if (!listingTags)
                listingTags = [
                    `Name : ${name}`,
                    `Price : ${price * factor}`,
                    `Delivery : Fast`,
                ];

            price = price * factor;
            if (price < 0.75) price = 0.75;

            let posted = await postListing(
                key,
                secret,
                name,
                description,
                price,
                owner,
                image,
                shipping,
                expire,
                listingTags
            );

            if (!cache[id])
                cache[id] = {
                    msg: null,
                    fields: [],
                };

            cache[id].fields.push();

            let listingMsg = `• Successfully Posted \`${name}\``;

            let embed = new MessageEmbed()
                .setAuthor(username, avatar)
                .setColor("GREEN")
                .setTimestamp()
                .setTitle("Auto Post Gameflip");

            if (!posted)
                listingMsg = `• There was an Error Posting \`${name}\``;

            if (cache[id].fields.length >= 10) {
                cache[id].fields.shift();
            }

            cache[id].fields.push(listingMsg);

            embed.setDescription(cache[id].fields.join("\n"));

            await sendUserLog(client, id, embed);
            await sleep(timeInterval * 1000);
            return await autoPoster(id, client);
        } else return;
    } catch (e) {
        console.error(e);
    }
}

async function autoPurger(id, client) {
    try {
        let userFile = `./users/${id}.json`;
        userFile = JSON.parse(fs.readFileSync(`${userFile}`));

        let {
            key,
            secret,
            username,
            url,
            listings,
            shipping,
            expire,
            autoPost,
            timeInterval,
            premium,
            purgeTime,
            avatar,
            owner,
        } = userFile;

        if (premium && autoPost) {
            let available = await getListings(key, secret, owner);

            for (let i in available) {
                let listing = available[i];

                let listingId = listing.id;
                let createdAt = listing.created;

                let difference =
                    (new Date().getTime() - new Date(createdAt).getTime()) /
                    1000;

                if (difference < purgeTime) continue;

                let embed = new MessageEmbed()
                    .setAuthor(username, avatar)
                    .setColor("GREEN")
                    .setTimestamp()
                    .setTitle("Auto Post Gameflip");

                if (!cache[id])
                    cache[id] = {
                        msg: null,
                        fields: [],
                    };

                if (cache[id].fields.length >= 10) {
                    cache[id].fields.shift();
                }
                await deleteListing(key, secret, listingId);
                cache[id].fields.push(
                    `• Removed \`${listingId}\` [Time Since Posted : ${difference}s]`
                );
                embed.setDescription(cache[id].fields.join("\n"));
                await sendUserLog(client, id, embed);
                await sleep(10000);
            }
            await sleep(30000);
            await autoPurger(id, client);
        } else return;
    } catch (e) {
        await sleep(20000);
        await autoPurger(id, client);
    }
}

async function autoPostAll(client) {
    const userFolder = fs.readdirSync("./users");
    for (let i in userFolder) {
        let userFile = "./users/" + userFolder[i];
        userFile = userFile.split("/");
        userFile = userFile[userFile.length - 1];
        userFile = userFile.split(".");
        userFile = userFile[0];
	console.log(userFile);
        autoPoster(userFile, client);
        autoPurger(userFile, client);
        await sleep(1000);
    }
}

module.exports = {
    autoPoster,
    autoPostAll,
    autoPurger,
};
