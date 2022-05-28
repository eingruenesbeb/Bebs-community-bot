# Beb's Community Bot

## About:
This repository houses the files for the (as the name might suggest) Discord Community Bot of (mainly) a server called "Beb's Raumschiff".
When you read this, that probably means, that it's decided that the code for this bot should be public. In that case, feel free to fork or clone and modify and redistribute any files here.
The features of this bot are quite specific, so you might want to edit a few things around here and there. 

## Dependencies:
These are the packages you actually have to download. If you want a full list of all dependencies, please take a look at package-lock.json.
- Node.js
- Discord.js
- sequelize 
- sqlite3
- log-timestamp (optional)

## Features:
- Basic capability to react to button pushes on messages
- A system called "Trust-System", which allows for a karma system on Discord servers

## Planned features:
- Basic moderation and administration tools
- Advanced moderation and administration tools
- Reaction Roles
- Proper support for creating embedded messages on the fly, with user input possibilities like buttons
- Ability to play music in voice-channels
- Switch from guild to application commands
- Web-Dashboard for easy configuration.
- Support for multiple languages.
- Team planner for server staff

## Installation/Usage Guide:
- In order for the Bot to function properly, the following steps are necessary:
    1. *Recommended:*  Install "node version manager" (nvm). To do this please check out its [GitHub-Repo](https://github.com/nvm-sh/nvm "GitHub-Repo")
    2. Install node.js. To do this download and install the LTS-Version (v16.15.0 at the time of writing) on the [nodejs-homepage](https://nodejs.org/en/ "nodejs-homepage") website, or the next steps in the guide for nvm.
    3. Install a package manager for node of your choice.
    4. Install all necessary dependencies using the package manager. (Command for npm: `npm ci`)
    5. Make a new file titled: "config.json", copy-paste the contents of "config-template.json" in there (you can also just rename the file) and follow the instructions there.
    6. To register the commands, please use navigate to the folder the files for the bot are in in the terminal and use `node deploy-commands.js`
    7. Now you're ready to use the bot. Start it either via the command `node main.js` or better yet, a process manager like pm2.

- Now let's see, how to use the bot:
    - Database: The database used by the bot is a single sqlite3 file. It is located in "./data/database.sqlite", once you've started the bot at least once. At the moment it is exclusively used for the Trust-System, but can be used for anything you want to store really. You can configure it in ./database-setup.js using the module sequelize. The main upside to this setup is, that it is lightweight and easy to manage. Ideal, for private and small bots. If you have bigger aspirations though or have an external database, it might be a consideration to switch to another system. For that you can still use sequelize, but you might wanna take an extra look at it's [documentation](https://sequelize.org/api/v6/).
    - To send an embed put it in the ./embeds folder and. You might want to follow the examples in there or better yet follow the documentation on  embeds on [discord.js guide on embeds](https://discordjs.guide/popular-topics/embeds.html). Once you're done with sending all your custom messages and embeds, you should change the file extention to .txt, delete or move the files for them. Otherwise, the bot will send them on each restart.If you want the bot to react to any interactions that might be on your custom messages, take a look at "./events/interactionCreate".
    - The biggest feature (yet) is be the Trust-System:
        - Synopsis: This is a tool, to award active and well behaved server members with additional permissions and/or roles. And in reverse restrict unruly members.
        - Defaults; The default settings for any server are:
            - Server enabled: false
            - Karma per message sent: 1
            - Karma per message deleted by a moderator: 0
            - Karma per minute spent in a voice-channel: 5
            - Karma per Time-Out: -25 + duration of time-out in hours rounded down to the nearest integer * (-25)
            - Karma per Kick: -100
            - Karma per Ban: -1000
        - Application-/Guild-commands:
            - `/trust server`: Is a guild command to use for setting server preferences, such as if it is enabled and the different amounts of karma per action. If all options are omitted, just an info about the current settings is sent.
            - `/trust edit`: Used to manually change the amount of karma a user has.
            - `/trust usertoggle`: Changes, whether or not the trust system applies to a certain user.
            - `/trust role`: Let's you set up or edit a role to be automatically mangaged via the trust system. Check the option descriptions for details. If all options are ommited and the role is already managed by the system, a query will be sent asking the user, if he either wants to view how the role is set up or removed from the system.
            - `/trust show`: Let's you see, how much karma a user has. If no additional argument is given, the command returns the amount, the issuer has.
    - Additional Commands: 
        - `/ping` Returns info, on how long it takes for the bot to respond

## Useful Links:
- Please check out the wonderful [documentation](https://discord.js.org/#/docs/main/stable/general/welcome "documentation") and [guide](https://discordjs.guide/ "guide") of Discord.js. Some code snippets from there are in here too.
- In order to make a discord bot, you have to create one first over at the [Discord's developer portal](https://discord.com/login?redirect_to=%2Fdevelopers%2Fapplications "Discord's developer portal")
- It might also be useful to check Discord's [documentation](https://discord.com/developers/docs/intro "documentation") to see, what is possible with a bot.
- Other:
	- Nodejs: https://nodejs.org/en/
	- Nvm: https://github.com/nvm-sh/nvm
	- Npm: https://docs.npmjs.com/

## Last but not least:

That's it for now. I hope, this helps you to set up a bot on your own, be it using this code relatively unchaged, heavily modified or even just as an example.
In any case, happy coding and much success.
*~ Beb*
