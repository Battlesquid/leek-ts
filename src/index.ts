// import "reflect-metadata";
// import {createConnection} from "typeorm";
// import {User} from "./entity/User";

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));

import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

import { Client, Intents } from "discord.js"
import { loadCommands, loadEvents } from "./loaders"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});


console.log('h')

loadCommands("./commands");
loadEvents(client, "./events")
client.login(process.env.TOKEN)

// (async () => {
//     await loadCommands("./commands");
//     await 
//     console.log(process.env.TOKEN)

// })(); 