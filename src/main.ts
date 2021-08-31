import './style.css'

$("#question-container").hide();
$("#answer-container").hide();
$("#game-over-container").hide();
$("#start-game").hide();

interface Question {
  fields: {
    question: string;
    correctAnswer: string;
    wrongAnswer1: string;
    wrongAnswer2: string;
    wrongAnswer3: string;
    
    blurb: string;
    image: {
      sys:{id:string;}
    }
  }
  imageURL?: string;
}

/////////////////////////
// API VARIABLES
/////////////////////////
const baseURL:string = "https://cdn.contentful.com";
const space:string = "bxikrw4zp6pm";
const token:string = "OGPHs2wuhyz3M31yy93RTXoRfGrlfFS7Q6xNe3C4tuo";
const environment:string = "master";

// Data from API
let triviaData:any;

/////////////////////////
// HTML Variables
/////////////////////////
// Landing Page HTML
const $landingContainer:JQuery = $("#landing-container")

// Question Section HTML
const $questionContainer:JQuery = $("#question-container")
const $questionText:JQuery = $("#question-text");

// Answer Section HTML
const $answerContainer:JQuery = $("#answer-container");
const $answerQuestion:JQuery = $("#answer-question");

const $playerOneOutcome:JQuery = $("#player-one-outcome");
const $playerTwoOutcome:JQuery = $("#player-two-outcome");

const $answerImage:JQuery = $("#answer-image");
const $answerText:JQuery = $("#answer-text");
const $answerBlurb:JQuery = $("#answer-blurb");

// Game Over Section HTML
const $gameOverContainer:JQuery = $("#game-over-container")
const $winnerText:JQuery = $("#winner-text")
const $playerOneScore:JQuery = $("#player-one-score")
const $playerOneBreakdown:JQuery = $("#player-one-breakdown")
const $playerTwoBreakdown:JQuery = $("#player-two-breakdown")



/////////////////////////
// Game Manager Variables
/////////////////////////
let gameLength:number = 20;
let questions:Question[];
let currentQuestion:Question;
// Stores correct answer index
const answerKey:number[] = Array<number>(20);
// Array that is shuffled to randomize loction of correct answer.
let questionOrder:number[] = [0, 1, 2, 3]
// Tracks which question game is on.
let questionCount:number = 0;


/////////////////////////
// PLAYER VARIABLES
/////////////////////////
// A 2x20 array for both players, scores stored for each question.
const playerScore:number[][] = [new Array<number>(2), new Array<number>(20)]
// Total Score Array for both Players
const totalScores:number[] = [0, 0];

// Tracks which player is active
let activePlayer:number = 0;
// Tracks to see if both player have answered current question.
let answerSubmitted:Array<boolean> = [false, false];

/////////////////////////
// ANSWER VARIABLES
/////////////////////////
let answerURL:string;

/////////////////////////
// LANDING PAGE SECTION
/////////////////////////
//#region 
// Get questions from API.
$.ajax({
  url: `${baseURL}/spaces/${space}/environments/${environment}/entries?access_token=${token}`
}).then(function (data) {
  triviaData = data;
  // Renders weather data on page.
  console.log(triviaData.items[0]);
  triviaData = data;
  questions = triviaData.items;  
  $("#start-game").fadeIn();
}, function (error) {
  console.log('bad request: ', error);
});

const startGame = () => {
  gameLength = +$("#game-length").val()!;
  shuffle(questions);
  activePlayer = 0;
  answerSubmitted.forEach(element => 
    {
    element = false;
    });
  questionCount = 0;
  $landingContainer.fadeOut();
  displayActivePlayer();
  askQuestion();
  setTimeout(function(){$questionContainer.fadeIn()}, 1000)
}

$("#start-game").on('click', startGame)

//#endregion
//////////////////////////////////
// Question Card Population Section
//////////////////////////////////
//#region 
// Fisher-Yates (aka Knuth) Shuffle 
// Thanks to coolaj86 on Stack Overflow 
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array:Array<any>) {
  var currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Assigns value to answer key for scorekeeping purposes.
function populateAnswerKey(questionIndex:number){
  // order array get shuffled.
  // Index of value 0 is where correct answer will populate on page.
  shuffle(questionOrder);
  console.log(questionOrder);
  answerKey[questionCount] = questionOrder.indexOf(0);
  console.log(answerKey);
}

// Assign questions and options to radio inputs.
function populateQuestionAnswer(question:Question){
  console.log($questionText);
  $questionText.text(question.fields.question);
  let answers:Array<string> = [question.fields.correctAnswer, question.fields.wrongAnswer1, question.fields.wrongAnswer2, question.fields.wrongAnswer3]
  for (let i = 0; i < answers.length; i++) {
    $(`#answer${questionOrder.indexOf(i)}`).text(answers[i])
  }
}

// Checks Assets to Image of current Question and matches the image URL
function findImageURL(){
  for(let asset of triviaData.includes.Asset){
    if(currentQuestion.fields.image.sys.id == asset.sys.id){
      return "https:"+ asset.fields.file.url
    }
  }
  return
}

function askQuestion(){
  // Shuffle question order and identify correct answer index. Assing to answer Key.
  populateAnswerKey(questionCount);
  currentQuestion = triviaData.items[questionCount]
  currentQuestion.imageURL = findImageURL();
  console.log(currentQuestion.imageURL);
  populateQuestionAnswer(currentQuestion)
  console.log(currentQuestion);
  console.log(triviaData)
}
//#endregion
////////////////////////
// Active player functions
////////////////////////
//#region 
// Updates Active Player
function updateActivePlayer(){
  activePlayer = (activePlayer==0) ? (activePlayer = 1) : (activePlayer=0);
  console.log("active player = " + activePlayer);
  displayActivePlayer();
}

// Displays current player text.
function displayActivePlayer(){
  if(activePlayer === 0){
    $(".active-player").text("Player 1 Turn")
  }
  if(activePlayer === 1){
    $(".active-player").text("Player 2 Turn")
  }
}
//#endregion
//////////////////////////////////
// Answer Submission Section
//////////////////////////////////
//#region 
// Takes answer number as argument, compares with answer key.
// Then sets score for that round in the playerScore array.
const checkAnswer = (playerAnswer:number) => 
  {
    if(playerAnswer === 4){
      console.log("Pass");
      playerScore[activePlayer][questionCount] = 0;
    }
    else if(playerAnswer === answerKey[questionCount]){
      console.log("Correct");
      playerScore[activePlayer][questionCount] = 3;
    }
    else
    {
      console.log("Incorrect");
      playerScore[activePlayer][questionCount] = -1;
    }
    answerSubmitted[activePlayer] = true;
    console.log("answerSubmitted: " + answerSubmitted);
    console.log("both answered: " + bothAnsweredCheck());
    bothAnsweredCheck()? showAnswer() : (switchPlayers());
  }

// Switch Players OR Display Answer Section.
function bothAnsweredCheck(){
  return answerSubmitted.every((element) => {
    console.log(element);
    return element==true})
}

function switchPlayers(){
  updateActivePlayer();
  displayActivePlayer();
  askQuestion();
  alert(`It is now Player ${activePlayer+1}'s Turn`)
}

// Listener for Submit Button.
$("#submit-button").on('click', function(event){
  event.preventDefault();
  let $answer = +$("input[name='answer']:checked").val()!;
  console.log($answer);
  checkAnswer($answer);
})

//#endregion
//////////////////////////////////
// DISPLAY ANSWER SECTION
//////////////////////////////////
//#region 
const fillAnswerText = function (playerIndex:number){
  //Player index should be 0 or 1.
  if(playerScore[playerIndex][questionCount] === 0){
    return `Player ${playerIndex+1} \n Passed`
  }
  else if ((playerScore[playerIndex][questionCount] > 0)){
    return `Player ${playerIndex+1} \n Correct`
  }
  else{
    return `Player ${playerIndex+1} \n Wrong`
  }
}

const sumScores = function(){
  for (let i = 0; i < playerScore.length; i++) {
    totalScores[i]=0;
    for(let score of playerScore[i]){
      if(score !== undefined){
        console.log(score);
        totalScores[i] = totalScores[i] + score;
      }
    }
    console.log("score: " + totalScores[i])
  }
}


const showAnswer = function() {
  window.scrollTo(0, 0);
  sumScores();
  // Hide question HTML, show Answer HTML
  $questionContainer.fadeOut();
  // $questionContainer.css("display","none");
  $answerContainer.fadeIn();

  $answerQuestion.text(currentQuestion.fields.question)

  // Populates status of player guesses.
  $playerOneOutcome.text(fillAnswerText(0));
  $playerTwoOutcome.text(fillAnswerText(1));
  console.log("imageURL = " + currentQuestion.imageURL);
  $answerImage.attr('src', currentQuestion.imageURL!)
  $answerText.text('Answer: ' + currentQuestion.fields.correctAnswer)
  $answerBlurb.text(currentQuestion.fields.blurb)
}

const resetAnswerSubmitted = function(){
  for (let i = 0; i < answerSubmitted.length; i++) {
    answerSubmitted[i] =  false;
  }
}

// If game isn't over, reeenters question phase.
const nextRound = function(){
  window.scrollTo(0, 0);
  $answerContainer.css("display","none");
  resetAnswerSubmitted();
  questionCount += 1;
  $questionContainer.css("display","flex");
  switchPlayers();
  
}

const proceed = function() {
  if(questionCount < gameLength-1){  
    nextRound();
  }
  else {
    displayEndGame();
  }

}

$("#proceed-button").on('click', proceed)
//#endregion
//////////////////////////////////
// GAME OVER ANSWER SECTION
//////////////////////////////////
//#region 
const crownWinner = function(){

  console.log("player 1 score: " + playerScore[0])
  console.log("player 2 score: " + playerScore[1])
  if(+totalScores[0] == +totalScores[1])
  {
    $winnerText.text("Draw")
    return;
  }
  if(+totalScores[0] > +totalScores[1])
  {
    $winnerText.text("Player 1 Wins")
    return;
  }
  if(+totalScores[1] > +totalScores[0])
  {
    $winnerText.text("Player 2 Wins")
    return;
  }
}

const displayScores = function(){
  $playerOneScore.text(`Player 1\n${totalScores[0]} Points`);
  $playerOneScore.text(`Player 2\n${totalScores[1]} Points`);
}

const scoreBreakdow = function(){
  for(let i = 0; i < playerScore.length; i++){
    let correct:number = 0;
    let incorrect:number = 0;
    let pass:number = 0;
    for(let score of playerScore[i]){
      if (score !== undefined){
        if(score > 0){correct = correct+1}
        if(score < 0){incorrect = incorrect+1}
        if(score === 0){pass = pass+1}
      }
    }
    if(i===0){
      $playerOneBreakdown.html(`<p>Player 1</p>
      <ul>
      <li>Correct: ${correct}</li>
      <li>Incorrect: ${incorrect}</li>
      <li>Pass: ${pass}</li>
      `)
    }
    if(i===1){
      $playerTwoBreakdown.html(`<p>Player 2</p>
      <ul>
      <li>Correct: ${correct}</li>
      <li>Incorrect: ${incorrect}</li>
      <li>Pass: ${pass}</li>
      `)
    }
  }
}

const displayEndGame = function(){
  crownWinner();
  displayScores();
  scoreBreakdow();
  $answerContainer.fadeOut();
  setTimeout(()=>{$gameOverContainer.fadeIn()}, 1000)
}

// Set score playerScore array and totalScores to 0.
const resetScores = function(){
  for (let i = 0; i < totalScores.length; i++) {
    for(let score of playerScore[i]){
      score = 0;
    }
    totalScores[i]=0;
  }
}

const returnHome = function(){
  resetAnswerSubmitted();
  resetScores();
  activePlayer = 0;
  $gameOverContainer.fadeOut();
  $("#game-length").val(gameLength);
  setTimeout(()=>{$landingContainer.fadeIn()}, 1000)
}

$("#return-button").on('click', returnHome);

//#endregion







