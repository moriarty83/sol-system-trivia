# Sol System Trivia
By C. Marshall Moriarty
### A two player, 20 question trivia game about the Solar System.

## Features
- 20 questions about the Solar System
- Cool images from NASA accompany every answer.
- Fun informational blurbs from NASA come with every answer.
- Mobile First Design
- Randomized question order.


## How to Play
Sol System Trivia is a game meant for two players on a single mobile phone or other device. A phone is suggested becaues it's easily passed betwee players. 

1. Once a game length is specified and game begun, a Player 1 is prompted with a question. They select an answer and submit it. 

2. Player 1 then hands the device to Player 2 to submit an answer to the same question. 

3. Once both players have answered the question, the answer is provided for both players to look at, points asigned. 

4. When the Proceed button is pressed, the process begins anew with a new question being prompted for Player 1. 

5. When the number of questions equal to the Game Length that was set is reached, the game is over. Players are shown a synposis screen and they can then return to the home screen to play again.

#### Scoring
- Correct Answer: +3 Points
- Incorrect Answer: -1 Point
- Pass: 0 Points

## Technologies
- Headless API
- TypeScript
- JavaScript
- CSS


## Goals/Update Objectives
- COMPLETED! Mercy Rule - If one player is more than 15 points ahead, the game
- COMPLETED! Variable game length. 
- Save game progress in local memory.

## Wireframe/Screenshots

![Wireframe](src/images/TriviaWireframe.jpg)
![Mobile Screenshot](src/images/mobilelanding.png) ![Mobile Screenshot](src/images/mobilequestion.png) ![Mobile Screenshot](src/images/mobileanswer.png)

## To Do
- FadeIn/Out on question change.
- Make radio buttons reset to one.

## Issues
- Reload bug: Page seems to unexpected reload for unknown reason resetting game.
- Copy Editing Needed for Questions
    - What is the solar system's largest Asteroid: Eros appears twice.
- Some questions have incorrect images.