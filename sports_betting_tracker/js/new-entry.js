

    
    let dataType = '';

    function loadNewEntry() {
        if(!localStorage.getItem('SBT-calc-last-input')) {
            return;
        }
        const stakeTB = document.getElementById('bet-amount');
        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');
        

        const homeData = JSON.parse(localStorage.getItem('SBT-data-to-bet-home'));
        const drawData = JSON.parse(localStorage.getItem('SBT-data-to-bet-draw')) || false;
        const awayData = JSON.parse(localStorage.getItem('SBT-data-to-bet-away'));

        let defaultSelectedSport = 'basketball'; //default
        if(drawData) {
            defaultSelectedSport = 'football';
        }
        populateSportsSB(defaultSelectedSport);
        

        //populate sportsbooks
        populateSportsbooksSB('soft', 2);
        populateSportsbooksSB('sharp', 1);
        

        let odds = {};
        if(drawData) { //3-way market
            odds = {
                softbook: [
                    homeData.bingoPlusOdds,
                    awayData.bingoPlusOdds,
                    drawData.bingoPlusOdds
                ],
                sharpbook: [
                    homeData.pinnacleOdds,
                    awayData.pinnacleOdds,
                    drawData.pinnacleOdds
                ]
            };

        } else { //2-way market
            odds = {
                softbook: [
                    homeData.bingoPlusOdds,
                    awayData.bingoPlusOdds
                ],
                sharpbook: [
                    homeData.pinnacleOdds,
                    awayData.pinnacleOdds
                ]
            };
        }

        const dataToBetType = localStorage.getItem('SBT-data-to-bet-type');
        const outcome = dataToBetType.split('-')[0]; // home, draw (if 3-way market), or away
        const kellyMethod = dataToBetType.split('-')[1]; // shin, power, normalized, or  average

        
        const marketTypeTB = document.querySelector('#market-type-tb');
        const marketTypeTitle = document.querySelector('.ev-calc-result .title .label');   

        if(outcome === 'home') {
            const defaultSelectedId = `${defaultSelectedSport}-1`;
            getLFData('marketTypes', defaultSelectedId).then(data => {
                marketTypeTB.value = data;
                marketTypeTB.dataset.id = defaultSelectedId;
                marketTypeTitle.innerHTML = data;
                
            });

            if(kellyMethod === 'shin') {
                const suggestedStake = parseFloat(homeData.methodData[0].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[0]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'home');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'home');
                }

            } else
            if(kellyMethod === 'power') {
                
                const suggestedStake = parseFloat(homeData.methodData[1].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[0]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet         

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'home');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'home');
                }

            } else
            if(kellyMethod === 'norm') {
                
                const suggestedStake = parseFloat(homeData.methodData[2].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[0]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet         

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'home');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'home');
                }

            }            
            else { // average

                const suggestedStake = ((parseFloat(homeData.methodData[0].quarterKelly) + parseFloat(homeData.methodData[1].quarterKelly) + parseFloat(homeData.methodData[2].quarterKelly)) / 3).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[0]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet         

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'home');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'home');
                }
            }

        } else
        
        if(outcome === 'away') {
            const defaultSelectedId = `${defaultSelectedSport}-2`;
            getLFData('marketTypes', defaultSelectedId).then(data => {
                marketTypeTB.value = data;
                marketTypeTB.dataset.id = defaultSelectedId;
                marketTypeTitle.innerHTML = data;
            });

            if(kellyMethod === 'shin') {
                const suggestedStake = parseFloat(awayData.methodData[0].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[1]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'away');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'away');
                }

            } else
            if(kellyMethod === 'power') {
                const suggestedStake = parseFloat(awayData.methodData[1].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[1]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'away');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'away');
                }

            } else
            if(kellyMethod === 'norm') {

                const suggestedStake = parseFloat(awayData.methodData[2].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[1]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'away');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'away');
                }

            }
            else { // average
                
                const suggestedStake = ((parseFloat(awayData.methodData[0].quarterKelly) + parseFloat(awayData.methodData[1].quarterKelly) + parseFloat(awayData.methodData[2].quarterKelly)) / 3).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[1]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet         

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'away');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'away');
                }

            }
        }

        else { //draw
            const defaultSelectedId = `${defaultSelectedSport}-3`;
            getLFData('marketTypes', defaultSelectedId).then(data => {
                marketTypeTB.value = data;
                marketTypeTB.dataset.id = defaultSelectedId;
                marketTypeTitle.innerHTML = data;
            });

            if(kellyMethod === 'shin') {

                const suggestedStake = parseFloat(drawData.methodData[0].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[2]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'draw');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'draw');
                }

            } else
            if(kellyMethod === 'power') {
                
                const suggestedStake = parseFloat(drawData.methodData[1].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[2]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'draw');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'draw');
                }

            } else
            if(kellyMethod === 'norm') {

                const suggestedStake = parseFloat(drawData.methodData[2].quarterKelly).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[2]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'draw');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'draw');
                }

            }
            else { // average
                
                const suggestedStake = ((parseFloat(drawData.methodData[0].quarterKelly) + parseFloat(drawData.methodData[1].quarterKelly) + parseFloat(drawData.methodData[2].quarterKelly)) / 3).toFixed(2);
                const selectedOdds = parseFloat(odds.softbook[2]);
                const payouts = computePayouts(suggestedStake, selectedOdds);

                stakeTB.value = suggestedStake;
                payoutTB.value = payouts[0].toFixed(2);
                payout2TB.value = payouts[1].toFixed(2); // incluing bet         

                if(drawData) { // 3-way market
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), parseFloat(odds.softbook[2]), 'draw');
                } else {
                    populateOddsTBs(parseFloat(odds.softbook[0]), parseFloat(odds.softbook[1]), false, 'draw');
                }

            }
        }

        
    }

    function computePayouts(stake, odds) {
        const payouts = [
            (stake * (odds - 1)),
            (stake * odds)
        ];
        return payouts;
    }

    function populateOddsTBs(home, away, draw, selectedOutcome) {
        const homeOddsTB = document.getElementById('bet-home-odds');
        const drawOddsTB = document.getElementById('bet-draw-odds');
        const awayOddsTB = document.getElementById('bet-away-odds');

        const radios = document.querySelectorAll('.bet-odds-container .radio');
        radios.forEach(radio => {
            radio.classList.remove('radio-selected');
            radio.disabled = true;
        });
        
        homeOddsTB.style.border = '1px solid #555';
        drawOddsTB.style.border = '1px solid #555';
        awayOddsTB.style.border = '1px solid #555';
        
        homeOddsTB.value = home;
        awayOddsTB.value = away;
        drawOddsTB.value = draw || 'N/A';
        
        
        homeOddsTB.disabled = true;
        drawOddsTB.disabled = true;
        awayOddsTB.disabled = true;

        if(selectedOutcome === 'home') {
            homeOddsTB.nextElementSibling.classList.add('radio-selected');
        } else
        if(selectedOutcome === 'away') {
            awayOddsTB.nextElementSibling.classList.add('radio-selected');
        }
        else {
            drawOddsTB.nextElementSibling.classList.add('radio-selected');
        }

    }

    function sportsSBChanged(e) {
        populateMarketTypeSB(e.value)
        
    }

    async function populateSportsSB(selected) {
        const selectbox = document.getElementById('sports-sb');
        selectbox.innerHTML = '';
        let option = '';
        try {
            await sportStore.iterate((value, key) => {
                if(selected === key) {
                    option  += `
                        <option value="${key}" selected>${value}</option>
                    `;
                } else {
                    option  += `
                        <option value="${key}">${value}</option>
                    `;
                }
            });
            selectbox.innerHTML = option;
        } catch (err) {
            console.error("Error while getting the data: ", err);
            return []; // Return an empty array on error
        }
    }

    async function populateSportsbooksSB(bookType, selectedId) {
        const sportsbookId = bookType === 'soft' ? 'softbook-sb' : 'sharpbook-sb';
        const selectbox = document.getElementById(`${sportsbookId}`);
        selectbox.innerHTML = '';
        let option = '';
        try {
            await sportsbookStore.iterate((value, key) => {                
                if(selectedId == key) {
                    option  += `
                        <option value="${key}" selected>${value}</option>
                    `;
                } else {
                    option  += `
                        <option value="${key}">${value}</option>
                    `;
                }
            });
            selectbox.innerHTML = option;
        } catch (err) {
            console.error("Error while getting the data: ", err);
            return []; // Return an empty array on error
        }
    }


    async function searchLeague(keyword, isCompare = null) {
        const results = [];
        const lowerCaseKeyword = keyword.toLowerCase(); // For case-insensitive search
        const keyPrefix = document.getElementById('sports-sb').value;
        const maxResults = 10;
        
        try {
            await leagueStore.iterate(function(value, key, iterationNumber) {

                if (results.length >= maxResults) {
                    return 'stop'; // Return any non-undefined value to stop iteration
                }
                if (!key.startsWith(keyPrefix)) {
                    return;
                }

                if(isCompare) {
                    if (typeof value === 'string' && value.toLowerCase() === lowerCaseKeyword) {
                        results.push({ key: key, value: value });
                    }
                } else {
                    if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseKeyword)) {
                        results.push({ key: key, value: value });
                    }
                }
            });
            return results;
        } catch (err) {
            console.error("Error during data search:", err);
            return []; // Return an empty array on error
        }
    }

    async function searchTeamPlayer(keyword, isCompare = null) {
        const results = [];
        const lowerCaseKeyword = keyword.toLowerCase(); // For case-insensitive search
        const maxResults = 10;
        
        try {
            await teamPlayerStore.iterate(function(value, key, iterationNumber) {

                if (results.length >= maxResults) {
                    return 'stop'; // Return any non-undefined value to stop iteration
                }

                if(isCompare) {
                    if (typeof value === 'string' && value.toLowerCase() === lowerCaseKeyword) {
                        results.push({ key: key, value: value });
                    }
                } else {
                    if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseKeyword)) {
                        results.push({ key: key, value: value });
                    }
                }
            });
            return results;
        } catch (err) {
            console.error("Error during data search:", err);
            return []; // Return an empty array on error
        }
    }

    async function searchMarketType(keyword, isCompare = null) {
        const results = [];
        const lowerCaseKeyword = keyword.toLowerCase(); // For case-insensitive search
        const keyPrefix = document.getElementById('sports-sb').value;
        const maxResults = 10;
        
        try {
            await marketTypeStore.iterate(function(value, key, iterationNumber) {

                if (results.length >= maxResults) {
                    return 'stop'; // Return any non-undefined value to stop iteration
                }
                if (!key.startsWith(keyPrefix)) {
                    return;
                }

                if(isCompare) {
                    if (typeof value === 'string' && value.toLowerCase() === lowerCaseKeyword) {
                        results.push({ key: key, value: value });
                    }
                } else {
                    if (typeof value === 'string' && value.toLowerCase().includes(lowerCaseKeyword)) {
                        results.push({ key: key, value: value });
                    }
                }
            });
            return results;
        } catch (err) {
            console.error("Error during data search:", err);
            return []; // Return an empty array on error
        }
    }


    function addData(type) {
        const containerDiv = document.getElementById('data-list');  
        const addDataBtn = document.getElementById('add-data-btn');        
        const table = document.getElementById('data-table');
        const input = containerDiv.querySelector('input[type=text]');
        containerDiv.style.display = 'block';
        dataType = type;
        input.value = '';
        addDataBtn.disabled = true;
        input.focus();
        table.innerHTML = `
            <tr>
                <th colspan="2">${type.toUpperCase()}</th>
            </tr>
        `;
    }

    function searchBox(input) {
        
        //const containerDiv = document.getElementById(`${type}-search-box`);
        const table = document.getElementById('data-table');        
        const addDataBtn = document.getElementById('add-data-btn');     
        
        const type = dataType;
        let tableHtml = `
            <tr>
                <th colspan="2">${type.toUpperCase()}</th>
            </tr>
        `;
                
        if(input.value.length < 1) {
            table.innerHTML = tableHtml;
            addDataBtn.disabled = true;
            return;
        }
        addDataBtn.disabled = false;

        if(type === 'league') {

            searchLeague(input.value).then(results => {
                results.forEach(result => {
                    /*html*/
                    tableHtml += `
                        <tr>
                            <td>${result.value}</td>
                            <td>
                                <button class="blue" onclick="addToInput('${type}', '${result.key}', '${result.value}')"><i class="fas fa-plus"></i></button>
                            </td>
                        </tr>
                    `;
                });
                table.innerHTML = tableHtml;
            });

        } else
        if(type === 'home' || type === 'away') {

            searchTeamPlayer(input.value).then(results => {
                results.forEach(result => {
                    /*html*/
                    tableHtml += `
                        <tr>
                            <td>${result.value}</td>
                            <td>
                                <button class="blue" onclick="addToInput('${type}', '${result.key}', '${result.value}')"><i class="fas fa-plus"></i></button>
                            </td>
                        </tr>
                    `;
                });
                table.innerHTML = tableHtml;
            });

        }
        else { // market type

            searchMarketType(input.value).then(results => {
                results.forEach(result => {
                    /*html*/
                    tableHtml += `
                        <tr>
                            <td>${result.value}</td>
                            <td>
                                <button class="blue" onclick="addToInput('${type}', '${result.key}', '${result.value}')"><i class="fas fa-plus"></i></button>
                            </td>
                        </tr>
                    `;
                });
                table.innerHTML = tableHtml;
            });

        }
        
    }

    function addToInput(type, key, value) {
        
        const input = document.getElementById(`${type}-tb`);
        const table = document.getElementById('data-table');
        const marketTypeTitle = document.querySelector('.ev-calc-result .title .label');  

        input.value = value;
        input.dataset.id = key;
        marketTypeTitle.innerHTML = value;
        closeModal('data-list');
        
    }

    function addToLFC() {
        const type = dataType;
        const input = document.getElementById('search-data-tb');

        let text = "Are you sure you want to add this data to the database?";
        if (confirm(text) == true) {
            saveToLF(input, type);
        }
    }

    async function saveToLF(input, type) {
        const keyword = input.value;
        const keyPrefix = document.getElementById('sports-sb').value;
        const keyName = `${keyPrefix}-${Date.now()}`;

        const table = document.getElementById('data-table');
        let tableHtml = `
            <tr>
                <th colspan="2">${type.toUpperCase()}</th>
            </tr>
            <tr>
                <td>${keyword}</td>
                <td>
                    <button class="blue" onclick="addToInput('${type}', '${keyName}', '${keyword}')"><i class="fas fa-plus"></i></button>
                </td>
            </tr>
        `;
        table.innerHTML = tableHtml;

        if(type === 'league') {

            searchLeague(keyword, true).then(results => {            
                if(results.length > 0) {
                    const message = "Error: Duplicate entry.";
                    messageBox(false, message);
                } else {
                    addLFData('leagues', keyName, keyword);

                    const message = "Success: The data has been saved.";
                    messageBox(true, message);
                }
            });

        } else
        if(type === 'home' || type === 'away') {

            searchTeamPlayer(keyword, true).then(results => {            
                if(results.length > 0) {
                    const message = "Error: Duplicate entry.";
                    messageBox(false, message);
                } else {
                    addLFData('teamsPlayers', keyName, keyword);

                    const message = "Success: The data has been saved.";
                    messageBox(true, message);
                }
            });
        }
        else { // market type

            searchMarketType(keyword, true).then(results => {            
                if(results.length > 0) {
                    const message = "Error: Duplicate entry.";
                    messageBox(false, message);
                } else {
                    addLFData('marketTypes', keyName, keyword);

                    const message = "Success: The data has been saved.";
                    messageBox(true, message);
                }
            });

        }

        
    }

    function adjustStake(amount) {

        const stake = parseFloat(amount);
        const stakeTB = document.getElementById('bet-amount');
        stakeTB.value = parseFloat(stake).toFixed(2);
        const homeData = JSON.parse(localStorage.getItem('SBT-data-to-bet-home'));
        const awayData = JSON.parse(localStorage.getItem('SBT-data-to-bet-away'));
        const drawData = JSON.parse(localStorage.getItem('SBT-data-to-bet-draw')) || false;

        const homeOdds = homeData.bingoPlusOdds;
        const awayOdds = awayData.bingoPlusOdds;
        const drawOdds = drawData.bingoPlusOdds || false;
        
        const dataToBetType = localStorage.getItem('SBT-data-to-bet-type');
        const outcome = dataToBetType.split('-')[0]; // home, draw (if 3-way market), or away        

        const payoutTB = document.getElementById('bet-payout');
        const payout2TB = document.getElementById('bet-payout-2');

        if(outcome === 'home') {
            const payouts = computePayouts(stake, homeOdds);            
            payoutTB.value = payouts[0].toFixed(2);
            payout2TB.value = payouts[1].toFixed(2); // incluing bet

        } else
        if(outcome === 'away') {
            const payouts = computePayouts(stake, awayOdds);            
            payoutTB.value = payouts[0].toFixed(2);
            payout2TB.value = payouts[1].toFixed(2); // incluing bet
        }
        else { // draw
            const payouts = computePayouts(stake, drawOdds);            
            payoutTB.value = payouts[0].toFixed(2);
            payout2TB.value = payouts[1].toFixed(2); // incluing bet
        }

        
    }

    function roundOff(isDown) {
        const stake = document.getElementById('bet-amount');
        if(isDown) {
            const newStake = Math.floor(parseFloat(stake.value)).toFixed(2);
            adjustStake(newStake);
            return;
        }
        const newStake = Math.ceil(parseFloat(stake.value)).toFixed(2);
        adjustStake(newStake);
        return;
    }


    /* ------------------------------------ Save Bet ------------------------------------ */

    async function saveBet() {
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
        const betAwayOddsTB= document.getElementById('bet-home-odds');
        const betDrawOddsTB= document.getElementById('bet-draw-odds');
        const stakeTB = document.getElementById('bet-amount');
        
        const notesTA = document.getElementById('notes-ta');
        const orderDatePicker = document.getElementById('order-date-picker');

        
        const totals = JSON.parse(localStorage.getItem('SBT-totals') || "{totalBetCount:0}");
        const currentDateUnixMs = Date.now();
        const key = `bet-${parseInt(totals.totalBetCount) + 1}-${currentDateUnixMs}`;

        /*Error checks*/
        if(!sportsSB.value) {            
            const message = "Error: Sport is empty.";
            messageBox(false, message);
            return
        }
        if(!leagueTB.dataset.id) {            
            const message = "Error: League is empty.";
            messageBox(false, message);
            return
        }
        if(!homeNameTB.dataset.id) {            
            const message = "Error: Home Team is empty.";
            messageBox(false, message);
            return
        }
        if(!awayNameTB.dataset.id) {            
            const message = "Error: Away Team is empty.";
            messageBox(false, message);
            return
        }
        if(!matchDatePicker.value) {            
            const message = "Error: Match date is empty.";
            messageBox(false, message);
            return
        }

        if(!softbookSB.value) {            
            const message = "Error: Softbook is empty.";
            messageBox(false, message);
            return
        }
        if(!sharpbookSB.value) {            
            const message = "Error: Sharpbook is empty.";
            messageBox(false, message);
            return
        }

        if(!marketTypeTB.dataset.id) {            
            const message = "Error: Market Type is empty.";
            messageBox(false, message);
            return
        }

        if(!betHomeOddsTB.value) {            
            const message = "Error: Home Odds is empty.";
            messageBox(false, message);
            return
        }
        if(!betAwayOddsTB.value) {            
            const message = "Error: Away Odds is empty.";
            messageBox(false, message);
            return
        }
        if(!stakeTB.value) {            
            const message = "Error: Stake is empty.";
            messageBox(false, message);
            return
        }
        if(parseFloat(stakeTB.value) % 1 !== 0) {            
            const message = "Error: Stake must be a whole number.";
            messageBox(false, message);
            return
        }
        if(parseFloat(stakeTB.value) < 5) {            
            const message = "Error: Minimum stake is ₱5.";
            messageBox(false, message);
            return
        }
        if(!orderDatePicker.value) {            
            const message = "Error: Order date is empty.";
            messageBox(false, message);
            return
        }
        
        /*Error checks*/
        
        const homeData = JSON.parse(localStorage.getItem('SBT-data-to-bet-home'));
        const awayData = JSON.parse(localStorage.getItem('SBT-data-to-bet-away'));
        const drawData = JSON.parse(localStorage.getItem('SBT-data-to-bet-draw')) || false;
        
        const drawOddsSoft = drawData ? false : drawData.bingoPlusOdds;
        const drawOddsSharp = drawData ? false : drawData.pinnacleOdds;

        let oddsPlaced = 0;

        let oddsDevigged = [];
        let evValue = [];
        let fullKelly = [];
        
        const betTypeLS = localStorage.getItem('SBT-data-to-bet-type').split('-');
        console.log(betTypeLS);
        
        if(betTypeLS[0] === 'home') {
            oddsPlaced = homeData.bingoPlusOdds;

            oddsDevigged = [
                homeData.methodData[0].oddsDevigged,
                homeData.methodData[1].oddsDevigged,
                homeData.methodData[2].oddsDevigged,
            ];
            evValue = [
                homeData.methodData[0].evValue,
                homeData.methodData[1].evValue,
                homeData.methodData[2].evValue,
            ];
            fullKelly = [
                homeData.methodData[0].fullKelly,
                homeData.methodData[1].fullKelly,
                homeData.methodData[2].fullKelly,
            ];
        } else
        if(betTypeLS[0] === 'away') {            
            oddsPlaced = awayData.bingoPlusOdds;            
            
            oddsDevigged = [
                awayData.methodData[0].oddsDevigged,
                awayData.methodData[1].oddsDevigged,
                awayData.methodData[2].oddsDevigged,
            ];
            evValue = [
                awayData.methodData[0].evValue,
                awayData.methodData[1].evValue,
                awayData.methodData[2].evValue,
            ];
            fullKelly = [
                awayData.methodData[0].fullKelly,
                awayData.methodData[1].fullKelly,
                awayData.methodData[2].fullKelly,
            ];
        } else { // draw

            if(drawData) {
                oddsPlaced = drawData.bingoPlusOdds;

                oddsDevigged = [
                    drawData.methodData[0].oddsDevigged,
                    drawData.methodData[1].oddsDevigged,
                    drawData.methodData[2].oddsDevigged,
                ];
                evValue = [
                    drawData.methodData[0].evValue,
                    drawData.methodData[1].evValue,
                    drawData.methodData[2].evValue,
                ];
                fullKelly = [
                    drawData.methodData[0].fullKelly,
                    drawData.methodData[1].fullKelly,
                    drawData.methodData[2].fullKelly,
                ];
            }
            
        }

        const defaults = await configStore.getItem('defaults');
        const matchDateUnixMs = datePickerToUnixMS(matchDatePicker.value);
        const orderDateUnixMs = datePickerToUnixMS(orderDatePicker.value);

        const lastCalcInputs = JSON.parse(localStorage.getItem('SBT-calc-last-input') || "{currentBankroll:0}");
        
        const data = {
            "betNumber": (parseInt(totals.totalBetCount) + 1),
            "systemCreatedDateUnixMs": currentDateUnixMs,
            "systemModifiedDateUnixMs": currentDateUnixMs,
            "startingBankroll": defaults.startingBankroll,
            "currentBankroll": lastCalcInputs.currentBankroll,
            "sportsbooks": {
                "soft": {
                    "id": softbookSB.value,
                    "name": softbookSB.options[softbookSB.selectedIndex].textContent,
                    "odds": [
                        homeData.bingoPlusOdds,
                        awayData.bingoPlusOdds,
                        drawOddsSoft
                    ]
                },
                "sharp": {
                    "id": sharpbookSB.value,
                    "name": sharpbookSB.options[sharpbookSB.selectedIndex].textContent,
                    "odds": [
                        homeData.pinnacleOdds,
                        awayData.pinnacleOdds,
                        drawOddsSharp
                    ]
                }		
            },
            "matchInfo": {
                "sport": {
                    "id": sportsSB.value,
                    "name": sportsSB.options[sportsSB.selectedIndex].textContent
                },
                "league": {
                    "id": leagueTB.dataset.id,
                    "name": leagueTB.value
                },
                "home": {
                    "id": homeNameTB.dataset.id,
                    "name": homeNameTB.value
                },
                "away": {
                    "id": awayNameTB.dataset.id,
                    "name": awayNameTB.value
                },
                "matchDateUnixMs": matchDateUnixMs // MUST BE CHANGED
            },	
            "betDetails": {
                "marketType": {
                    "id": marketTypeTB.dataset.id,
                    "name": marketTypeTB.value,
                    "value": marketTypeValueTB.value
                },
                "stake": stakeTB.value,
                "oddsPlaced": oddsPlaced,
                "closingOdds": oddsPlaced, // default and can be changed
                "sharpOddsDevigged": {
                    "shin": oddsDevigged[0],
                    "power": oddsDevigged[1],
                    "norm": oddsDevigged[2]
                },
                "evValue": {
                    "shin": evValue[0],
                    "power": evValue[1],
                    "norm": evValue[2]
                },
                "fullKelly": {
                    "shin": fullKelly[0],
                    "power": fullKelly[1],
                    "norm": fullKelly[2]
                },
                "orderDateUnixMs": orderDateUnixMs, // MUST BE CHANGED
                "settlementDateUnixMs": matchDateUnixMs, // default is the match date
                "status": "running",
                "profitLoss": parseFloat(stakeTB.value) * -1,
            },
            "notes": notesTA.value
        };
        
        const success = await betStore.setItem(key, data);

        if(success) {
       
            const totals = await calculateTotals(true);
            const defaults = await configStore.getItem('defaults');
            
            const updatedBankroll = {
                currentBankroll: parseFloat(defaults.currentBankroll) + parseFloat(totals.totalProfit)
            }
            await updateLFData('config', 'defaults', updatedBankroll);


            const message = "Success: The bet has been added.";
            messageBox(true, message);
            
            clearInputs();
        }
        
        
    }   
    
    /* ------------------------------------ Save Bet ------------------------------------ */


    function clearInputs() {
        const leagueTB = document.getElementById('league-tb');
        const homeNameTB = document.getElementById('home-tb');
        const awayNameTB = document.getElementById('away-tb');
        const matchDatePicker = document.getElementById('match-date-picker');
        const orderhDatePicker = document.getElementById('order-date-picker');

        const marketTypeValueTB = document.getElementById('market-type-value-tb');
        
        const betHomeOddsTB = document.getElementById('bet-home-odds');
        const betAwayOddsTB= document.getElementById('bet-away-odds');
        const betDrawOddsTB= document.getElementById('bet-draw-odds');
        const stakeTB = document.getElementById('bet-amount');
        const betPayoutTB = document.getElementById('bet-payout');
        const betPayout2TB = document.getElementById('bet-payout-2');
        
        const notesTA = document.getElementById('notes-ta');
        
        // clear inputs
        leagueTB.value = '';
        leagueTB.dataset.id = '';
        homeNameTB.value = '';
        homeNameTB.dataset.id = '';
        awayNameTB.value = '';
        awayNameTB.dataset.id = '';
        matchDatePicker.value = '';
        orderhDatePicker.value = '';

        marketTypeValueTB.value = '';

        betHomeOddsTB.value = '';
        betAwayOddsTB.value = '';
        betDrawOddsTB.value = '';
        stakeTB.value = '';
        betPayoutTB.value = '';
        betPayout2TB.value = '';
        notesTA.value = '';

        // clear localStorage
        localStorage.removeItem('SBT-calc-last-input');
        localStorage.removeItem('SBT-data-to-bet-draw');
        localStorage.removeItem('SBT-data-to-bet-home');
        localStorage.removeItem('SBT-data-to-bet-away');
        localStorage.removeItem('SBT-data-to-bet-type');

    }