

    let selectedOdds = [];

    async function loadBets() {
        const selectedView = localStorage.getItem('SBT-bets-view');
        const betsViewSb = document.getElementById('bets-view-sb');
        const resultsUl = document.getElementById('bets-ul');
        let li = '';
        const results = [];

        betsViewSb.value = selectedView;

        await betStore.iterate((value, key, iterationNumber) => {
            if(selectedView !== 'all') {
                if (value.betDetails.status !== selectedView) {
                    return;
                }
            }
            results.push({ key: key, value: value });

        });
        
        results.sort((a, b) => {
            const dateA = a.value.systemCreatedDateUnixMs;
            const dateB = b.value.systemCreatedDateUnixMs;
            return dateB - dateA;
        });
        results.forEach(result => {
            
            const id = result.key;
            const betNumber = result.value.betNumber;
            const status = result.value.betDetails.status;
            const league = result.value.matchInfo.league.name;
            const homeTeam = result.value.matchInfo.home.name;
            const awayTeam = result.value.matchInfo.away.name;
            const marketType = result.value.betDetails.marketType.name;
            const marketTypeValue = result.value.betDetails.marketType.value;
            const oddsPlaced = result.value.betDetails.oddsPlaced;
            const closingOdds = result.value.betDetails.closingOdds;
            const currentBankroll = parseFloat(result.value.currentBankroll).toFixed(2);
            const stake = parseFloat(result.value.betDetails.stake).toFixed(2);
            const sportsbook = result.value.sportsbooks.soft.name;
            const payout = (parseFloat(result.value.betDetails.stake) * parseFloat(result.value.betDetails.oddsPlaced)).toFixed(2);
            const profitLoss = status === 'running' ? (payout - stake)  : result.value.betDetails.profitLoss;
            const orderDate = result.value.betDetails.orderDateUnixMs ? formatTimestampToRelativeDate(result.value.betDetails.orderDateUnixMs) : '<b class="lose">(NOT SET)</b>';
            const settlementDate = result.value.betDetails.settlementDateUnixMs ? formatTimestampToRelativeDate(result.value.betDetails.settlementDateUnixMs) : '<b class="lose">(NOT SET)</b>';
            const evVTP = [ // ev value to percentage conversion
                (parseFloat(result.value.betDetails.evValue.shin) * 100).toFixed(2),
                (parseFloat(result.value.betDetails.evValue.power) * 100).toFixed(2),
                (parseFloat(result.value.betDetails.evValue.norm) * 100).toFixed(2)
            ];
            const evPercentage = [
                evVTP[0] > 0 ? `+${evVTP[0]}` : evVTP[0],
                evVTP[1] > 0 ? `+${evVTP[1]}` : evVTP[1],
                evVTP[2] > 0 ? `+${evVTP[2]}` : evVTP[2],
            ];
            /*html*/
            li += `
                <li>
                    <div class="item-header">
                        <p class="ta-left">
                            <span class="number">#${betNumber}</span>
                        </p>
                        <p class="ta-center ${status.toLowerCase()}">${status.toUpperCase()}</p>
                        <p class="ta-right ${status.toLowerCase()}">
                            <span class="peso">₱ </span>
                            ${currencyFormatter(profitLoss)}
                        </p>
                    </div>
                    <div class="item-body">
                        <div class="league-match-date">
                            <p class="league">${league}</p>
                        </div>
                        <p class="matchup">
                            <span class="team-name">${homeTeam}</span> vs <span class="team-name">${awayTeam}</span>
                        </p>
                        <div class="odds-payouts">
                            <table>
                                <tr>
                                    <td class="date-td-1">
                                        <p class="label">Order Date</p>
                                        <p>${orderDate}</p>
                                    </td>
                                    <td class="ta-right">
                                        <p class="label">Closing Odds</p>
                                        <p class="${parseFloat(result.value.betDetails.closingOdds) > parseFloat(oddsPlaced) ? 'lose' : (parseFloat(result.value.betDetails.closingOdds) < parseFloat(oddsPlaced) ? 'won' : '')}">${closingOdds}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <p class="label">Market</p>
                                        <div class="${status}">
                                            <p>${marketType} ${marketTypeValue}</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="tr-2-td-1">
                                        <p class="label">Sportsbook</p>
                                        <div class="sportsbook-name">
                                            <p>${sportsbook}</p>
                                        </div>
                                    </td>
                                    <td class="ta-right">
                                        <p class="label">Odds Placed</p>
                                        <p class="odds ${status}">${oddsPlaced}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="ta-right">
                                        <p class="label ta-center">Expected Value (S/P/N) (%)</p>
                                        <div class="positive-ev">
                                            <table class="ev-table">
                                                <tr>
                                                    <td>
                                                        <p class="${evVTP[0] > 0 ? 'won' : 'lose'}">${evPercentage[0]}</p>
                                                    </td>
                                                    <td>
                                                        <p class="${evVTP[1] > 0 ? 'won' : 'lose'}">${evPercentage[1]}</p>
                                                    </td>
                                                    <td>
                                                        <p class="${evVTP[2] > 0 ? 'won' : 'lose'}">${evPercentage[2]}</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                    <td class="ta-right">
                                        <p class="label">Stake</p>
                                        <p class="stake">
                                            <span class="peso">₱ </span>
                                            <span class="${status}">${currencyFormatter(stake)}</span>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p class="label">Bankroll</p>
                                        <p class="payout">
                                            <span class="peso">₱ </span>
                                            ${currencyFormatter(currentBankroll)}
                                        </p>
                                    </td>
                                    <td class="ta-right">
                                        <p class="label">Payout</p>
                                        <p class="payout">
                                            <span class="peso">₱ </span>
                                            ${currencyFormatter(payout)}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="blue" onclick="betInfo(false, '${id}')"><i class="fa-solid fa-circle-info"></i></button>

                        <div class="order-date">
                            <p class="label">Settlement Date</p>
                            <p>${settlementDate}</p>
                        </div>
                        <button class="orange" onclick="betInfo(true, '${id}')" id="edit-bet-btn"><i class="fas fa-edit"></i></button>
                    </div>
                </li>
            `;
        });
        
        resultsUl.innerHTML = li;
    }

    async function betInfo(isEdit, id) {
        const betInfoElem = document.getElementById('bet-info');
        const betNumbertitle = document.getElementById('bet-number-title');
        
        const betInfoEdit = document.getElementById('bet-info-edit');
        const betInfoView = document.getElementById('bet-info-view');
        
        const sportsSB = document.getElementById('sports-sb');
        const leagueTB = document.getElementById('league-tb');
        const homeNameTB = document.getElementById('home-tb');
        const awayNameTB = document.getElementById('away-tb');
        const matchDatePicker = document.getElementById('match-date-picker');

        const marketTypeTB = document.getElementById('market-type-tb');
        const marketTypeValueTB = document.getElementById('market-type-value-tb');
        
        const betHomeOddsTB = document.getElementById('bet-home-odds');
        const betAwayOddsTB= document.getElementById('bet-away-odds');
        const betDrawOddsTB= document.getElementById('bet-draw-odds');

        const stakeTB = document.getElementById('bet-amount');
        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');
        
        const orderDatePicker = document.getElementById('order-date-picker');
        const notesTA = document.getElementById('notes-ta');

        const betStatusSB = document.getElementById('bet-status-sb');
        const betClosingOddsTB = document.getElementById('bet-closing-odds-tb');
        const updatedBetBtnDiv = document.getElementById('update-bet-btn-div');

        betInfoElem.style.display = 'block';

        const results = await getLFData('bets', id);
        console.log(results);

        if(isEdit) { // edit bet details
            await populateSportsSB(results.matchInfo.sport.id);

            sportsSB.value = results.matchInfo.sport.id;

            leagueTB.dataset.id = results.matchInfo.league.id;
            leagueTB.value = results.matchInfo.league.name;

            homeNameTB.dataset.id = results.matchInfo.home.id;
            homeNameTB.value = results.matchInfo.home.name;

            awayNameTB.dataset.id = results.matchInfo.away.id;
            awayNameTB.value = results.matchInfo.away.name;

            matchDatePicker.value = formatDateTimePicker(results.matchInfo.matchDateUnixMs);

            populateSportsbooksSB('soft', results.sportsbooks.soft.id);
            populateSportsbooksSB('sharp', results.sportsbooks.sharp.id);

            marketTypeTB.dataset.id = results.betDetails.marketType.id;
            marketTypeTB.value = results.betDetails.marketType.name;
            marketTypeValueTB.value = results.betDetails.marketType.value;

            /*betHomeOddsTB.value = results.sportsbooks.soft.odds[0];
            betAwayOddsTB.value = results.sportsbooks.soft.odds[1]; console.log(results.sportsbooks.soft.odds[1]);            
            betDrawOddsTB.value = results.sportsbooks.soft.odds[2] ? results.sportsbooks.soft.odds[2] : 'N/A';*/

            let oddsPlacedText = 'home';
            selectedOdds = [oddsPlacedText, results.sportsbooks.soft.odds[0]];
            if(results.betDetails.oddsPlaced === results.sportsbooks.soft.odds[1]) { //away
                oddsPlacedText = 'away';
                selectedOdds = [oddsPlacedText, results.sportsbooks.soft.odds[1]];
            } else
            if(results.betDetails.oddsPlaced === results.sportsbooks.soft.odds[2]) { //draw
                oddsPlacedText = 'draw';
                selectedOdds = [oddsPlacedText, results.sportsbooks.soft.odds[2]];
            }
            console.log(selectedOdds);
            
            selectRadio('bet-odds-container', document.getElementById(`bet-${oddsPlacedText}-odds-btn`));

            betHomeOddsTB.value = results.sportsbooks.soft.odds[0];
            betAwayOddsTB.value = results.sportsbooks.soft.odds[1];
            betDrawOddsTB.value = results.sportsbooks.soft.odds[2] ?? 'N/A';
            
            stakeTB.value = results.betDetails.stake;

            const payouts = computePayouts(parseFloat(results.betDetails.stake), parseFloat(results.betDetails.oddsPlaced));
            payoutTB.value = payouts[0].toFixed(2);
            payout2TB.value = payouts[1].toFixed(2);

            orderDatePicker.value = formatDateTimePicker(results.betDetails.orderDateUnixMs);
            notesTA.value = results.notes;


            betNumbertitle.innerHTML = results.betNumber;
            betStatusSB.value = results.betDetails.status;
            betClosingOddsTB.value = results.betDetails.closingOdds;
            
            updatedBetBtnDiv.innerHTML = `
                <button class="blue main" id="calculate-ev-btn" onclick="updateBet('${id}')">Update</button>
            `;
            
            
            
            betInfoEdit.style.display = 'block';
            betInfoView.style.display = 'none';
        } else { // view bet details
            betNumbertitle.innerHTML = results.betNumber;
            console.log('view');
            betInfoEdit.style.display = 'none';
            betInfoView.style.display = 'block';
        }
    }

    async function updateBet(key) {        
        const betInfoElem = document.getElementById('bet-info');
        
        const sportsSB = document.getElementById('sports-sb');
        const leagueTB = document.getElementById('league-tb');
        const homeNameTB = document.getElementById('home-tb');
        const awayNameTB = document.getElementById('away-tb');
        const matchDatePicker = document.getElementById('match-date-picker');

        const softbookSB = document.getElementById('softbook-sb');
        const sharpbookSB = document.getElementById('sharpbook-sb');

        const marketTypeTB = document.getElementById('market-type-tb');
        const marketTypeValueTB = document.getElementById('market-type-value-tb');
        
        const betHomeOddsTB = document.getElementById('bet-home-odds');
        const betAwayOddsTB= document.getElementById('bet-away-odds');
        const betDrawOddsTB= document.getElementById('bet-draw-odds');

        const stakeTB = document.getElementById('bet-amount');
        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');
        
        const orderDatePicker = document.getElementById('order-date-picker');
        const notesTA = document.getElementById('notes-ta');

        const betStatusSB = document.getElementById('bet-status-sb');
        const betClosingOddsTB = document.getElementById('bet-closing-odds-tb');

        /*Error checks*/
        
        if(!sportsSB.value.trim()) {            
            const message = "Error: Sport is empty.";
            messageBox(false, message);
            return;
        }
        if(!leagueTB.dataset.id) {            
            const message = "Error: League is empty.";
            messageBox(false, message);
            return;
        }
        if(!homeNameTB.dataset.id) {            
            const message = "Error: Home Team is empty.";
            messageBox(false, message);
            return;
        }
        if(!awayNameTB.dataset.id) {            
            const message = "Error: Away Team is empty.";
            messageBox(false, message);
            return;
        }

        if(!softbookSB.value.trim()) {            
            const message = "Error: Softbook is empty.";
            messageBox(false, message);
            return;
        }
        if(!sharpbookSB.value.trim()) {            
            const message = "Error: Sharpbook is empty.";
            messageBox(false, message);
            return;
        }

        if(!betHomeOddsTB.value.trim()) {            
            const message = "Error: Home Odds is empty.";
            messageBox(false, message);
            return;
        }
        if(!betAwayOddsTB.value.trim()) {            
            const message = "Error: Away Odds is empty.";
            messageBox(false, message);
            return;
        }
        if(!stakeTB.value.trim()) {            
            const message = "Error: Stake is empty.";
            messageBox(false, message);
            return;
        }
        if(parseFloat(stakeTB.value.trim()) % 1 !== 0) {            
            const message = "Error: Stake must be a whole number.";
            messageBox(false, message);
            return;
        }
        if(parseFloat(stakeTB.value.trim()) < 5) {            
            const message = "Error: Minimum stake is ₱5.";
            messageBox(false, message);
            return;
        }

        if(
            payoutTB.value.trim() == "" || parseFloat(payoutTB.value.trim()) <= 0 
            || payout2TB.value.trim() == "" || parseFloat(payout2TB.value.trim()) <= 0
        ) {            
            const message = "Error: Invalid payouts.";
            messageBox(false, message);
            return;
        }
        
        if(!betStatusSB.value.trim()) {            
            const message = "Error: Status is empty.";
            messageBox(false, message);
            return;
        }
        if(betClosingOddsTB.value.trim() === "" || isNaN(betClosingOddsTB.value.trim()) || parseFloat(betClosingOddsTB.value.trim()) <= 1) {            
            const message = "Error: Invalid closing odds.";
            messageBox(false, message);
            return;
        }
        /*Error checks*/

        let bets = await getLFData('bets', key);

        bets.matchInfo.sport.id = sportsSB.value;
        bets.matchInfo.sport.name = sportsSB.textContent.trim();

        bets.matchInfo.league.id = leagueTB.dataset.id;
        bets.matchInfo.league.name = leagueTB.value.trim();

        bets.matchInfo.home.id = homeNameTB.dataset.id;
        bets.matchInfo.home.name = homeNameTB.value.trim();

        bets.matchInfo.away.id = awayNameTB.dataset.id;
        bets.matchInfo.away.name = awayNameTB.value.trim();

        bets.matchInfo.matchDateUnixMs = (new Date(matchDatePicker.value.trim())).getTime();
        bets.betDetails.settlementDateUnixMs = (new Date(matchDatePicker.value.trim())).getTime();

        bets.sportsbooks.soft.id = softbookSB.value;
        bets.sportsbooks.soft.name = softbookSB.options[softbookSB.selectedIndex].textContent.trim()
        bets.sportsbooks.sharp.id = sharpbookSB.value;
        bets.sportsbooks.sharp.name = sharpbookSB.options[sharpbookSB.selectedIndex].textContent.trim()

        bets.betDetails.marketType.id = marketTypeTB.dataset.id;
        bets.betDetails.marketType.name = marketTypeTB.value.trim();
        
        bets.betDetails.marketType.value = marketTypeValueTB.value.trim();

        bets.sportsbooks.soft.odds[0] = parseFloat(betHomeOddsTB.value).toFixed(2); //home
        bets.sportsbooks.soft.odds[1] = parseFloat(betAwayOddsTB.value).toFixed(2); //away
        //draw
        bets.sportsbooks.soft.odds[2] = betDrawOddsTB.value.trim() === "" || isNaN(betDrawOddsTB.value.trim()) || parseFloat(betDrawOddsTB.value.trim()) <= 1 ? 'N/A' : parseFloat(betDrawOddsTB.value).toFixed(2);

        let oddsPlaced = ''; // home as the default
        if(selectedOdds[0] === 'home') {
            oddsPlaced = parseFloat(betHomeOddsTB.value).toFixed(2)
        } else
        if(selectedOdds[0] === 'away') {
            oddsPlaced = parseFloat(betAwayOddsTB.value).toFixed(2); // away
        } 
        else {
            oddsPlaced = parseFloat(betDrawOddsTB.value).toFixed(2); // draw
        }

        bets.betDetails.oddsPlaced = oddsPlaced;

        bets.betDetails.stake = parseFloat(stakeTB.value).toFixed(2);

        bets.betDetails.orderDateUnixMs = (new Date(orderDatePicker.value.trim())).getTime();
        
        bets.notes = notesTA.value;



        bets.betDetails.closingOdds = betClosingOddsTB.value;
        bets.betDetails.status = betStatusSB.value;
        
        if(betStatusSB.value === 'running') {
            bets.betDetails.profitLoss = parseFloat(bets.betDetails.stake) * -1;
            
        } else
        if(betStatusSB.value === 'won') {
            bets.betDetails.profitLoss = parseFloat(bets.betDetails.stake) * (parseFloat(bets.betDetails.oddsPlaced) - 1);
            
        } else
        if(betStatusSB.value === 'lose') {
            bets.betDetails.profitLoss = parseFloat(bets.betDetails.stake) * -1;
            console.log(bets.betDetails.stak);
            console.log(parseFloat(bets.betDetails.stake) * -1);
            
        }
        else { // rejected
            bets.betDetails.profitLoss = 0;

        }

        const success = await betStore.setItem(key, bets);
        
        if(success) {
            betInfoElem.style.display = 'none';
            await loadBets();
            const totals = await calculateTotals(true);            
            
            const defaults = await configStore.getItem('defaults');
            const updatedBankroll = {
                currentBankroll: parseFloat(defaults.startingBankroll) + parseFloat(totals.totalProfit)
            }
            await updateLFData('config', 'defaults', updatedBankroll);
            

            const message = "Success: Status has been updated.";
            messageBox(true, message);
        } else {
            
            const message = "Error: Something went wrong.";
            messageBox(false, message);
        }
    }

    function changeBetsView(selected) {
        localStorage.setItem('SBT-bets-view', selected);
        loadBets();
    }

    function formatDateTimePicker(unixTimestampMs) {
        const date = new Date(unixTimestampMs);

        // Get individual components
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        // Format for datetime-local input
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        return formattedDateTime;
    }

    function selectOddsRadio(type, parent, elem) {
        const input = document.getElementById(`bet-${type}-odds`);
        
        
        if(input.value.trim() === "" || isNaN(input.value.trim()) || parseFloat(input.value.trim()) <= 1) {
            
            const message = "Error: Invalid odds.";
            messageBox(false, message);
            return;
        }

        selectedOdds = [type, input.value];
        console.log(selectedOdds);
        
        calculatePayouts();
        selectRadio(parent, elem);
    }
    

    function checkOddsValidity(type) {
        const input = document.getElementById(`bet-${type}-odds`);
        const button = document.getElementById(`bet-${type}-odds-btn`);
        
        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');

        if(input.value.trim() === "" || isNaN(input.value.trim()) || parseFloat(input.value.trim()) <= 1) {
            payoutTB.value = 0.00;
            payout2TB.value = 0.00;
            button.classList.remove('radio-selected');
            
            console.log(selectedOdds);
            return;
        }
        calculatePayouts();
    }

    function calculatePayouts() {
        
        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');

        const selectedOddsTB = document.getElementById(`bet-${selectedOdds[0]}-odds`);
        const stakeTB = document.getElementById('bet-amount');

        const payouts = computePayouts(parseFloat(stakeTB.value), parseFloat(selectedOddsTB.value));            
        payoutTB.value = payouts[0].toFixed(2);
        payout2TB.value = payouts[1].toFixed(2); 

        
    }
