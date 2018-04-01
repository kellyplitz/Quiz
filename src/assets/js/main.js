var cookies = {}
var user = null
var activeQuizName = null

$(document).ready(function(){
    $("#quiz-wrapper").fadeIn()
    $.getJSON("../assets/data.json")

    // Load nickname from cookie if it's returning visitor
    loadCookies()

    // Personalized welcome message
    if (cookies["user"] != null){
        $("#welcome p").html("Welcome back " + cookies["user"] +"!")
        $("#welcome input").hide()   
    } 
    
    // Store nickname in cookie
    $("#welcome button").click(function(){
        if (cookies["user"] != null) {
            user = new User(cookies["user"])
            startQuiz()

        } else if ( $("#welcome input").val().length >= 2 ) {
            user = new User(cookies["user"])
            startQuiz()
            createCookies()
        }   
    })
    
    
})
// --------------------------------------------------------------------------------------------------------------
function startQuiz(){
    // Animate screens
    $("#header__menu").delay(400).fadeIn()
    $("#welcome").fadeOut("fast")
    $('#quiz-form-wrapper').delay(400).fadeIn()

    // Set active quiz
    setQuiz($("#header__menu li .active"))    
}
function createCookies(){
    // Store nickname in cookie
    var cookie = "user=" + encodeURIComponent($("#welcome input").val())

    document.cookie = cookie
    loadCookies()    
}

function loadCookies(){
    var c=document.cookie.split('; ')
    for(var i=c.length-1;i >= 0;i--){
        var C=c[i].split('=')
        cookies[C[0]]=C[1]
    }
}

function setQuiz(e){
    // Tab switching CSS
    $(e).parent().parent().find("li").removeClass("active")
    $(e).parent().addClass("active")  

    // Get name of active quiz from selected tab
    activeQuizName = $("#header__menu .active").text().toLowerCase() 
    var indexOfActiveQuiz = null

    user.progress.forEach((e)=>{ 
        if(e['name']==activeQuizName) { 
            indexOfActiveQuiz = user.progress.indexOf(e)
        }
    })

    // Start new quiz
    if (indexOfActiveQuiz == null) {
        activeQuizObject = new Quiz(activeQuizName) // Object with question and ansewrs from JSON file
        user.progress.push({'name': activeQuizName,
                            'answers': {},
                            'score': 0 ,
                            'object': activeQuizObject })

        activeQuizObject.loadQuiz()

    // Or load unfinished one
    } else {  
        // Find activeQuizObject by activeQuizName
        user.progress.forEach((e)=>{ if(e['name']==activeQuizName) { activeQuizObject = e['object'] } })
        activeQuizObject.loadQuiz()
    }

    activeQuizObject.disableToFinish();
}

// ------------------------------------------------------------------------------------------------------------------------------
class User {
    constructor(name){
        this.name = name
        this.progress = []
    }

    registerAnswerSelection(order){
        // Register selected answer
        this.progress.forEach((e)=>{ 
            if(e['name']==activeQuizName) { 
                e['answers'][order] = $("input:checked" ).val()
            } 
        })

    }
    countScore(){
        var tempScore = 0

        // Find Quiz object and answers by activeQuizName
        this.progress.forEach((e)=>{ 
            if(e['name']==activeQuizName) { 
                for (var i = 0; i < e['object'].numOfQuestions; i++){
                    if (e['answers'][i] == e['object'].dataName[i].correct){ tempScore++ } // Count matches
                }
            }
        })  
        activeQuizObject.showScore(tempScore) // Print score
    }
}

// -------------------------------------------------------------------------------------------------------------------------------
class Quiz {
    constructor(dataName){
        this.dataName = eval(dataName)
        this.numOfQuestions = this.dataName.length
        this.currentQuestion = 0

        // DOM elements of quiz to manipulate with
        this.quizWrapper = $('#quiz-form-wrapper')
        this.progressBar = $('#quiz-form__progress-bar')
        this.question = $("#quiz-form__question")
        this.answers = $('.quiz-form__answer')
        this.radios = $('#quiz-form input[type="radio"]')
        this.controls = $('#quiz-form__buttons')
        this.score = $("#score-wrapper")
    }
    renderProgressBar()  {
        
        if(this.currentQuestion+1 <= this.numOfQuestions){
            // Set aria-valuemax to the number of questions
            this.progressBar.attr('aria-valuemax', this.numOfQuestions)
            // Count the width and aria-valuemax
            this.progressBar.animate({ width: ((this.currentQuestion+1)/this.numOfQuestions)*100+'%'}, 400).attr('aria-valuenow', this.currentQuestion+1)
            // Edit text
            this.progressBar.text(this.currentQuestion+1 + " z " +this.numOfQuestions)  
        }

        if (this.currentQuestion+1 == this.numOfQuestions){ }
    }
    loadQuiz(){
        this.deselectQuestion()
        this.renderProgressBar()
        this.showQuiz()

        // Find index of active Quiz in User object
        indexOfActiveQuiz = 0
        user.progress.forEach((e)=>{ 
            if(e['name']==activeQuizName) { 
                indexOfActiveQuiz = user.progress.indexOf(e)
            }
        }) 

        // Load question and answers
        this.question.text(this.dataName[this.currentQuestion].question)
        for (var i in this.dataName[this.currentQuestion].choices){
            this.answers.find('span').eq(i).text(this.dataName[this.currentQuestion].choices[i])
        } 

        // Show back button, if it's not first question
        if ( (this.currentQuestion > 0) & !(this.currentQuestion == this.numOfQuestions)){ this.controls.find('.btn-back').fadeIn() } 
        else { this.controls.find('.btn-back').fadeOut() }

        // If possible, select already answered question.
        var currentQuestionAnswer = user.progress[indexOfActiveQuiz]['answers'][this.currentQuestion]
        if( currentQuestionAnswer ) {
            this.radios[currentQuestionAnswer-1].checked = true
            this.enableButton()
            this.enableToFinish() 
        } else { activeQuizObject.disableToFinish() }
    }
    prevQuestion(){
        this.currentQuestion--
        this.loadQuiz()
        this.disableToFinish()
        this.progressBar.removeClass("success")

    }
    nextQuestion(){
        // If something is checked, load next question...
        for (var i in this.radios){
            if(this.radios[i].checked){  
                this.currentQuestion++
                this.loadQuiz()
                break
            }
        }
    }
    enableButton(){this.controls.find('.btn-next').removeClass("disabled", "linear")} 
    disableButton(){this.controls.find('.btn-next').addClass("disabled", "linear")}
    selectQuestion(){
        user.registerAnswerSelection(this.currentQuestion) 
        this.answers.find('span').removeClass("selected")
        this.radios.find(':checked').parent().find("span").addClass("selected")
        this.enableButton() 
        this.enableToFinish() 
    }
    deselectQuestion(){
        for (i in this.radios){this.radios[i].checked = false}
        this.answers.find('span').removeClass("selected")
        this.disableButton()
    }
    showScore(score){
        this.quizWrapper.fadeOut()
        this.score.delay(400).fadeIn()
    
        if(score >= Math.floor(80*activeQuizObject.numOfQuestions/100)){
            this.score.find('p').html("Are you god, " + user.name +"? \<br>Your score is " + score + "!")
            this.score.find('img').fadeIn()
        } else {
            this.score.find('p').html("OMG "+ user.name +"! \<br>Your score is only " + score +"...")
            this.score.find('img').fadeOut()
        }
    }
    restartQuiz(){
        this.currentQuestion = 0
        user.progress = []
        startQuiz()
    }
    showQuiz(){
        if (this.score.is(":visible")){
            this.score.fadeOut()
            this.quizWrapper.delay(400).fadeIn()  
        } 
    }
    enableToFinish(){
        if (this.currentQuestion+1 == this.numOfQuestions){
            this.controls.find('.btn-next').fadeOut()
            this.controls.find('.btn-finish').fadeIn()
            this.progressBar.addClass("success", "linear")  
        }
    }
    disableToFinish() {
        if (this.currentQuestion+1 != this.numOfQuestions){
            this.controls.find('.btn-next').fadeIn()
            this.controls.find('.btn-finish').fadeOut()
            this.progressBar.removeClass("success", "linear")
        }  
    }
}


