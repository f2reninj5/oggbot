# Oggbot: Update v3.0

## Refactored Code
The brains behind the face that you all know and love have been programmed from scratch.
- **Discord User ID Dependence**
Oggbot is no longer dependent on Minecraft user IDs so you don’t have to link your Minecraft account to use the features.
- **Organisation**
Oggbot now comprises a consistent code style and uses more subroutines and files to decompose complex systems into manageable chunks.
- **Oggbot Module**
The program now has its own module containing common subroutines and a brand new Oggbot User class.
- **Oggbeta**
Oggbeta got some love too and got a complete refactor in the style of the main Oggbot program for testing purposes.

## Discord Updates
With Discord’s new API v9 update, Oggbot now has access to new features like new app commands, buttons, threads, and more.

## Application Commands
You can now utilise Oggbot via a new interaction system.
- **Text commands**
Typing “/” brings up a list of all commands provided by Oggbot. They have descriptions and stricter parameters so there should be no more confusion about a command’s function.
- **User commands**
Right-clicking on a user will show an “apps” option now where you can use Oggbot commands on a specific user, like “avatar” or “profile”.
- **Message commands**
In the same way, you can right-click on a message and access commands like “reverse”.

## Command Changes
Here are the biggest noticeable changes to the commands.
- **Help command**
This command is now known as the command command (I never noticed how funny that sounded before).
- **Profile command**
You can now find out more about people on the server by viewing their profile. You can customise your own with a personal title, description, and location. You will also see your balance and birthday all in one place.
- **Birthday command**
The previous birthday command was vague at times but now is split into subcommands for intuitive use.
You will now see how old someone is when viewing their birthday, or how old someone will be when looking at the nearest upcoming birthday.
- **Lottery command**
Lottery “stats” is now known as lottery “information” and shows information about the current lottery in a neater manner.
There is a new “winners” subcommand that shows the most recent lottery winners and how much they earned.
- **Caption command**
You must now pass your top and bottom text in as arguments before submitting your image.
- **Top command**
The “top” command is now known as “leaderboard”.
- **Pay command**
This command now has a button to confirm your transaction instead of a reaction.

## Jobs
Oggbot now contains a new “job” system for managing scheduled tasks.
- **Available**
This job’s purpose is to display who is available or occupied on a certain day for events like games. You can update your status by pressing the appropriate button.
- **Birthday**
Every day, this job will check for people whose birthday it is. Subsequently, it will announce that they have grown up.
- **Chains**
If three unique people post the same message in the same channel, in a row, Oggbot will follow up with the same message.
- **Daily**
Resets daily values at midnight.
- **Lottery**
Draws a lottery winner and announces them. It also appends the winner to the winners list.

## Transparency
The process behind Oggbot development can now be viewed by anyone!
- **Github**
You can access the Oggbot source code for free at https://github.com/f2reninj5/oggbot.
- **Trello**
Update plans and progress are now visible on Trello at https://trello.com/oggbot.
- **Discord**
A good place for testing and feedback is the dedicated development server at https://discord.gg/vEBFXmsWHa. You can apply to test beta features or vote on polls.
