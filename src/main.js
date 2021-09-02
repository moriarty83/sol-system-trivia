$("#question-container").hide();
$("#answer-container").hide();
$("#game-over-container").hide();
$("#start-game").hide();
/////////////////////////
// API VARIABLES
/////////////////////////
var baseURL = "https://cdn.contentful.com";
var space = "bxikrw4zp6pm";
var token = "OGPHs2wuhyz3M31yy93RTXoRfGrlfFS7Q6xNe3C4tuo";
var environment = "master";
// Data from API
var triviaData;
/////////////////////////
// HTML Variables
/////////////////////////
// Landing Page HTML
var $landingContainer = $("#landing-container");
// Question Section HTML
var $questionContainer = $("#question-container");
var $questionText = $("#question-text");
// Answer Section HTML
var $answerContainer = $("#answer-container");
var $answerQuestion = $("#answer-question");
var $playerOneOutcome = $("#player-one-outcome");
var $playerTwoOutcome = $("#player-two-outcome");
var $answerImage = $("#answer-image");
var $answerText = $("#answer-text");
var $answerBlurb = $("#answer-blurb");
// Game Over Section HTML
var $gameOverContainer = $("#game-over-container");
var $winnerText = $("#winner-text");
var $playerOneScore = $("#player-one-score");
var $playerOneBreakdown = $("#player-one-breakdown");
var $playerTwoBreakdown = $("#player-two-breakdown");
/////////////////////////
// Game Manager Variables
/////////////////////////
var gameLength = 20;
var questions;
var currentQuestion;
// Stores correct answer index
var answerKey = Array(20);
// Array that is shuffled to randomize loction of correct answer.
var questionOrder = [0, 1, 2, 3];
// Tracks which question game is on.
var questionCount = 0;
/////////////////////////
// PLAYER VARIABLES
/////////////////////////
// A 2x20 array for both players, scores stored for each question.
var playerScore = [new Array(2), new Array(20)];
// Total Score Array for both Players
var totalScores = [0, 0];
// Tracks which player is active
var activePlayer = 0;
// Tracks to see if both player have answered current question.
var answerSubmitted = [false, false];
/////////////////////////
// LANDING PAGE SECTION
/////////////////////////
//#region 
// Get questions from API.
if (triviaData === undefined) {
    $.ajax({
        url: baseURL + "/spaces/" + space + "/environments/" + environment + "/entries?access_token=" + token
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
}
var startGame = function () {
    gameLength = +$("#game-length").val();
    gameLength > 20 ? gameLength = 20 : gameLength = gameLength;
    gameLength < 1 ? gameLength = 1 : gameLength = gameLength;
    shuffle(questions);
    activePlayer = 0;
    for (var i = 0; i < answerSubmitted.length; i++) {
        answerSubmitted[i] = false;
    }
    ;
    questionCount = 0;
    $landingContainer.fadeOut();
    displayActivePlayer();
    askQuestion();
    setTimeout(function () { $questionContainer.fadeIn(); }, 1000);
    setTimeout(function () { alert("It is now Player " + (activePlayer + 1) + "'s Turn"); }, 1000);
};
$("#start-game").on('click', startGame);
//#endregion
//////////////////////////////////
// Question Card Population Section
//////////////////////////////////
//#region 
// Fisher-Yates (aka Knuth) Shuffle 
// Thanks to coolaj86 on Stack Overflow 
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var _a;
    var currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        _a = [
            array[randomIndex], array[currentIndex]
        ], array[currentIndex] = _a[0], array[randomIndex] = _a[1];
    }
    return array;
}
// Assigns value to answer key for scorekeeping purposes.
function populateAnswerKey() {
    // order array get shuffled.
    // Index of value 0 is where correct answer will populate on page.
    shuffle(questionOrder);
    console.log(questionOrder);
    answerKey[questionCount] = questionOrder.indexOf(0);
    console.log(answerKey);
}
// Assign questions and options to radio inputs.
function populateQuestionAnswer(question) {
    console.log($questionText);
    $questionText.text(question.fields.question);
    var answers = [question.fields.correctAnswer, question.fields.wrongAnswer1, question.fields.wrongAnswer2, question.fields.wrongAnswer3];
    for (var i = 0; i < answers.length; i++) {
        $("#answer" + questionOrder.indexOf(i)).text(answers[i]);
    }
}
// Checks Assets to Image of current Question and matches the image URL
function findImageURL() {
    for (var _i = 0, _a = triviaData.includes.Asset; _i < _a.length; _i++) {
        var asset = _a[_i];
        if (currentQuestion.fields.image.sys.id == asset.sys.id) {
            return "https:" + asset.fields.file.url;
        }
    }
    return;
}
function askQuestion() {
    // Shuffle question order and identify correct answer index. Assing to answer Key.
    populateAnswerKey();
    currentQuestion = triviaData.items[questionCount];
    currentQuestion.imageURL = findImageURL();
    populateQuestionAnswer(currentQuestion);
}
//#endregion
////////////////////////
// Active player functions
////////////////////////
//#region 
// Updates Active Player
function updateActivePlayer() {
    activePlayer = (activePlayer == 0) ? (activePlayer = 1) : (activePlayer = 0);
    console.log("active player = " + activePlayer);
    displayActivePlayer();
}
// Displays current player text.
function displayActivePlayer() {
    if (activePlayer === 0) {
        $(".active-player").text("Player 1 Turn");
    }
    if (activePlayer === 1) {
        $(".active-player").text("Player 2 Turn");
    }
}
//#endregion
//////////////////////////////////
// Answer Submission Section
//////////////////////////////////
//#region 
// Takes answer number as argument, compares with answer key.
// Then sets score for that round in the playerScore array.
var checkAnswer = function (playerAnswer) {
    if (playerAnswer === 4) {
        console.log("Pass");
        playerScore[activePlayer][questionCount] = 0;
    }
    else if (playerAnswer === answerKey[questionCount]) {
        console.log("Correct");
        playerScore[activePlayer][questionCount] = 3;
    }
    else {
        console.log("Incorrect");
        playerScore[activePlayer][questionCount] = -1;
    }
    answerSubmitted[activePlayer] = true;
    console.log("answerSubmitted: " + answerSubmitted);
    console.log("both answered: " + bothAnsweredCheck());
    bothAnsweredCheck() ? showAnswer() : (switchPlayers());
};
// Switch Players OR Display Answer Section.
function bothAnsweredCheck() {
    return answerSubmitted.every(function (element) {
        console.log(element);
        return element == true;
    });
}
function switchPlayers() {
    if (!bothAnsweredCheck()) {
        $questionContainer.fadeOut();
        setTimeout(function () { $questionContainer.fadeIn(); }, 1000);
        $("input[id='1']").prop("checked", true);
        window.scrollTo(0, 0);
    }
    updateActivePlayer();
    displayActivePlayer();
    askQuestion();
    setTimeout(function () { alert("It is now Player " + (activePlayer + 1) + "'s Turn"); }, 1001);
}
// Listener for Submit Button.
$("#submit-button").on('click', function (event) {
    event.preventDefault();
    var $answer = +$("input[name='answer']:checked").val();
    console.log($answer);
    checkAnswer($answer);
});
//#endregion
//////////////////////////////////
// DISPLAY ANSWER SECTION
//////////////////////////////////
//#region 
var fillAnswerText = function (playerIndex) {
    //Player index should be 0 or 1.
    if (playerScore[playerIndex][questionCount] === 0) {
        return "Player " + (playerIndex + 1) + " - Passed<br>\n      + 0 Points<br>\n      Score: " + totalScores[playerIndex];
    }
    else if ((playerScore[playerIndex][questionCount] > 0)) {
        return "Player " + (playerIndex + 1) + " - Correct<br>\n      + 3 Points<br>\n      Score: " + totalScores[playerIndex];
    }
    else {
        return "Player " + (playerIndex + 1) + " - Incorrect<br>\n    - 1 Points<br>\n    Score: " + totalScores[playerIndex];
    }
};
var sumScores = function () {
    for (var i = 0; i < playerScore.length; i++) {
        totalScores[i] = 0;
        for (var _i = 0, _a = playerScore[i]; _i < _a.length; _i++) {
            var score = _a[_i];
            if (score !== undefined) {
                console.log(score);
                totalScores[i] = totalScores[i] + score;
            }
        }
        console.log("score: " + totalScores[i]);
    }
};
var showAnswer = function () {
    window.scrollTo(0, 0);
    sumScores();
    // Hide question HTML, show Answer HTML
    $questionContainer.fadeOut();
    // $questionContainer.css("display","none");
    $answerQuestion.text(currentQuestion.fields.question);
    // Populates status of player guesses.
    $playerOneOutcome.html(fillAnswerText(0));
    $playerTwoOutcome.html(fillAnswerText(1));
    console.log("imageURL = " + currentQuestion.imageURL);
    $answerImage.attr('src', currentQuestion.imageURL);
    $answerText.text('Answer: ' + currentQuestion.fields.correctAnswer);
    $answerBlurb.text(currentQuestion.fields.blurb);
    setTimeout(function () { $answerContainer.fadeIn(); }, 1000);
};
var resetAnswerSubmitted = function () {
    for (var i = 0; i < answerSubmitted.length; i++) {
        answerSubmitted[i] = false;
    }
};
var mercyKilling = function () {
    if (Math.abs(totalScores[0] - totalScores[1]) > 15) {
        return true;
    }
    else {
        return false;
    }
};
// If game isn't over, reeenters question phase.
var nextRound = function () {
    window.scrollTo(0, 0);
    $answerContainer.fadeOut();
    resetAnswerSubmitted();
    questionCount += 1;
    setTimeout(function () { $questionContainer.css("display", "flex"); }, 1000);
    switchPlayers();
};
var proceed = function () {
    if (mercyKilling()) {
        displayEndGame();
    }
    else if (questionCount < gameLength - 1) {
        nextRound();
    }
    else {
        displayEndGame();
    }
};
$("#proceed-button").on('click', proceed);
//#endregion
//////////////////////////////////
// GAME OVER ANSWER SECTION
//////////////////////////////////
//#region 
var crownWinner = function () {
    console.log("player 1 score: " + playerScore[0]);
    console.log("player 2 score: " + playerScore[1]);
    if (+totalScores[0] == +totalScores[1]) {
        $winnerText.text("Draw");
        return;
    }
    if (+totalScores[0] > +totalScores[1]) {
        $winnerText.text("Player 1 Wins");
        return;
    }
    if (+totalScores[1] > +totalScores[0]) {
        $winnerText.text("Player 2 Wins");
        return;
    }
};
var displayScores = function () {
    $playerOneScore.text("Player 1\n" + totalScores[0] + " Points");
    $playerOneScore.text("Player 2\n" + totalScores[1] + " Points");
};
var scoreBreakdow = function () {
    for (var i = 0; i < playerScore.length; i++) {
        var correct = 0;
        var incorrect = 0;
        var pass = 0;
        for (var _i = 0, _a = playerScore[i]; _i < _a.length; _i++) {
            var score = _a[_i];
            if (score !== undefined) {
                if (score > 0) {
                    correct = correct + 1;
                }
                if (score < 0) {
                    incorrect = incorrect + 1;
                }
                if (score === 0) {
                    pass = pass + 1;
                }
            }
        }
        if (i === 0) {
            $playerOneBreakdown.html("<p>Player 1</p>\n      <ul>\n      <li>Correct: " + correct + "</li>\n      <li>Incorrect: " + incorrect + "</li>\n      <li>Pass: " + pass + "</li>\n      ");
        }
        if (i === 1) {
            $playerTwoBreakdown.html("<p>Player 2</p>\n      <ul>\n      <li>Correct: " + correct + "</li>\n      <li>Incorrect: " + incorrect + "</li>\n      <li>Pass: " + pass + "</li>\n      ");
        }
    }
};
var displayEndGame = function () {
    crownWinner();
    displayScores();
    scoreBreakdow();
    $answerContainer.fadeOut();
    setTimeout(function () { $gameOverContainer.fadeIn(); }, 1000);
};
// Set score playerScore array and totalScores to 0.
var resetScores = function () {
    for (var i = 0; i < totalScores.length; i++) {
        for (var j = 0; j < playerScore.length; j++) {
            playerScore[i][j] = 0;
        }
        totalScores[i] = 0;
    }
};
var returnHome = function () {
    resetAnswerSubmitted();
    resetScores();
    activePlayer = 0;
    $gameOverContainer.fadeOut();
    $("#game-length").val(gameLength);
    setTimeout(function () { $landingContainer.fadeIn(); }, 1000);
};
$("#return-button").on('click', returnHome);
//#endregion
