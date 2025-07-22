  
  const sportsbookStore = localforage.createInstance({
          storeName: 'sportsbooks',
  });
  const betStore = localforage.createInstance({
          storeName: 'bets',
  });
  const leagueStore = localforage.createInstance({
          storeName: 'leagues',
  });
  const teamPlayerStore = localforage.createInstance({
          storeName: 'teamsPlayers',
  });
  const sportStore = localforage.createInstance({
          storeName: 'sports',
  });
  const marketTypeStore = localforage.createInstance({
          storeName: 'marketTypes',
  });
  const configStore = localforage.createInstance({
          storeName: 'config',
  });

  const storeMap = {
    'sportsbooks': sportsbookStore,
    'bets': betStore,
    'leagues': leagueStore,
    'teamsPlayers': teamPlayerStore,
    'sports': sportStore,
    'marketTypes': marketTypeStore,
    'config': configStore
  };


  
  async function saveObjectToStore(storeInstance, dataToSave) {
      const promises = [];
      for (const key in dataToSave) {
          // Ensure we only process properties directly on the object, not inherited ones.
          if (Object.hasOwnProperty.call(dataToSave, key)) {
              promises.push(storeInstance.setItem(key, dataToSave[key]));
          }
      }
      // Wait for all setItem operations for this store to complete concurrently.
      await Promise.all(promises);
      console.log(`Data successfully saved to store: ${storeInstance._config.storeName}`);
  }

  async function importAllLocalForageData(jsonData, clearExisting = true) {
      // Basic validation to ensure jsonData is a valid object.
      if (typeof jsonData !== 'object' || jsonData === null) {
          console.error("Invalid jsonData provided for import: Root is not an object. Please ensure your JSON file is correctly formatted.");
          throw new Error("Invalid jsonData format.");
      }

      const importOperations = [];

      // Iterate through each top-level key in your parsed JSON data (e.g., "sites", "novels").
      for (const storeName in jsonData) {
          if (Object.hasOwnProperty.call(jsonData, storeName)) {
              const storeData = jsonData[storeName]; // The data object for a specific store (e.g., all 'sites' data).
              const targetStore = storeMap[storeName]; // Get the actual localforage instance using our map.

              // Ensure we have a corresponding localforage instance and the data for it is a valid object.
              if (targetStore && typeof storeData === 'object' && storeData !== null) {
                  // We build a promise chain for each store: first clear (if desired), then save.
                  let operationChain = Promise.resolve(); // Start with a promise that's already resolved.

                  if (clearExisting) {
                      operationChain = operationChain.then(async () => {
                          console.log(`Clearing existing data from store: ${storeName}...`);
                          await targetStore.clear(); // Clear the current localforage store.
                          console.log(`Store '${storeName}' cleared.`);
                      });
                  }

                  // After clearing (or immediately if not clearing), save the new data.
                  operationChain = operationChain.then(() => saveObjectToStore(targetStore, storeData));

                  // Add this store's entire operation chain to our list of parallel operations.
                  importOperations.push(operationChain);
              } else {
                  console.warn(`Skipping import for unknown or invalid store data: '${storeName}'. This section will not be imported.`);
              }
          }
      }

      try {
          // Wait for all individual store import operations (clear + save) to complete.
          await Promise.all(importOperations);
          console.log("All LocalForage data imported successfully!");
      } catch (error) {
          console.error("An error occurred during localforage data import:", error);
          // Re-throw the error so any calling code can handle it.
          throw error;
      }
  }


  async function getLFData(storeName, key) {
    try {
      if(storeName == 'sportsbooks') {
        const data = await sportsbookStore.getItem(key);
        return data;
      } else 

      if(storeName == 'bets') {
        const data = await betStore.getItem(key);
        return data;
      } else 

      if(storeName == 'leagues') {
        const data = await leagueStore.getItem(key);
        return data;
      } else 

      if(storeName == 'teamsPlayers') {
        const data = await teamPlayerStore.getItem(key);
        return data;
      } else 

      if(storeName == 'sports') {
        const data = await configStore.getItem(key);
        return data;
      } else 

      if(storeName == 'marketTypes') {
        const data = await marketTypeStore.getItem(key);
        return data;
      }
      
      else {
        const data = await teamPlayerStore.getItem(key);      
        return data;
      }
      
    } catch (error) {
        console.log('Error retrieving data:', error);
        return null;
    }
  }

  async function getAllLFData(storeName) {
    const results = [];
    try {
        
        if(storeName == 'sportsbooks') {

          await sportsbookStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } else 

        if(storeName == 'bets') {

          await betStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } else 

        if(storeName == 'leagues') {

          await leagueStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } else 

        if(storeName == 'teamsPlayers') {

          await teamPlayerStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } else 

        if(storeName == 'sports') {

          await sportStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } else 

        if(storeName == 'marketTypes') {

          await marketTypeStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        } 

        else {
          await configStore.setItem(key, data);

          await configStore.iterate((value, key, iterationNumber) => {
            results.push({ index: iterationNumber, key: key, value: value });
          });

        }
        return results;
    } catch (err) {
        console.error("Error during data search:", err);
        return [];
    }
  }

  async function addLFData(storeName, key, data) {
    try {
      if(storeName == 'sportsbooks') {
        await sportsbookStore.setItem(key, data);
      } else 

      if(storeName == 'bets') {
        await betStore.setItem(key, data);
      } else 

      if(storeName == 'leagues') {
        await leagueStore.setItem(key, data);
      } else 

      if(storeName == 'teamsPlayers') {
        await teamPlayerStore.setItem(key, data);
      } else 

      if(storeName == 'sports') {
        await sportStore.setItem(key, data);
      } else 

      if(storeName == 'marketTypes') {
        await marketTypeStore.setItem(key, data);
      } 

      else {
        await configStore.setItem(key, data);
      }
      
    } catch (error) {
        console.error('Error adding data:', error);
        return null;
    }
  }

  async function updateLFData(storeName, key, updates) {
    try {
      // Retrieve the existing item from localForage.
      let existingItem;
      if(storeName == 'sportsbooks') {
        existingItem = await sportsbookStore.getItem(key);
      } else

      if(storeName == 'bets') {
        existingItem = await betStore.getItem(key);
      } else

      if(storeName == 'leagues') {
        existingItem = await leagueStore.getItem(key);
      } else

      if(storeName == 'teamsPlayers') {
        existingItem = await teamPlayerStore.getItem(key);
      } else

      if(storeName == 'sports') {
        existingItem = await sportStore.getItem(key);
      } else

      if(storeName == 'marketTypes') {
        existingItem = await marketTypeStore.getItem(key);
      }

      else { //config
        existingItem = await configStore.getItem(key);
      }

      if (existingItem) {
        // Merge the existing item with the provided updates.
        const updatedItem = { ...existingItem, ...updates };

        // Store the updated item back into localForage.
        if(storeName == 'sportsbooks') {
          await sportsbookStore.setItem(key, updatedItem);
        } else

        if(storeName == 'bets') {
          await betStore.setItem(key, updatedItem);
        } else

        if(storeName == 'leagues') {
          await leagueStore.setItem(key, updatedItem);
        } else

        if(storeName == 'teamsPlayers') {
          await teamPlayerStore.setItem(key, updatedItem);
        } else

        if(storeName == 'sports') {
          await sportStore.setItem(key, updatedItem);
        } else

        if(storeName == 'marketTypes') {
          await marketTypeStore.setItem(key, updatedItem);
        }

        else {
          await configStore.setItem(key, updatedItem);
        }

      } else {
        console.error(`Item with key '${key}' not found.`);
      }
    } catch (error) {
      console.error(`Error updating item with key '${key}':`, error);
      throw error; // Rethrow the error for the caller to handle.
    }
  }



  /* -------------------- HTTP Requests -------------------- */

  function getDefaultData(callback) {
    const dataURL = "/sports_betting_tracker/data/data.json";

    fetch(dataURL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(data => {
            if (callback) callback(JSON.parse(data));
        })
        .catch(err => console.error("Fetch error:", err));
  }


  function uploadDataGD(lastDBUpdate, data, fileId, callback) { // Added fileId
    const deploymentId = 'AKfycbxm3bzNh6hQbzkyruaAWHXLKKEXJ0OanQOBvAwbzFAiXvReZiuxLspzAmHsAcj-sjU';
    const scriptURL = `https://script.google.com/macros/s/${deploymentId}/exec`;

    fetch(scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        lastDBUpdate: lastDBUpdate,
        data: JSON.stringify(data, null, 2), // data is an object
        fileId: fileId // Added fileId here
      }).toString(),
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.text();
    })
    .then(data => {
      if (callback) callback(JSON.parse(data));
    })
    .catch(err => console.error("Fetch error:", err));
  }


  
  /* -------------------- HTTP Requests -------------------- */




  function closeModal(elemId) {
          const elem = document.getElementById(elemId);
          elem.style.display = 'none';
  }

  function currencyFormatter(number) {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2, // Ensure at least 2 decimal places
      maximumFractionDigits: 2  // Ensure at most 2 decimal places (for rounding)
    });

    const formattedNumber = formatter.format(number);
    return formattedNumber;
  }

  function selectRadio(parent, elem) {
    const radios = document.querySelectorAll(`.${parent} .radio`);
    radios.forEach(radio => {
      radio.classList.remove('radio-selected');
    });
    elem.classList.add('radio-selected');
  }

  function messageBox(isSuccess, message) {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'flex';
    let iconClass = 'exclamation';
    let backgroundColor = '#bc2f2f';
    if(isSuccess) {
      iconClass = 'check';
      backgroundColor = '#2fbc2f';
    }
    /*html*/
    messageDiv.innerHTML = `
      <div style="background-color:${backgroundColor}">
          <i class="fa-solid fa-circle-${iconClass}"></i>
          <p>${message}</p>
      </div>
    `;
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

  async function reloadDefaults() {
    getDefaultData((data) => {

      //default values
      const defaults = data.defaults;
      addLFData('config', 'defaults', defaults);

      //sports
      const sports = data.sports;
      for (let i = 0; i < sports.length; i++) {
        const item = sports[i];
        const id = item.replace(' ', '_').toLowerCase();
        addLFData('sports', id, item);

      }

      //sportsbooks
      const sportsbooks = data.sportsbooks;
      for (let i = 0; i < sportsbooks.length; i++) {
        const item = sportsbooks[i];
        addLFData('sportsbooks', (i + 1), item);
      }


      //market types
      const marketTypesBySportObject = data.marketTypes[0];
      const sportsMarketKeys = Object.keys(marketTypesBySportObject);
      sportsMarketKeys.forEach(sportKey => {
          const marketTypes = marketTypesBySportObject[sportKey];
          for (let i = 0; i < marketTypes.length; i++) {
            const item = marketTypes[i];
            addLFData('marketTypes', `${sportKey}-${(i + 1)}`, item);
          }

      });


      //leagues
      const leaguesBySportObject = data.leagues[0];
      const sportsLeaguesKeys = Object.keys(leaguesBySportObject);
      sportsLeaguesKeys.forEach(sportKey => {
          const leagues = leaguesBySportObject[sportKey];
          for (let i = 0; i < leagues.length; i++) {
            const item = leagues[i];
            addLFData('leagues', `${sportKey}-${(i + 1)}`, item);
          }

      });

      
    });
    const message = "Success: Default values has been reloaded."
    messageBox(true, message);
  }

  function formatTimestampToRelativeDate(input) {
    let date;

    // Check if the input is a Unix timestamp (string or number)
    if (typeof input === 'string' && /^\d+$/.test(input) || typeof input === 'number') {
      date = new Date(parseInt(input, 10));
    }
    // Check if the input is in MM/DD/YYYY hh:mm format
    else if (typeof input === 'string' && /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(input)) {
      // Parse the MM/DD/YYYY hh:mm string manually to ensure correct date object creation
      const parts = input.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
      if (parts) {
        // Month is 0-indexed in Date constructor
        date = new Date(parts[3], parts[1] - 1, parts[2], parts[4], parts[5]);
      } else {
        return "Invalid Date Format";
      }
    } else {
      return "Invalid Input Format";
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (diffDays === 0) {
      return `Today ${timeString}`;
    } else if (diffDays === 1) {
      return `Tomorrow ${timeString}`;
    } else if (diffDays === -1) {
      return `Yesterday ${timeString}`;
    } else if (date.getFullYear() === now.getFullYear()) {
      return `${months[date.getMonth()]} ${date.getDate()} ${timeString}`;
    } else {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${timeString}`;
    }
  }

  function datePickerToUnixMS(datetimeValue) {

    if (!datetimeValue) {
      console.warn("datetime-local input has no value.");
      return null; // Or handle as an error
    }

    // Create a Date object from the input's value
    // The datetime-local input value is in "YYYY-MM-DDTHH:mm" format,
    // which Date.parse() or the Date constructor can understand.
    const dateObject = new Date(datetimeValue);

    // Check if the dateObject is a valid date
    if (isNaN(dateObject.getTime())) {
      console.error("Invalid date/time value from input:", datetimeValue);
      return null;
    }

    // Get the Unix timestamp in milliseconds
    const timestampMs = dateObject.getTime();

    return timestampMs;
  }

  async function getStoreContentAsObject(storeInstance) {
      const content = {};
      try {
          await storeInstance.iterate((value, key) => {
              content[key] = value;
          });
          return content;
      } catch (err) {
          console.error(`Error retrieving content from store (${storeInstance._config.storeName}):`, err);
          return {};
      }
  }

  async function getAllLocalForageData() {
      const allData = {};

      try {
          const [sportsbooksData, betsData, leaguesData, teamsPlayersData, sportsData, marketTypesData, configsData] = await Promise.all([
              getStoreContentAsObject(sportsbookStore),
              getStoreContentAsObject(betStore),
              getStoreContentAsObject(leagueStore),
              getStoreContentAsObject(teamPlayerStore),
              getStoreContentAsObject(sportStore),
              getStoreContentAsObject(marketTypeStore),
              getStoreContentAsObject(configStore)
          ]);

          allData.sportsbooks = sportsbooksData;
          allData.bets = betsData;
          allData.leagues = leaguesData;
          allData.teamsPlayers = teamsPlayersData;
          allData.sports = sportsData;
          allData.markeyTypes = marketTypesData;
          allData.configs = configsData;

          return allData;

      } catch (error) {
        
          console.error("Error gathering all localforage data:", error);
          return null;
      }
  }

  async function downloadLocalForageBackup() {
    const data = await getAllLocalForageData();

    if (data) {
        try {
            const jsonString = JSON.stringify(data, null, 2); // null, 2 for pretty printing
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            // Add the .external class to prevent router interception
            a.classList.add('external'); // <--- ADD THIS LINE

            // Get current date for filename
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const year = today.getFullYear();
            let hours = today.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            hours = hours.toString().padStart(2, '0');
            const minutes = today.getMinutes().toString().padStart(2, '0');
            const seconds = today.getSeconds().toString().padStart(2, '0');
            const dateTimeString = `${month}-${day}-${year}-${hours}-${minutes}-${seconds}-${ampm}`;

            a.download = `bet_tracker_backup_${dateTimeString}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Error creating or downloading JSON file:", e);
            alert(`Error downloading backup.\nError: ${e}`);
        }
    } else {
        alert('No data to download or an error occurred.');
    }
}


  function formatTimeAgo(timestamp) {
    // Parse the input timestamp
    let inputDate;
  
    if (timestamp.includes(' at ')) {
      // Parse custom format like "April 22, 2025 at 6:22 PM"
      const [datePart, timePart] = timestamp.split(' at ');
      inputDate = new Date(`${datePart} ${timePart}`);
    } else {
      // Standard parsing for other formats
      inputDate = new Date(timestamp);
    }
  
    // Check if date is valid
    if (isNaN(inputDate.getTime())) {
      console.error("Invalid date format:", timestamp);
      return timestamp;
    }
  
    // Get current date
    const currentDate = new Date();
  
    // Calculate the difference in milliseconds
    const diffMs = currentDate - inputDate;
  
    // Convert to seconds
    const diffSeconds = Math.floor(diffMs / 1000);
  
    // Ensure a minimum of 2 seconds ago
    const adjustedDiffSeconds = Math.max(2, diffSeconds);
  
    // Check if older than 30 days (30 days * 24 hours * 60 minutes * 60 seconds)
    const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
    if (adjustedDiffSeconds > THIRTY_DAYS_IN_SECONDS) {
      // Format as "Short Month Day, Year"
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return inputDate.toLocaleDateString(undefined, options);
    }
  
    // Convert to appropriate units for timestamps within 30 days
    if (adjustedDiffSeconds < 60) {
      return `${adjustedDiffSeconds}s${adjustedDiffSeconds !== 1 ? '' : ''} ago`;
    }
  
    const diffMinutes = Math.floor(adjustedDiffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m${diffMinutes !== 1 ? '' : ''} ago`;
    }
  
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h${diffHours !== 1 ? '' : ''} ago`;
    }
  
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d${diffDays !== 1 ? '' : ''} ago`;
  }
