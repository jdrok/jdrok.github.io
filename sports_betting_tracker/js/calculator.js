
    

    async function loadDefaults() {
        const startingBankrollTB = document.getElementById('starting-bankroll');
        const currentgBankrollTB = document.getElementById('current-bankroll');
        const powerKTB = document.getElementById('power-k');

        const defaults = await configStore.getItem('defaults');
        const totals = JSON.parse(localStorage.getItem('SBT-totals'));
        const currentBankroll = parseFloat(defaults.startingBankroll) + parseFloat(totals.totalProfit);
        
        startingBankrollTB.value = parseFloat(defaults.startingBankroll).toFixed(2);
        currentgBankrollTB.value = parseFloat(currentBankroll).toFixed(2);
        powerKTB.value = defaults.powerK;
    }

    function inputOdds(isSharp) {
        const sharpOddsTB = document.getElementById('sharpbook-odds');
        const softOddsTB = document.getElementById('softbook-odds');
        let textboxOdds = softOddsTB.value;

        if(isSharp) {
            textboxOdds = sharpOddsTB.value;
        }
        
        try {

            bookSplitArray = textboxOdds.split(',');

            //softbook odds
            const softOddsArray = bookSplitArray[0].split('\n');

            //sharpbook odds
            const sharpOddsArray = bookSplitArray[1].split('\n');
            
            if(softOddsArray.length <= 3) {
                softOddsTB.value = `${softOddsArray[0]}\n${softOddsArray[1]}`;
                sharpOddsTB.value = `${sharpOddsArray[1]}\n${sharpOddsArray[2]}`;
            } else {
                softOddsTB.value = `${softOddsArray[0]}\n${softOddsArray[1]}\n${softOddsArray[2]}`;
                sharpOddsTB.value = `${sharpOddsArray[1]}\n${sharpOddsArray[2]}\n${sharpOddsArray[3]}`;
            }
            
        } catch (error) {
            console.log("Error while splitting the odds!");
            
        }
        
    }

    async function clearOdds() {
        const defaults = await configStore.getItem('defaults');
        document.getElementById('softbook-odds').value = '';
        document.getElementById('sharpbook-odds').value = '';
        document.getElementById('results').innerHTML = '';
        document.getElementById('power-k').value = defaults.powerK;;
        
        localStorage.removeItem('SBT-calc-last-input');
        localStorage.removeItem('SBT-data-to-bet-home');
        localStorage.removeItem('SBT-data-to-bet-draw');
        localStorage.removeItem('SBT-data-to-bet-away');
    }

    function addBet(outcome, method) {
        navigateTo('/new-entry');
        
        localStorage.setItem('SBT-data-to-bet-type', outcome + '-' + method)
    }


    // Calculate button functionality
    function calculateEV() {
        
        const softOddsTB = document.getElementById('softbook-odds');
        const sharpOddsTB = document.getElementById('sharpbook-odds');
        
        const softOddsArray = softOddsTB.value.split('\n');
        
        const sharpOddsArray = sharpOddsTB.value.split('\n');

        const oddsObject = {
            "odds": {                
                "bingoPlus": softOddsArray,
                "pinnacleOdds": sharpOddsArray
            }
        };

        
        //const oddsInput = document.getElementById('odds-input').value;
        const bankroll = parseFloat(document.getElementById('current-bankroll')?.value) || 1000;
        const powerK = parseFloat(document.getElementById('power-k')?.value) || 0.95;
        const resultsDiv = document.getElementById('results');
        /*const resultsContent = document.getElementById('results-content');
        const errorDiv = document.getElementById('error');*/

        // Validate inputs
        if (!oddsObject || isNaN(bankroll) || bankroll <= 0) {
            const message = "Error: Invalid odds (JSON) and bankroll (> 0).";
            messageBox(false, message);
            return;
        }
        if (isNaN(powerK) || powerK < 0.5 || powerK > 1.0) {
            const message = "Error: Power Method k-value must be between 0.5 and 1.0.";
            messageBox(false, message);
            return;
        }

        let oddsData;
        try {
            oddsData = oddsObject;
            console.log(oddsData);
            
            if (
                !oddsData.odds ||
                !Array.isArray(oddsData.odds.pinnacleOdds) ||
                !Array.isArray(oddsData.odds.bingoPlus) ||
                ![2, 3].includes(oddsData.odds.pinnacleOdds.length) ||
                oddsData.odds.pinnacleOdds.length !== oddsData.odds.bingoPlus.length
            ) {
                throw new Error('Invalid odds format. Expected 2 or 3 outcome arrays.');
            }
        } catch (e) {
            const message = "Error: Invalid JSON format or odds structure.";
            messageBox(false, message);
            return;
        }

        const pinnacleOdds = oddsData.odds.pinnacleOdds.map(Number);
        const bingoPlusOdds = oddsData.odds.bingoPlus.map(Number);

        // Validate odds
        if (
            pinnacleOdds.some(isNaN) ||
            bingoPlusOdds.some(isNaN) ||
            pinnacleOdds.some(o => o <= 1) ||
            bingoPlusOdds.some(o => o <= 1)
        ) {
            const message = "Error: Odds must be valid numbers greater than 1.";
            messageBox(false, message);
            return;
        }

        // Define outcomes dynamically
        const outcomeLabels = pinnacleOdds.length === 3 ? ['Home', 'Draw', 'Away'] : ['Home', 'Away'];
        const outcomes = pinnacleOdds.map((pinnacleOdds, index) => ({
            index,
            pinnacleOdds,
            bingoPlusOdds: bingoPlusOdds[index],
            label: outcomeLabels[index]
        }));

        // Calculate implied probabilities from Pinnacle odds
        const impliedProbs = pinnacleOdds.map(odds => 1 / odds);
        const totalImplied = impliedProbs.reduce((sum, p) => sum + p, 0);
        const vig = totalImplied - 1;

        // Calculate true probabilities for each method
        /*const methods = [
            { name: 'shin', label: 'Shin Method' },
            { name: 'power', label: `Power Method (k=${powerK})` },
            { name: 'normalized', label: 'Normalized Method' }
        ];*/
        const methods = [
            { name: 'shin', label: 'Shin' },
            { name: 'power', label: `Power` },
            { name: 'normalized', label: 'Norm.' }
        ];

        const methodResults = methods.map(method => {
            let trueProbs;
            if (method.name === 'shin') {
                const vigPerOutcome = vig / outcomes.length;
                trueProbs = impliedProbs.map(p => p - vigPerOutcome);
            } else if (method.name === 'power') {
                const poweredProbs = impliedProbs.map(p => Math.pow(p, powerK));
                const totalPowered = poweredProbs.reduce((sum, p) => sum + p, 0);
                trueProbs = poweredProbs.map(p => p / totalPowered);
            } else {
                trueProbs = impliedProbs.map(p => p / totalImplied);
            }
            return { method: method.label, trueProbs };
        });

        // Validate true probabilities
        const errorMethods = methodResults.filter(r => r.trueProbs.some(p => p <= 0 || p >= 1));
        if (errorMethods.length > 0) {
            /*errorDiv.textContent = errorMethods.map(r => `Invalid devigged probabilities for ${r.method}.`).join(' ');
            errorDiv.classList.remove('hidden');*/
            
            console.error(`Invalid devigged probabilities for ${r.method}.`);
            resultsDiv.innerHTML = '';
            return;
        }
        

        // Organize results by outcome
        const resultsByOutcome = outcomes.map(outcome => {
            const methodData = methodResults.map(({ method, trueProbs }) => {
                const trueProb = trueProbs[outcome.index];
                const ev = (trueProb * outcome.bingoPlusOdds) - 1;
                const kellyFraction = (trueProb * outcome.bingoPlusOdds - 1) / (outcome.bingoPlusOdds - 1);
                const fullKelly = kellyFraction > 0 ? kellyFraction * bankroll : 0;
                return {
                    method,
                    trueProb: (trueProb * 100).toFixed(3) + '%',
                    oddsDevigged: (1 / trueProb).toFixed(3),
                    ev: (ev * 100).toFixed(2) + '%',
                    evValue: ev,
                    fullKelly: fullKelly,
                    halfKelly: (fullKelly / 2),
                    quarterKelly: (fullKelly / 4),
                    formattedQuarterKelly: currencyFormatter((fullKelly / 4))
                };
            });
            return {
                label: outcome.label,
                bingoPlusOdds: outcome.bingoPlusOdds.toFixed(2),
                pinnacleOdds: outcome.pinnacleOdds.toFixed(2),
                pinnacleImpliedProbs: (100 / outcome.pinnacleOdds).toFixed(2),
                methodData
            };
        });


        const calcLastInput = {
            currentBankroll: bankroll,
            powerK: powerK,
            softOdds: softOddsTB.value,
            sharpOdds: sharpOddsTB.value
        };
        localStorage.setItem('SBT-calc-last-input', JSON.stringify(calcLastInput));

        if(resultsByOutcome.length == 2) { // 2-way market
            
            localStorage.setItem('SBT-data-to-bet-home', JSON.stringify(resultsByOutcome[0]));
            localStorage.removeItem('SBT-data-to-bet-draw');
            localStorage.setItem('SBT-data-to-bet-away', JSON.stringify(resultsByOutcome[1]));

        } else
        
        if(resultsByOutcome.length == 3) { // 3-way market
            
            localStorage.setItem('SBT-data-to-bet-home', JSON.stringify(resultsByOutcome[0]));
            localStorage.setItem('SBT-data-to-bet-draw', JSON.stringify(resultsByOutcome[1]));
            localStorage.setItem('SBT-data-to-bet-away', JSON.stringify(resultsByOutcome[2]));
        }

        else {
            localStorage.removeItem('SBT-data-to-bet-home');
            localStorage.removeItem('SBT-data-to-bet-draw');
            localStorage.removeItem('SBT-data-to-bet-away');
        }

        

        // Display results grouped by outcome
        resultsDiv.innerHTML = resultsByOutcome.map(outcome => `
            <div class="modal-item-container">
                <div class="dflex-sb title ${parseFloat(outcome.methodData[0].evValue) > 0 || parseFloat(outcome.methodData[1].evValue) > 0 || parseFloat(outcome.methodData[2].evValue) > 0 ? 'won-bg' : ''}">
                    <b>Outcome: ${outcome.label}</b>
                </div>

                <div class="dflex-sb item-info">
                    <p><span class="team-away">Soft</span> Sportsbook's Odds</p>
                    <p class="${parseFloat(outcome.methodData[0].evValue) > 0 || parseFloat(outcome.methodData[1].evValue) > 0 || parseFloat(outcome.methodData[2].evValue) > 0 ? 'won' : ''}">${outcome.bingoPlusOdds}</p>
                </div>

                <div class="dflex-sb item-info">
                    <p><span class="team-away">Soft</span>'s Implied Probability</p>
                    <p>${(100 / parseFloat(outcome.bingoPlusOdds)).toFixed(2)}%</p>
                </div>

                <div class="dflex-sb item-info">
                    <p><span class="team-home">Sharp</span> Sportsbook's Odds</p>
                    <p>${outcome.pinnacleOdds}</p>
                </div>

                <div class="dflex-sb item-info">
                    <p><span class="team-home">Sharp</span>'s Implied Probability</p>
                    <p>${outcome.pinnacleImpliedProbs}%</p>
                </div>

                <div class="dflex-sb item-info no-bottom-border">
                    <div class="devig-container">
                        <table class="sub-table">
                            <tr>
                                <td>
                                    <p class="label"></p>
                                </td>
                                <td>
                                    <p class="label">${outcome.methodData[0].method}</p>
                                </td>
                                <td>
                                    <p class="label">${outcome.methodData[1].method}</p>
                                </td>
                                <td>
                                    <p class="label">${outcome.methodData[2].method}</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    True P.
                                </td>
                                <td>
                                    <p class="ta-right">${outcome.methodData[0].trueProb}</p>
                                </td>
                                <td>
                                    <p class="ta-right">${outcome.methodData[1].trueProb}</p>
                                </td>
                                <td>
                                    <p class="ta-right">${outcome.methodData[2].trueProb}</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>EV</p>
                                </td>
                                <td>
                                    <p class="ta-right${outcome.methodData[0].evValue <= 0 ? ' lose' : ' won'}">${outcome.methodData[0].evValue > 0 ? '+' : ''}${outcome.methodData[0].ev}</p>
                                </td>
                                <td>
                                    <p class="ta-right${outcome.methodData[1].evValue <= 0 ? ' lose' : ' won'}">${outcome.methodData[1].evValue > 0 ? '+' : ''}${outcome.methodData[1].ev}</p>
                                </td>
                                <td>
                                    <p class="ta-right${outcome.methodData[2].evValue <= 0 ? ' lose' : ' won'}">${outcome.methodData[2].evValue > 0 ? '+' : ''}${outcome.methodData[2].ev}</p>
                                </td>
                            </tr>

                            ${parseFloat(outcome.methodData[0].evValue) > 0 || parseFloat(outcome.methodData[1].evValue) > 0 || parseFloat(outcome.methodData[2].evValue) > 0 ? `
                                <tr>
                                    <td>
                                        <p>Q.Kelly</p>
                                    </td>
                                    <td>
                                        <p class="ta-right">₱ ${outcome.methodData[0].formattedQuarterKelly}</p>
                                    </td>
                                    <td>
                                        <p class="ta-right">₱ ${outcome.methodData[1].formattedQuarterKelly}</p>
                                    </td>
                                    <td>
                                        <p class="ta-right">₱ ${outcome.methodData[2].formattedQuarterKelly}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p>Action</p>
                                    </td>
                                    <td class="ta-center">
                                        ${parseFloat(outcome.methodData[0].evValue) > 0 ? `<button class="blue add-bet" onclick="addBet('${(outcome.label).toLowerCase()}', '${(outcome.methodData[0].method).toLowerCase()}')">Bet</button>` : ''}
                                    </td>
                                    <td class="ta-center">
                                        ${parseFloat(outcome.methodData[1].evValue) > 0 ? `<button class="blue add-bet" onclick="addBet('${(outcome.label).toLowerCase()}', '${(outcome.methodData[1].method).toLowerCase()}')">Bet</button>` : ''}
                                    </td>
                                    <td class="ta-center">
                                        ${parseFloat(outcome.methodData[2].evValue) > 0 ? `<button class="blue add-bet" onclick="addBet('${(outcome.label).toLowerCase()}', '${(outcome.methodData[2].method).toLowerCase().replace('.','')}')">Bet</button>` : ''}
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        Average Quarter Kelly
                                    </td>
                                    <td colspan="2">
                                        <p class="ta-right">₱ ${currencyFormatter((parseFloat(outcome.methodData[0].quarterKelly) + parseFloat(outcome.methodData[1].quarterKelly) + parseFloat(outcome.methodData[2].quarterKelly)) / 3)}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="ta-right">
                                        <button class="blue add-bet" onclick="addBet('${(outcome.label).toLowerCase()}', 'average')">Bet</button>
                                    </td>
                                </tr>` 
                            : ''}

                        </table>
                    </div>               
                </div>

            </div>
        `).join('') + `
            <p class="note">
                * EV and Kelly stakes are calculated using BingoPlus odds against Pinnacle's devigged probabilities.
            </p>
        `;
        //resultsDiv.classList.remove('hidden');
    }




    async function calculateTotals(isAll) {
        const profitHeader = document.getElementById('profit-header');
        let totalStakeAmount = 0;
        let totalBetCount = 0;
        let totalRunningBets = 0;
        let totalWonBets = 0;
        let totalLoseBets = 0;
        let totalDrawsOrRejectedBets = 0;
        let totalProfit = 0;

        if (isAll) {
            // Use await directly here to handle the promise
            const fetchedResults = await getAllLFData('bets'); // Renamed to avoid conflict

            if (fetchedResults.length > 0) {
                fetchedResults.forEach(result => {
                    totalStakeAmount += parseFloat(result.value.betDetails.stake);

                    if (result.value.betDetails.status === 'won') {
                        totalWonBets++;
                    } else
                    if (result.value.betDetails.status === 'lose') {
                        totalLoseBets++;
                    } else
                    if (result.value.betDetails.status === 'running') {
                        totalRunningBets++;
                    }
                    else {
                        totalDrawsOrRejectedBets++;
                    }
                    totalProfit += parseFloat(result.value.betDetails.profitLoss);
                });
                totalBetCount = fetchedResults.length;
                const calculatedProfitSummary = { // Renamed the inner variable
                    totalStakeAmount: totalStakeAmount,
                    totalBetCount: totalBetCount,
                    totalRunningBets: totalRunningBets,
                    totalWonBets: totalWonBets,
                    totalLoseBets: totalLoseBets,
                    totalDrawsOrRejectedBets: totalDrawsOrRejectedBets,
                    totalProfit: totalProfit
                };
                updateTotals(calculatedProfitSummary);
                return calculatedProfitSummary;

            } else { // no bet yet
                const emptyProfitSummary = { // Renamed the inner variable
                    totalStakeAmount: 0,
                    totalBetCount: 0,
                    totalRunningBets: 0,
                    totalWonBets: 0,
                    totalLoseBets: 0,
                    totalDrawsOrRejectedBets: 0,
                    totalProfit: 0
                    
                };
                updateTotals(emptyProfitSummary);
                return emptyProfitSummary;
            }

        } else {
            // for when there's need for report
        }

        function updateTotals(totals) {            
            localStorage.setItem('SBT-totals', JSON.stringify(totals));
            const totalProfit = parseFloat(JSON.parse(localStorage.getItem('SBT-totals')).totalProfit).toFixed(2);
            const formattedTotalProfit = totalProfit >= 0 ? `+${totalProfit}` : totalProfit;
            /*html*/
            profitHeader.innerHTML = `
                <span class="${totalProfit >= 0 ? 'won' : 'lose'}">${currencyFormatter(formattedTotalProfit)}</span>
            `;
        }
    }
    
    

    async function calculateLastInput() {
        const calcLastInput = JSON.parse(localStorage.getItem('SBT-calc-last-input'));
                
        if(calcLastInput) {
            document.getElementById('power-k').value = calcLastInput.powerK;
            document.getElementById('softbook-odds').value = calcLastInput.softOdds;
            document.getElementById('sharpbook-odds').value = calcLastInput.sharpOdds;
            document.getElementById('calculate-ev-btn').click();
            
        }
    }

    async function updateCurrentBankroll() {
        try {            
            const totals = await calculateTotals(true);
            const defaults = await configStore.getItem('defaults');
            const updatedBankroll = {
                currentBankroll: parseFloat(defaults.startingBankroll) + parseFloat(totals.totalProfit)
            }
            await updateLFData('config', 'defaults', updatedBankroll);
        } catch (error) {
            //messageBox(false, error);
            console.error(error);
            
        }
    }