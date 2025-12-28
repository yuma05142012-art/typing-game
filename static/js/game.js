//1
document.addEventListener("DOMContentLoaded",() => {

    //2
    let startFlag = 0; // 0→開始前、１→開始待機、２→ゲーム中、３→終了
    let startTime;
    let missTypeCount = 0;
    let typeCount = 0;
    let current = 0;
    let letterCount= 0;
    let typedText;
    let untypedText;
    const timeText = document.getElementById("timeText");
    let timeoutID;
    const scoreText = document.getElementById("score");
    const otherResult = document.getElementById("other-result");
    const resultSection = document.getElementById("results");


    const panelContainer = document.getElementsByClassName("panel-container")[0];
    const wordObjList = [];
    // const wordLength = 1;
    const wordLength = 20;
    const infoBox = document.getElementById("info");
    const missMountText = document.getElementById("missMount");
    const wordCountText = document.getElementById("wordCount");
    document.getElementById("wordLength").textContent = `/${wordLength}`;


    //3
    const clearSound = document.getElementById("type_clear");
    const missSound = document.getElementById("type_miss");
    const countSound = document.getElementById("count_down");
    const startSound = document.getElementById("start_sound");
    let bgm = document.querySelectorAll(".bgm_sound");

    let bgmList = [];
    bgm.forEach(element => {
        bgmList.push(element);
    })
    

    let randomIndex = [];
    for(let i = 0;i < wordLength;i++){
        randomIndex.push(i)
    }
    shuffleArray(randomIndex)

    //4
    function shuffleArray(array) {
        console.log(array)
        for (let i = array.length - 1; i > 0; i--) {
            // 0からiまでのランダムなインデックスを生成
            const j = Math.floor(Math.random() * (i + 1));
            // array[i] と array[j] を入れ替える
            [array[i], array[j]] = [array[j], array[i]];
        };
        console.log(array)
        return array;
    };

    function wordObjListMake(data){
        const lines = data.split("\n");
        shuffleArray(lines);

        for(let i =0 ;i< wordLength;i++){
            let word = lines[i].split(",");
            wordObjList.push({
                "untyped": word[0],
                "typed": "",
                "word": word[0],
                "letterLength":word[0].length,
            })
        }
    }

function displayTime(){
    const currentTime = Date.now() - startTime;
    const s = String(Math.floor(currentTime / 1000)).padStart(2, "0");
    const ms = String(currentTime % 1000).padStart(3, "0");
    timeText.textContent = `${s}.${ms}`;
    timeoutID = setTimeout(displayTime, 10);
}

    function playAudio(audio){
        console.log(audio)
        const audioLength = audio.duration;
        audio.currentTime = 0;
        audio.play();
        setTimeout(playAudio,audioLength*1000)
    }

    function createPanels() {
        panelContainer.innerHTML = "";
        for (let i = 0; i < wordObjList.length; i++) {

            const panel = document.createElement("div");
            const typedSpan = document.createElement("span");
            const untypedSpan = document.createElement("span");
            
            panel.id = "panel-" + i;
            panel.className = "panel";
            typedSpan.id = "typed-"+i;
            typedSpan.className = "typed";
            untypedSpan.id = "untyped-"+i;
            untypedSpan.className = "untyped"

            untypedSpan.textContent = wordObjList[i]["untyped"];

            letterCount += wordObjList[i]["letterLength"];

            panel.appendChild(typedSpan);
            panel.appendChild(untypedSpan);
            panelContainer.appendChild(panel);   
        }
        panelContainer.classList.add("panel-container-play");
        document.getElementById(`panel-${randomIndex[current]}`).classList.add("active")
    }

    function highlightCurrentPanel() {

        let currentPanel = document.getElementById(`panel-${randomIndex[current - 1]}`);
        let nextPanel = document.getElementById(`panel-${randomIndex[current]}`);

        currentPanel.classList.remove("active");
        currentPanel.classList.add("faded");
        nextPanel.classList.add("active");
    }

    function processStartGame(){
        for(let countdown = 3,index = 0;index < 3;countdown--,index++){
            setTimeout(()=>{
                infoBox.textContent = countdown;
                countSound.currentTime = 0;
                countSound.play();
            },index*1000);
        };
        setTimeout(async () => {
            startFlag = 2;
            infoBox.textContent = "";
            await fetch(`csv/word-${level}.csv`)
                .then(response => response.text())
                .then(data => wordObjListMake(data));
        
            console.log(wordObjList);
            createPanels();
            startSound.currentTime = 0;
            startSound.play();
            shuffleArray(bgmList)
            bgmList[0].currentTime = 0;
            bgmList[0].loop = true;
            bgmList[0].play();
            typedText = document.getElementById(`typed-${randomIndex[current]}`);
            untypedText = document.getElementById(`untyped-${randomIndex[current]}`);
            startTime = Date.now();
            displayTime();
        },3000);
    }

    const levelBtns = document.querySelectorAll(".level_btn");
    
    let radioInput = document.querySelector(".active-level input");
    let level = radioInput.value;

    function handleLevelChange(newRadioInput){
        
        if(radioInput !== newRadioInput){
            level = newRadioInput.value;
            newRadioInput.parentElement.classList.add("active-level");
            radioInput.parentElement.classList.remove("active-level")
            radioInput = newRadioInput
        }
    }

    levelBtns.forEach(element => {
        element.querySelector("input").addEventListener("click",(event) => {
            handleLevelChange(event.target);
        });
    });

    function inputCheck(key){
        typeCount += 1;

        if(key == wordObjList[randomIndex[current]]["untyped"].charAt(0)){
            clearSound.currentTime = 0;
            clearSound.play();

            wordObjList[randomIndex[current]]["typed"] = wordObjList[randomIndex[current]]["typed"] + wordObjList[randomIndex[current]]["untyped"].charAt(0);
            wordObjList[randomIndex[current]]["untyped"] = wordObjList[randomIndex[current]]["untyped"].substring(1);

            typedText.textContent = wordObjList[randomIndex[current]]["typed"];
            untypedText.textContent = wordObjList[randomIndex[current]]["untyped"];

            if(wordObjList[randomIndex[current]]["untyped"].length == 0){

                current += 1;

                wordCountText.textContent = current
                
                if(current == wordLength){
                    
                    processEndGame();

                }
                else{
                    highlightCurrentPanel();
                    typedText = document.getElementById(`typed-${randomIndex[current]}`)
                    untypedText = document.getElementById(`untyped-${randomIndex[current]}`)
                }
            }
        }
        else{
            missTypeCount += 1;
            missMountText.textContent = missTypeCount;
            missSound.currentTime = 0;
            missSound.play();

        }

    }

    function processEndGame(){

        clearTimeout(timeoutID);
        bgm.pause();
        const stopTime = (Date.now() - startTime);
        const score = parseInt((typeCount / startTime) * 6000 * (letterCount / typeCount) ** 3);
        scoreText.textContent = `SCORE : ${score}`;
        otherResult.textContent = `合計入力文字数（ミスを含む）:${typeCount}`;
        resultSection.style.display = "flex";

        for (let i = 0; i < wordLength; i++)  {
            const panel = document.getElementById("panel-" + 1);
            panel.classList.remove("active","faded")
        };
        startFlag = 3;
        window.scrollTo({
            top: 100,
            left: 0,
            behavior: "smooth"
        })
    };


    window.addEventListener("keydown", (event) =>{
        
        if(startFlag == 0 && event.key == " "){
            console.log('lkfja')
            startFlag = 1;
            processStartGame();
        } 

        else if(startFlag == 2 && event.key.length == 1 && event.key.match(/^[a-zA-Z0-9!-/:-@\[-`{-~\s]*$/)){
            inputCheck(event.key);
        }
        else if(startFlag == 3 && (event,key == "Enter" || event.key == "Escape")){
            this.location.reload();
        }
    });   
});