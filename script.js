const players = [];
const characters = ["Barbarian", "Moon Elf", "Shadow Thief", "Pyromancer", "Paladin", "Monk", "treant", "ninja", "seraphine", "vampire lord", "guns slinger", "samurai", "santa", "krampus","artificier","pirate","guns slinger", "samurai", "santa", "krampus"];
let avail_characters = characters.slice();
let matches = [];

document.getElementById("add-player").addEventListener("click", () => {
    const playerName = document.getElementById("player-name").value.trim();
    if (playerName) {
        players.push(playerName);
        updatePlayerList();
        document.getElementById("player-name").value = '';
    }
});

document.getElementById("randomize").addEventListener("click", () => {
    if (players.length < 2) {
        alert("Add at least 2 players to start!");
        return;
    }
    if (players.length > characters.length) {
        alert("Not enough characters for all players. Reduce players or add more characters!");
        return;
    }

    const randomized = players.map((player, index) => ({
        name: player,
        points: 0, // Initialize points
    }));

    displayTournament(randomized);
});

document.getElementById("generate_next").addEventListener("click", () => {
    if (typeof finalists == "undefined"){
        setupSemiFinals(pools);
    }else{
        createFinalsMatches();
    }
    
});
/*
document.getElementById("generate_finals").addEventListener("click", () => {
    setupFinals(semiFinalResults);
});*/

function updatePlayerList() {
    const playersList = document.getElementById("players");
    playersList.innerHTML = players.map(player => `<li>${player}</li>`).join('');
}



function createPools(players) {
    const poolCount = Math.ceil(players.length / 4); // Calculate the number of pools needed
    const pools = Array.from({ length: poolCount }, () => []);

    // Randomize player order
    const shuffledPlayers = players.sort(() => Math.random() - 0.5);

    // Distribute players round-robin style
    shuffledPlayers.forEach((player, index) => {
        pools[index % poolCount].push(player);
    });

    // Balance pools to avoid pools with only two players
    for (let i = 0; i < pools.length; i++) {
        if (pools[i].length === 2) {
            const extraPlayer = pools[i].pop(); // Remove a player from the small pool
            const targetPool = pools.find(p => p.length < 4 && p !== pools[i]);
            if (targetPool) {
                targetPool.push(extraPlayer); // Add the player to a pool with space
            } else {
                // If no suitable pool, create a new one
                pools.push([extraPlayer]);
            }
        }
    }

    return pools;
}



function displayTournament(data) {
    const player_list = document.getElementById("players-list");
    player_list.innerHTML = '';
    pools = createPools(data); // Store pools globally for access in scoring
    const bracket = document.getElementById("bracket");
    bracket.innerHTML = ''; // Clear previous bracket

    pools.forEach((pool, poolIndex) => {
        const poolDiv = document.createElement("div");
        poolDiv.innerHTML = `<h3>Pool ${poolIndex + 1}</h3>`;
        
        const matches = createMatches(pool);
        matches.forEach((match, matchIndex) => {
            const matchId = `${poolIndex}-${matchIndex}`; // Unique match ID
            const matchDiv = document.createElement("div");
            matchDiv.id = `match-${matchId}`;
            matchDiv.innerHTML = `
                <p>${match.player1.name} vs 
                ${match.player2.name}</p> <button onclick="startMatch(${poolIndex},'${match.player1.name}', '${match.player2.name}', '${matchId}')">Start Match</button>
                <button disabled  onclick="recordResult(${poolIndex}, ${match.player1Index}, ${match.player2Index}, 'win', '${matchId}')">Player 1 Wins</button>
                <button disabled  onclick="recordResult(${poolIndex}, ${match.player2Index}, ${match.player1Index}, 'win', '${matchId}')">Player 2 Wins</button>
                <button disabled  onclick="recordResult(${poolIndex}, ${match.player1Index}, ${match.player2Index}, 'draw', '${matchId}')">Draw</button>
            `;
            poolDiv.appendChild(matchDiv);
        });

        bracket.appendChild(poolDiv);
    });
    displayCharacterList();

    displayLeaderboard(); // Initialize score table
}


function displayCharacterList(){
    const character_list = document.getElementById("characters-list");
    character_list.innerHTML = '';
    avail_characters.forEach((character, index) => {
        const characterDiv = document.createElement("il");
        characterDiv.innerHTML = `<p>${character}</p>`;
        character_list.appendChild(characterDiv);
    }
    );
}


function createMatches(pool) {
    const matches = [];
    for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
            matches.push({
                player1: pool[i],
                player2: pool[j],
                player1Index: i,
                player2Index: j,
            });
        }
    }
    return matches;
}


function startMatch(poolIndex, player1, player2, matchIndex) {
    if(avail_characters.length < 2){
        alert("Not enough characters for all players. Wait for matches to finish or add more characters!");
        return;
    }
    if(matches.find(m => m.player1 === player1 || m.player1 === player2 || m.player2 === player1 || m.player2 === player2)){
        alert("This match is already in progress!");
        return;
    }
    if (matches.find(m => m.player1 === player1 || m.player2 === player1)){
        alert("This player is already in a match!");
        return;
    }
    let randomIndex = Math.floor(Math.random() * avail_characters.length);
    const character1 = avail_characters[randomIndex];
    avail_characters.splice(randomIndex, 1);
    randomIndex = Math.floor(Math.random() * avail_characters.length);
    const character2 = avail_characters[randomIndex];
    avail_characters.splice(randomIndex, 1);
    const matchElement = document.getElementById(`match-${matchIndex}`);
    matchElement.querySelectorAll("button").forEach(button => {
        button.disabled = false;
    });
    matchElement.querySelector("button").disabled = true;

    matchElement.querySelector("p").textContent = `${player1} (${character1}) vs ${player2} (${character2})`;
    matches.push({player1: player1, player2: player2, character1: character1, character2: character2});
    displayCharacterList();
}

function recordResult(poolIndex, winnerIndex, loserIndex, result, matchId) {
    const pool = pools[poolIndex];
    const matchElement = document.getElementById(`match-${matchId}`);

    const match = matches.find(m => m.player1 === pool[winnerIndex].name || m.player1 === pool[loserIndex].name);
    if (match) {
        avail_characters.push(match.character1, match.character2);
        matches = matches.filter(m => m !== match);
    }
    else{
        alert("Match not found!");
    }

    if (result === 'win') {
        pool[winnerIndex].points += 2;
    } else if (result === 'draw') {
        pool[winnerIndex].points += 1;
        pool[loserIndex].points += 1;
    }
    

    // Lock the match results
    matchElement.querySelectorAll("button").forEach(button => {
        button.disabled = true;
    });

    // Update leaderboard
    displayLeaderboard();
    displayCharacterList();
}


function changePlayerScore(poolIndex,index,value){
    pools[poolIndex][index].points = parseInt(value,10);
}



function displayLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = '<h2>Score Table</h2>'; // Clear previous leaderboard content

    pools.forEach((pool, poolIndex) => {
        const table = document.createElement("table");
        table.border = "1";
        table.style.margin = "10px auto";
        
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th>Player</th>
            <th>Points</th>
        `;
        table.appendChild(headerRow);

        pool.forEach((player,index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${player.name}</td>
                <td><input type="number" value="${player.points}" onchange=changePlayerScore(${poolIndex},${index},this.value)></td>
            `;
            table.appendChild(row);
        });

        leaderboard.appendChild(document.createElement("h3")).textContent = `Pool ${poolIndex + 1}`;
        leaderboard.appendChild(table);
    });

}


function showTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    contents.forEach(content => {
        content.classList.remove('active');
    });
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Initialize the default tab
document.addEventListener('DOMContentLoaded', () => {
    showTab('pools');
});

function setupFinals(semiFinalResults) {
    // Assuming `semiFinalResults` is an array of the winners from each semi-final match
    const finalists = semiFinalResults; // Array of players who won their semi-final matches

    // Generate final match
    const finalMatch = {
        players: finalists
    };

    displayFinals([finalMatch]);
}



function displayFinals(finalMatches) {
    const bracketDiv = document.getElementById("bracket");
    bracketDiv.innerHTML = "<h2>Finals</h2>";

    finalMatches.forEach((match, index) => {
        const matchId = `${index}`; // Unique match ID
        const matchDiv = document.createElement("div");
        matchDiv.id = `match-${matchId}`;
        if (match.players.length === 3) {
            // 3-player final match
            matchDiv.innerHTML = `
                <h3>Final Match ${index + 1} (3 Players)</h3>
                <p>${match.players[0]} vs ${match.players[1]} vs ${match.players[2]}</p>
                <button onclick="recordWinner('${match.players[0]}')">${match.players[0]} Wins</button>
                <button onclick="recordWinner('${match.players[1]}')">${match.players[1]} Wins</button>
                <button onclick="recordWinner('${match.players[2]}')">${match.players[2]} Wins</button>
            `;
        } else {
            // Standard 1v1 final match
            matchDiv.innerHTML = `
                <h3>Final Match ${index + 1}</h3>
                <p>${match.players[0]} vs ${match.players[1]}</p>
                <button onclick="recordWinner('${match.players[0]}')">${match.players[0]} Wins</button>
                <button onclick="recordWinner('${match.players[1]}')">${match.players[1]} Wins</button>
            `;
        }
        bracketDiv.appendChild(matchDiv);
    });
}



function recordWinner(winner ,matchId) {
    if (semiFinalMatches.length != 1 ){
        const matchElement = document.getElementById(`match-${matchId}`);
        for (let i = 0 ; i<semiFinalMatches.length; i++){
            console.log(semiFinalMatches[i]);
            if (semiFinalMatches[i].players){
                for (j in semiFinalMatches[i].players){
                    console.log(semiFinalMatches[i].players[j].name);
                    if (semiFinalMatches[i].players[j].name == winner){
                        console.log(semiFinalMatches[i].players[j]);
                        finalists.push(semiFinalMatches[i].players[j]);
                        break;
                    }
                }
            }else{
                if(semiFinalMatches[i].player1.name == winner){
                    finalists.push(semiFinalMatches[i].player1);
                }else if(semiFinalMatches[i].player2.name == winner){
                    finalists.push(semiFinalMatches[i].player2);
                }
            }
        }
        matchElement.querySelectorAll("button").forEach(button => {
            button.disabled = true;
        });
    }else{
        alert(`The winner of Final Match is ${winner}!`);
    }

}

function setupSemiFinals(pools) {
    
    // Determine pool winners
    finalists = pools.map(pool => {
        return pool.reduce((topPlayer, player) => {
            return player.points > topPlayer.points ? player : topPlayer;
        });
    });
    createFinalsMatches();
}

function createFinalsMatches(){
    // Generate semi-final matches
    semiFinalMatches = [];
    if (finalists.length % 2 === 0) {
        // Pair players for standard 1v1 matches
        for (let i = 0; i < finalists.length; i += 2) {
            semiFinalMatches.push({ player1: finalists[i], player2: finalists[i + 1] });
        }
    } else {
        // Create a 3-player match and the rest standard 1v1
        const threePlayerMatch = finalists.pop(); // Remove one player for the 3-player match
        semiFinalMatches.push({ players: [threePlayerMatch, finalists[0], finalists[1]] });
        // Add the rest as 1v1
        for (let i = 2; i < finalists.length; i += 2) {
            semiFinalMatches.push({ player1: finalists[i], player2: finalists[i + 1] });
        }
    }
    finalists=[]
    displaySemiFinals(semiFinalMatches);
}


function displaySemiFinals(semiFinalMatches) {
    const bracketDiv = document.getElementById("bracket");
    let phase = "";
    if (semiFinalMatches.length == 2 ){
        phase = "Semi-Finals";
    }else if (semiFinalMatches.length == 1 ){
        phase = "Finals";
    }else{
        phase = "Round";
    }
    bracketDiv.innerHTML = `<h2>${phase}</h2>`;
    

    semiFinalMatches.forEach((match, index) => {
        const matchId = `${index}`; // Unique match ID
        const matchDiv = document.createElement("div");
        matchDiv.id = `match-${matchId}`;
        if (match.players) {
            // 3-player match
            matchDiv.innerHTML = `
                <h3>${phase} Match ${index + 1} (3 Players)</h3>
                <p>${match.players[0].name} vs ${match.players[1].name} vs ${match.players[2].name}</p>
                <button onclick="recordWinner('${match.players[0].name}',${matchId})">${match.players[0].name} Wins</button>
                <button onclick="recordWinner('${match.players[1].name}',${matchId})">${match.players[1].name} Wins</button>
                <button onclick="recordWinner('${match.players[2].name}',${matchId})">${match.players[2].name} Wins</button>
            `;
        } else {
            // Standard 1v1 match
            matchDiv.innerHTML = `
                <h3>${phase} Match ${index + 1}</h3>
                <p>${match.player1.name} vs ${match.player2.name}</p>
                <button onclick="recordWinner('${match.player1.name}',${matchId})">${match.player1.name} Wins</button>
                <button onclick="recordWinner('${match.player2.name}',${matchId})">${match.player2.name} Wins</button>
            `;
        }
        bracketDiv.appendChild(matchDiv);
    });
}

