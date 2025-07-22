

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
            const profitLoss = result.value.betDetails.profitLoss;
            const league = result.value.matchInfo.league.name;
            const homeTeam = result.value.matchInfo.home.name;
            const awayTeam = result.value.matchInfo.away.name;
            const marketType = result.value.betDetails.marketType.name;
            const marketTypeValue = result.value.betDetails.marketType.value;
            const oddsPlaced = result.value.betDetails.oddsPlaced;
            const clsoingOdds = result.value.betDetails.closingOdds;
            const currentBankroll = parseFloat(result.value.currentBankroll).toFixed(2);
            const stake = parseFloat(result.value.betDetails.stake).toFixed(2);
            const sportsbook = result.value.sportsbooks.soft.name;
            const payout = (parseFloat(result.value.betDetails.stake) * parseFloat(result.value.betDetails.oddsPlaced)).toFixed(2);
            const orderDate = formatTimestampToRelativeDate(result.value.betDetails.orderDateUnixMs);
            const settlementDate = formatTimestampToRelativeDate(result.value.betDetails.settlementDateUnixMs);
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
                            <span class="team-home">${homeTeam}</span> vs <span class="team-away">${awayTeam}</span>
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
                                        <p>${clsoingOdds}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <p class="label">Pick</p>
                                        <div class="sportsbook-name">
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
                                        <p class="odds">${oddsPlaced}</p>
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
                                            ${currencyFormatter(stake)}
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

        const betStatusSB = document.getElementById('bet-status-sb');
        const betClosingOddsTB = document.getElementById('bet-closing-odds-tb');
        const updatedBetBtnDiv = document.getElementById('update-bet-btn-div');
        
        betInfoElem.style.display = 'block';

        const results = await getLFData('bets', id);

        console.log(results);

        if(isEdit) { // edit bet details
            betInfoEdit.style.display = 'block';
            betInfoView.style.display = 'none';
            betNumbertitle.innerHTML = results.betNumber;
            betStatusSB.value = results.betDetails.status;
            betClosingOddsTB.value = results.betDetails.closingOdds;
            
            updatedBetBtnDiv.innerHTML = `
                <button class="blue main" id="calculate-ev-btn" onclick="updateBet('${id}')">Update</button>
            `;
            
            
            
        } else { // view bet details
            betInfoEdit.style.display = 'none';
            betInfoView.style.display = 'block';
            betNumbertitle.innerHTML = results.betNumber;
            console.log('view');
        }
    }

    async function updateBet(key) {        
        const betInfoElem = document.getElementById('bet-info');
        const betStatusSB = document.getElementById('bet-status-sb');
        const betClosingOddsTB = document.getElementById('bet-closing-odds-tb');

        if(!betStatusSB.value) {            
            const message = "Error: Status is empty.";
            messageBox(false, message);
            return;
        }
        if(isNaN(betClosingOddsTB.value)) {            
            const message = "Error: Invalid closing odds.";
            messageBox(false, message);
            return;
        }

        let bets = await getLFData('bets', key);

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
