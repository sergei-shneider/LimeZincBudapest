const workArea = document.getElementsByClassName("mw-parser-output")[0]
closeTableArea.addEventListener("click", () => removeGeneratedTable(event, "rrTable"))
const isTeamLeague = [...document.getElementsByClassName("infobox-cell-2")].filter(x => x.innerText.indexOf("Team League")!==-1).length
generateListeners()
let ruleString
processRules()
function processRules(){
    const ruleElement = workArea.innerText
    const start = ruleElement.indexOf("Format\n")
    const endMap = ruleElement.indexOf("Map Pool\n")
    const endTalents = ruleElement.indexOf("Talents\n")
    const endPrize = ruleElement.indexOf("Prize Pool\n")
    const endParticipants = ruleElement.indexOf("Participants\n")
    const trueEnd = Math.min(endMap, endParticipants, endTalents, endPrize)
    ruleString = ruleElement.substring(start, trueEnd)
}

function generateListeners(){
    if(!isTeamLeague) generateGroupListeners()
}
function generateGroupListeners(){
    const groupElements = document.getElementsByClassName("grouptable")
    const groupMatchesElements = document.getElementsByClassName("matchlist")
    for(let i = 0; i<groupElements.length; i++){
        let typeOfGroup = "swiss"
        let totalplayers = groupElements[i].getElementsByClassName("grouptableslot")
        let totalmatches = groupMatchesElements[i].getElementsByClassName("matchlistslot")
        if(totalplayers.length===4 && totalmatches.length===10) typeOfGroup = "gslFormat"
        groupElements[i].getElementsByTagName("tbody")[0].childNodes[0].addEventListener("dblclick", ()=>initiateGroupPredictions(event, groupElements[i], typeOfGroup))
    }
}

async function initiateGroupPredictions(event, origin, typeOfGroup){
    XforPredictionTable = event.pageX
    YforPredictionTable = event.pageY
    groupArray = []
    predictPlayersNames = []
    playerRequests = []
    existingIdsFetch = []
    let BoX = 0
    let nodeIterator = origin.parentNode
    while (nodeIterator){
        if(nodeIterator.classList.contains("toggle-group")) break
        nodeIterator=nodeIterator.parentNode
    }
    nodeIterator = nodeIterator.previousSibling
    while(nodeIterator){
        if(nodeIterator.tagName==="H3") break;
        nodeIterator = nodeIterator.previousSibling
    }
    const theRule = nodeIterator.innerText.split("\n")[0]
    BoX = ruleString.substring(ruleString.indexOf(theRule)+theRule.length).match(/Bo\d/)[0][2]
    const playersArray = [...origin.getElementsByClassName("grouptableslot")].filter(x=>x.parentNode.dataset.toggleAreaContent==="1")
    
    for(let i = 0; i<playersArray.length; i++){
        //current = {playerToFetch, flagElement, race, country}
        let current = generatePlayerRequest({target:playersArray[i]}, 0)
        if(playerIdsDict[current.playerToFetch]){
            existingIdsFetch.push(playerIdsDict[current.playerToFetch].id)
        }
        else{
            playerIdsDict[current.playerToFetch] = {flagElement: current.flagElement, raceElement: raceIconMap[current.race], race:current.race, country:current.country}
            playerRequests.push(current)
            predictPlayersNames.push(current.playerToFetch)
        }
    }
    if(playerRequests.length){ 
        playerRequests.forEach(request =>{
            const {playerToFetch, race, country} = request
            fetchPlayerData(playerToFetch, race, country, "predict")
        })
    }else{//in case all player ids have already been cached
        fetchPlayerData(existingIdsFetch.join(), 0, 0, "groupPredict")
    }
}

function processGroupResponse(){
    groupArray.forEach(player =>{
        playerIdsDict[player.tag].id = player.id
    })
    const playersToPredict = existingIdsFetch //in case some of the ids have been cached
    predictPlayersNames.forEach(name=>{
        playersToPredict.push(playerIdsDict[name].id)
    })
    // fetchPlayerData args == (playerIn, raceIn, countryIn, sourceIn)
    fetchPlayerData(playersToPredict.join(), 0, 0, "groupPredict")
}