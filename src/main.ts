import './style.css'

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
/////////////////////////
// Question Variables
/////////////////////////
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
// Tracks which player is active
let activePlayer:number = 0;
// Tracks to see if both player have answered current question.
let answerSubmitted:Array<boolean> = [false, false];

/////////////////////////
// ANSWER VARIABLES
/////////////////////////
let answerURL:string;

$.ajax({
  url: `${baseURL}/spaces/${space}/environments/${environment}/entries?access_token=${token}`
}).then(function (data) {
  triviaData = data;
  // Renders weather data on page.
  console.log(triviaData.items[0]);
  triviaData = data;
  startGame();
  
}, function (error) {
  console.log('bad request: ', error);
});



const startGame = () => {
  activePlayer = 0;
  answerSubmitted.forEach(element => 
    {
    element = false;
    });
  questionCount = 0;
  $questionContainer.css('display', 'flex')
  displayActivePlayer();
  askQuestion();
}


//////////////////////////////////
// Question Card Population Section
//////////////////////////////////

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



////////////////////////
// Active player functions
////////////////////////

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





//////////////////////////////////
// Answer Submission Section
//////////////////////////////////

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


//////////////////////////////////
// DISPLAY ANSWER SECTION
//////////////////////////////////
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

const getImageURL = function(){
  triviaData.data
}


const showAnswer = function() {
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
  $answerText.text('Answer' + currentQuestion.fields.correctAnswer)
  $answerBlurb.text(currentQuestion.fields.blurb)
}

const nextRound = function(){
  $answerContainer.css("display","none");
  for (let i = 0; i < answerSubmitted.length; i++) {
    answerSubmitted[i] =  false;
  }
  questionCount += 1;
  $questionContainer.css("display","flex");
  switchPlayers();
  
}

const proceed = function() {
  if(questionCount < 20){  
    nextRound();
  }
}

$("#proceed-button").on('click', proceed)



  




