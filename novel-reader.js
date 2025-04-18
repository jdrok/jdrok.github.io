

/* ------------------- START of localForage settings -------------------------------------- */
/* LocalForage store names / instances */
const novelStore = localforage.createInstance({
    storeName: 'novels',
});
  
const chapterStore = localforage.createInstance({
    storeName: 'chapters',
});
  
const glossaryStore = localforage.createInstance({
    storeName: 'glossary',
});
/* ------------------- END of localForage settings -------------------------------------- */


const loadDelay = 400; //in miliseconds

const ctEdit = document.getElementById('chapter-text-edit');
const ctView = document.getElementById('chapter-text-view');
const goSepBtn = document.getElementById('go-sep-btn');



/* ------------------- START of Event listeners -------------------------------------- */


// Initialize application
document.addEventListener('DOMContentLoaded', () => {


    // Set default view if not set
    if (!localStorage.getItem('NR-current-view')) {
      localStorage.setItem('NR-current-view', 'novel-list');
    }
    const currentView = localStorage.getItem('NR-current-view');
    
    setTimeout(function() {
      // Load the current view
      changeView(currentView);
    }, loadDelay);

    // Load font size
    if (!localStorage.getItem('NR-font-size')) {
      localStorage.setItem('NR-font-size', 16);
    }
    setFontSize(localStorage.getItem('NR-font-size'));
    
});

document.addEventListener("scroll", () => {
    const clNovelTitle = document.querySelector('.cl-novel-title');
    if(window.scrollY > clNovelTitle.offsetHeight) {
        document.querySelector('.cl-novel-title-sm').style.display = 'block';

    } else {
        document.querySelector('.cl-novel-title-sm').style.display = 'none';
    }
    
});
/* ------------------- END of Event listeners -------------------------------------- */






/* ------------------- START of View management -------------------------------------- */
async function changeView(viewName, key = null) {
    localStorage.setItem('NR-current-view', viewName);
    const currentView = localStorage.getItem('NR-current-view');
    
    displayView();
    scrollToPos();
    

    if(currentView == "novel-list") {
        loadNovels();
    } else if(currentView == "chapter-list") {
        if(key != null) {
            localStorage.setItem('NR-novel-key', key);
        }
        
        localStorage.removeItem("NR-chapter-key");
        loadChapters();
    } else if(currentView == "edit-novel") {
      populateEditNovelForm();
    } else if(currentView == "view-chapter") {
        if(key != null) {
            localStorage.setItem('NR-chapter-key', key);
        }

        if(localStorage.getItem('NR-chapter-key') !== null) {
          viewChapter(localStorage.getItem('NR-chapter-key'));
        } else {
          changeView('chapter-list');
        }

        localStorage.removeItem("NR-last-focus-position");
        
    } else if(currentView == "edit-chapter") {

      if(key != null) {
        localStorage.setItem('NR-chapter-key', key);
      }

      if(localStorage.getItem('NR-chapter-key') !== null) {
        editChapter();
        
        console.log('this 1');
      } else {
        changeView('chapter-list');
        console.log('this 2');
      }

    } else if(currentView == "add-glossary") {

      populateChapterSelect(localStorage.getItem('NR-novel-key'), 'add');
      
    } else if(currentView == "glossary-list") {

      viewGlossary(localStorage.getItem('NR-novel-key'));

    } else if(currentView == "edit-glossary") {
      if(key != null) {
        localStorage.setItem('NR-glossary-key', key);
      }
      if(localStorage.getItem('NR-glossary-key') !== null) {
        populateEditGlossary(localStorage.getItem('NR-glossary-key'));
      } else {
        changeView('glossary-list');
      }

    } 
}

function displayView() {
    const currentView = localStorage.getItem('NR-current-view');
    const views = document.querySelectorAll('.view');

  
    // Hide all views
    views.forEach(view => {
    view.style.display = 'none';
    });
  
    // Show current view
    document.getElementById(currentView).style.display = 'block';
}
/* ------------------- END of View management -------------------------------------- */






/* ------------------- START of Load novels --------------------------------------  */
async function loadNovels() {
  try {
      const keys = await novelStore.keys();
      const novelsUL = document.getElementById('novels-ul');
      novelsUL.innerHTML = '';

      // Fetch all novel data and store it in an array
      const novelData = await Promise.all(keys.map(async key => {
          const novel = await novelStore.getItem(key);
          return { key, novel };
      }));

      // Sort the novel data by datetime in ascending order
      novelData.sort((a, b) => {
          return new Date(a.novel.datetime) - new Date(b.novel.datetime);
      });

      // Generate and append the HTML for each novel
      novelData.forEach(({ key, novel }) => {
          if (novel) {
              const novelDisplay = `
                  <li onclick="changeView('chapter-list', '${key}')"><img src="novel-reader-${novel.country}.jpg"> ${novel.title} ${novel.isAdult == 1 ? '<sup class="adult">18+</sup>' : ''}</li>
              `;
              novelsUL.insertAdjacentHTML('beforeend', novelDisplay);
          }
      });

  } catch (err) {
      console.error("Error loading novels:", err);
  }
}
/* ------------------- END of Load novels --------------------------------------  */









/* ------------------- START of Add new novel --------------------------------------  */
async function saveNovel() {
    const title = document.getElementById('add-novel-title').value.trim();
    const synopsis = document.getElementById('add-novel-synopsis').value.trim();
    const isAdult = document.getElementById('add-novel-adult').value.trim();
    const country = document.getElementById('add-novel-country').value.trim();

    if (!title) {
        alert('Please enter a novel title')
        return;
    }

    try {
        const novelKey = stringToSixDigitNumber(title);

        // Check if the key already exists
        const existingNovel = await novelStore.getItem(novelKey);
        if (existingNovel) {
            alert('A novel with this title already exists.');
            return; // Stop saving if it exists
        }

        const novelData = {
            title: title,
            synopsis: synopsis,
            isAdult: isAdult,
            country: country,
            datetime: new Date().toLocaleString('en-US', { 
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
            })
        };

        await novelStore.setItem(novelKey, novelData);

        successMsg("Novel has been successfully added.");

        //Clear form
        document.getElementById('add-novel-title').value = '';
        document.getElementById('add-novel-synopsis').value = '';

        //Change view to Novel list
        changeView('novel-list');


    } catch (err) {
        console.error("Error saving novel:", err);
        alert('Failed to save novel');
    }
}

/* ------------------- END of Add new novel --------------------------------------  */







/* ------------------- END of Delete novel and its chapters --------------------------------------  */

function deleteYN() {
  let text = "All the chapters associated with this novel will also be delete.\nAre you really sure you want to DELETE this novel?";
  if (confirm(text) == true) {
    deleteInputDelete();
  }
}

function deleteInputDelete() {
  let confirm = prompt('Please type "DELETE" to confirm:', '');
  if (confirm === "DELETE") { // Use strict equality (===) and check for "DELETE"
    deleteNovelConfirmed();
  }
}

async function deleteNovelConfirmed() {

  const novelKey = localStorage.getItem('NR-novel-key');
  try {
    await novelStore.removeItem(novelKey);

    deleteChapters(novelKey+"-");

  } catch (error) {
    console.error(`Error removing novel with key '${novelKey}':`, error);
  }
}

async function deleteChapters(keyPrefix) {
  try {
    const keys = await chapterStore.keys();
    const keysToRemove = keys.filter(key => key.startsWith(keyPrefix));

    await Promise.all(keysToRemove.map(key => chapterStore.removeItem(key)));
    
    successMsg('The Novel and all its chapters have been deleted successfully.');
    changeView('novel-list');

  } catch (error) {
    console.error(`Error removing chapters with key prefix '${keyPrefix}':`, error);
  }
}
/* ------------------- END of Delete novel and its chapters --------------------------------------  */







/* ------------------- START of Load chapters --------------------------------------  */
async function loadChapters() {
  try {
    const currentNovelKey = localStorage.getItem("NR-novel-key");
    const keys = await chapterStore.keys();

    const chaptersUL = document.getElementById('chapters-UL');
    chaptersUL.innerHTML = '';

    const clTitle = document.getElementById('cl-novel-title');
    const novelInfo = await novelStore.getItem(currentNovelKey);
    clTitle.innerHTML = novelInfo.title;

    // Filter and map keys to objects with key and chapter data
    const chapterData = await Promise.all(
      keys
        .filter(key => key.startsWith(currentNovelKey + '-'))
        .map(async key => {
          const chapter = await chapterStore.getItem(key);
          return { key, chapter };
        })
    );

    // Sort the chapter data by position in descending order
    chapterData.sort((a, b) => b.chapter.position - a.chapter.position);

    // Generate and append the HTML for each chapter
    chapterData.forEach(({ key, chapter }, index, array) => {
      if (chapter) {
        let moveUpButton = '';
        let moveDownButton = '';

        // Determine if Move Up button should be shown
        if (index > 0) {
          moveUpButton = `<button onclick="movePosition(1, '${array[index - 1].key}')" class="float-right">&#129105;</button>`;
        }

        // Determine if Move Down button should be shown
        if (index < array.length - 1) {
          moveDownButton = `<button onclick="movePosition(-1, '${array[index + 1].key}')" class="float-right" style="margin-left:20px">&#129107;</button>`;
        }

        const chapterDisplay = `
          <li onclick="changeView('view-chapter', '${key}')">
            <sup class="chapter-position">${chapter.position}</sup>
            ${chapter.title}
            ${moveDownButton}
            ${moveUpButton}
          </li>
        `;
        chaptersUL.insertAdjacentHTML('beforeend', chapterDisplay);
      }
    });

  } catch (err) {
    console.error("Error loading novels:", err);
  }
}


async function movePosition(direction, otherChapterKey) {
  event.stopPropagation();
  try {
    const clickedLi = event.target.closest('li');

    if (!clickedLi) {
      console.error("Error: Clicked element is not within an <li>");
      return;
    }

    const onclickAttribute = event.target.closest('li').getAttribute('onclick');
    const matches = onclickAttribute.match(/'([^']+)'/g); // Get all matches
    const currentChapterKey = matches[1].replace(/'/g, ''); // Get the second match and remove single quotes


    const currentChapter = await chapterStore.getItem(currentChapterKey);
    const otherChapter = await chapterStore.getItem(otherChapterKey);

    successMsg('Move position successfully.');

    if (!currentChapter || !otherChapter) {
      console.error("Chapter not found.");
      return;
    }

    // Swap positions
    const tempPosition = currentChapter.position;
    currentChapter.position = otherChapter.position;
    otherChapter.position = tempPosition;

    // Update localforage
    await chapterStore.setItem(currentChapterKey, currentChapter);
    await chapterStore.setItem(otherChapterKey, otherChapter);

    // Reload the chapter list
    loadChapters();

  } catch (err) {
    console.error("Error moving chapter position:", err);
  }
}
/* ------------------- END of Load chapters --------------------------------------  */







/* ------------------- START of Edit novel information --------------------------------------  */
async function populateEditNovelForm() {
  try {
    const novelKey = localStorage.getItem('NR-novel-key');
    const novelData = await novelStore.getItem(novelKey);

    if (novelData) {
      document.getElementById('edit-novel-title').value = novelData.title;
      document.getElementById('edit-novel-synopsis').value = novelData.synopsis;

      // Select the correct option for 'isAdult'
      document.getElementById('edit-novel-adult').value = novelData.isAdult;

      // Select the correct option for 'country'
      document.getElementById('edit-novel-country').value = novelData.country;
    } else {
      console.error("Novel data not found for key:", novelKey);
    }
  } catch (error) {
    console.error("Error populating edit form:", error);
  }
}

async function updateNovel() {
  const novelKey = localStorage.getItem('NR-novel-key');
  const updatedTitle = document.getElementById('edit-novel-title').value.trim();
  const updatedSynopsis = document.getElementById('edit-novel-synopsis').value.trim();
  const updatedAdult = document.getElementById('edit-novel-adult').value.trim();
  const updatedCountry = document.getElementById('edit-novel-country').value.trim();

  const updatedNovelData = {
      title: updatedTitle,
      synopsis: updatedSynopsis,
      isAdult: updatedAdult,
      country: updatedCountry
  };

  if (!updatedTitle) {
      alert('Please enter a novel title');
      return;
  }

  try {
      const generatedKey = stringToSixDigitNumber(updatedTitle);

      // Check if a novel with the new title already exists, but exclude the current novel
      const existingNovel = await novelStore.getItem(generatedKey);

      if (existingNovel && generatedKey !== stringToSixDigitNumber( (await novelStore.getItem(novelKey)).title ) ) {
          alert('A novel with this title already exists.');
          return; // Stop saving if it exists and is not the current novel
      }

      await novelStore.setItem(novelKey, updatedNovelData);
      successMsg("Novel updated successfully.");
  } catch (error) {
      console.error("Error updating novel: ", error);
  }
}
/* ------------------- END of Edit novel information --------------------------------------  */





/* ------------------- START of Add new chapter --------------------------------------  */
async function addChapter() {
    
    try {
        
        const currentDate = ""+Date.now();
        const chapterKey = localStorage.getItem("NR-novel-key") + "-" + stringToSixDigitNumber(currentDate);
        
        const chapterKeyList = await chapterStore.keys();
        const chapterPos = chapterKeyList.length + 1;

        const chapterData = {
            title: '(New Chapter)',
            body: '(New Chapter)',
            datetimeTS: currentDate,
            position: chapterPos
        };

        await chapterStore.setItem(chapterKey, chapterData);

        successMsg("New chapter has been successfully added.");
        loadChapters();
        


    } catch (err) {
        console.error("Error saving novel:", err);
        alert('Failed to save novel');
    }
}



/* ------------------- END of Add new chapter --------------------------------------  */



/* ------------------- START of View chapter --------------------------------------  */

function transformText(inputText) {
  let transformedText = inputText;

  transformedText = transformedText.replaceAll('---sep1---', '<p class="sep-1"></p>');

  transformedText = transformedText.replaceAll('---sep2---', '<p class="sep-2">✳✳✳</p>');

  transformedText = transformedText.replaceAll(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  transformedText = transformedText.replaceAll(/\*(.+?)\*/g, '<i>$1</i>');

  return transformedText;
}

function revertTransformation(htmlString) {
  let originalText = htmlString;

  originalText = originalText.replaceAll('<p class="sep-1"></p>', '---sep1---');

  originalText = originalText.replaceAll('<p class="sep-2">✳✳✳</p>', '---sep2---');

  originalText = originalText.replaceAll(/<b>(.+?)<\/b>/g, '**$1**');

  originalText = originalText.replaceAll(/<i>(.+?)<\/i>/g, '*$1*');

  return originalText;
}

async function viewChapter(key) {
    try {

      const saveBtn = document.getElementById('save-chapter-btn');
      const chapter = await chapterStore.getItem(key);

      document.getElementById('ct-sm-view').innerHTML = chapter.title;
      saveBtn.disabled = true;
      saveBtn.classList.add('disabled');

      setTimeout(function() {
        document.getElementById('chapter-text-view').innerHTML = transformText(chapter.body);
      }, loadDelay);

    } catch (error) {
      console.error('Error loading item:', error);
      return null;
    }
}

//SaVE/Edit button
function saveTempChapter(text) {
    //Temporarily save to localStorage
    localStorage.setItem('NR-temp-chapter-body', text);
    
}
/* ------------------- START of View chapter --------------------------------------  */





/* ------------------- START of Edit chapter --------------------------------------  */
async function editChapter() {
    const chapter = await chapterStore.getItem(localStorage.getItem('NR-chapter-key'));
    const saveBtn = document.getElementById('save-chapter-btn');

    document.getElementById('ct-sm-edit').innerHTML = getTitle(chapter.body);

    setTimeout(function() {
      document.getElementById('chapter-text-edit').value = revertTransformation(chapter.body);
      saveBtn.disabled = false;
      saveBtn.classList.remove('disabled');
    }, loadDelay);

}

//put this below
function chapterInput() {
    const chapterEdit = document.getElementById('chapter-text-edit');
    const ctEdit = document.getElementById('ct-sm-edit'); //chapter title
    
    
    ctEdit.innerHTML = getTitle(chapterEdit.value);
    saveTempChapter(chapterEdit.value);

    saveChapter();
    
    


}

    
//Get the first paragraph as the chapter's title
function getTitle(text) {
    const firstLine = text.split('\n')[0];
    return firstLine;
}


  
  // Example usage:
  async function saveChapter() {
    const chapterKey = localStorage.getItem('NR-chapter-key');
    const title = document.getElementById('ct-sm-edit');
    const body = document.getElementById('chapter-text-edit');

    

    const updates = {
      title: title.innerHTML,
      body: body.value,
    };
  
    try{
      const updatedValue = await updateChapter(chapterKey, updates);
      //console.log("Updated value:", updatedValue);
  
      //Verify the update.
      const retrievedValue = await chapterStore.getItem(chapterKey);
      //console.log("Retrieved value after update:", retrievedValue);
      
    
    document.getElementById('ct-sm-view').innerHTML = retrievedValue.title;

    console.log("Saved!");
    
    
    setTimeout(function() {
      document.getElementById('chapter-text-view').innerHTML = transformText(retrievedValue.body);
    }, loadDelay);
  
    } catch (e){
      console.error("An error occured during the example usage", e);
    }
  }

async function updateChapter(key, updates) {
    try {
      // Retrieve the existing item from localForage.
      const existingItem = await chapterStore.getItem(key);
  
      if (existingItem) {
        // Merge the existing item with the provided updates.
        const updatedItem = { ...existingItem, ...updates };
  
        // Store the updated item back into localForage.
        await chapterStore.setItem(key, updatedItem);
        //console.log(`Item with key '${key}' updated successfully.`);
        //return updatedItem; // Return the updated item if needed.
      } else {
        //console.error(`Item with key '${key}' not found.`);
        //return null; // or throw an error, or handle as appropriate.
      }
    } catch (error) {
      console.error(`Error updating item with key '${key}':`, error);
      throw error; // Rethrow the error for the caller to handle.
    }
}



ctEdit.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      // Insert a newline using JavaScript, e.g.,
      const textareaValue = ctEdit.value;
      const selectionStart = ctEdit.selectionStart;
      const selectionEnd = ctEdit.selectionEnd;
      const  newValue = textareaValue.slice(0, selectionStart) + '\n' + textareaValue.slice(selectionEnd);
      ctEdit.value = newValue;
      ctEdit.setSelectionRange(selectionStart + 1, selectionStart + 1);
      saveChapter();
    }
});



let prevValueLength = '';

ctEdit.addEventListener('focus', function() {
  prevValueLength = this.value.length;
  localStorage.setItem('NR-last-focus-position', ctEdit.scrollTop);

  if(prevValueLength <= 13) {    
    this.select();
  }
});

ctEdit.addEventListener('input', function(e) {
  // Check if the change is likely due to Gboard clipboard paste
  if ((this.value.length - prevValueLength) > 400) {
    goSepBtn.style.display = 'block';
    // Add your specific logic for Gboard clipboard paste here
  }
  prevValueLength = this.value.length;
});



function goSepBtnShow(show) {
  if(show === 1) {
    goSepBtn.style.display = 'block';
    hideOnClickOutside('go-sep-btn');
  } else {
    ctEdit.scrollTop = localStorage.getItem('NR-last-focus-position');
    goSepBtn.style.display = 'none';
  }
}


/* ------------------- END of Edit chapter --------------------------------------  */










/* ------------------- START of Glossary --------------------------------------  */
async function viewGlossary(novelKey) {
  
  const editBtn = document.getElementById('gl-edit-btn');
  if(localStorage.getItem('NR-chapter-key') !== null) {
    editBtn.disabled = false;
    editBtn.style.opacity = '1';
  } else {
    editBtn.disabled = true;
    editBtn.style.opacity = '.5';
  }

  const filteredEntries = [];
  await glossaryStore.iterate((value, key) => {
    if (key.startsWith(novelKey+'-')) {
      filteredEntries.push({ key, value });
    }
  });

  filteredEntries.sort((a, b) => {
    const textA = a.value.text.toUpperCase();
    const textB = b.value.text.toUpperCase();
    return textA.localeCompare(textB);
  });

  const table = document.getElementById('gl-table'); // Create a tbody to hold the rows
  let row = '';
  filteredEntries.forEach(({ value, key }) => {
    const typeText = value.type === "1" ? '<span style="color:lightgreen">Person</span>' : '<span style="color:white">Other</span>';
    let genderText = '';
    const chapterId = value.firstAppearance[0];
    const chapterTitle = value.firstAppearance[1];
    let faBtn = '';

    if(value.gender !== '') {
      if(value.gender == "1") {
        genderText = '<span style="color:lightblue">Male</span>';
      } else if(value.gender == "2") {
        genderText = '<span style="color:pink">Female</span>';
      } else {
        genderText = '<span style="color:red">Unknown</span>';
      }
    } else {
      genderText = '<span style="color:white">N/A</span>';
    }

    

    if(chapterId !== '') {
      faBtn = `<button class="btn-edit gl-to-chapter" onclick="updateScrollPos(${value.scrollPosition});changeView('edit-chapter', '${chapterId}')">${chapterTitle}</button>`;
    } else {
      faBtn = '<span style="color:red">Unknown</span>';
    }

    row += `
      <tr>
        <td class="td-gl">
          ${value.text}
          <br>
          <i>${value.original}<i>
          <br>
          <button class="td-gl-btn" onclick="getChapterId(this);changeView('edit-glossary', '${key}')">&#9998;</button>
        </td>
        <td>
          Type: ${typeText}
          <br>
          Gender: ${genderText}
          <br>
          ${value.description}
          <br>
          First appearance: ${faBtn}
        </td>
      </tr>
    `;
  });
  table.innerHTML = row;
  
}

async function saveGlossary() {
  const type = document.getElementById('add-gl-type');
  const gender = document.getElementById('add-gl-gender');
  const tlText = document.getElementById('add-gl-tl-text');
  const origText = document.getElementById('add-gl-orig-text');
  const desc = document.getElementById('add-gl-desc');
  const firstAppearance = document.getElementById('add-gl-fa-select');
  var  firstAppearanceContent = document.querySelector('option[value="'+firstAppearance.value+'"]').textContent;

  if (!type.value.trim()) {
    type.value = 2; //Not a character
  }

  if (!gender.value.trim()) {
    gender.valuer = 0;
  }

  if (!tlText.value.trim()) {
      alert('Please enter the translated text.')
      return;
  }

  if (!origText.value.trim()) {
    alert('Please enter the original text.')
    return;
  }

  if (firstAppearance.value == '') {
    firstAppearanceContent = '';
  }

  /*if (!firstAppearance) {
    firstAppearance = ["", ""];
  } else {
    const partsFA = firstAppearance.split("|");
    firstAppearance = [partsFA[0], partsFA[1]];
  }*/

  
  const currentDate = Date.now().toString();
  const glKey = localStorage.getItem("NR-novel-key") + "-" + stringToSixDigitNumber(currentDate);
  

  try {

      const glData = {
          text: tlText.value.trim(),
          original: origText.value.trim(),
          type: type.value.trim(),
          gender: gender.value.trim(),
          description: desc.value.trim(),
          firstAppearance: [firstAppearance.value.trim(), firstAppearanceContent],
          scrollPosition: localStorage.getItem("NR-last-focus-position")
      };

      await glossaryStore.setItem(glKey, glData);


      //Clear form
      type.value = '';
      gender.value = '';
      tlText.value = '';
      origText.value = '';
      desc.value = '';
      firstAppearance.value = '';

      //Change view to Novel list
      successMsg("Glossary item was added.");
      changeView('glossary-list');


  } catch (err) {
      console.error("Error saving glossary:", err);
      alert('Failed to save glossary');
  }
}

async function populateEditGlossary(glKey) {
  try {
    const glData = await glossaryStore.getItem(glKey);
    const novelKey = localStorage.getItem('NR-novel-key');

    if (glData) {

      //textboxes
      document.getElementById('edit-gl-tl-text').value = glData.text;
      document.getElementById('edit-gl-orig-text').value = glData.original;
      document.getElementById('edit-gl-desc').value = glData.description;

      //selects
      document.getElementById('edit-gl-type').value = glData.type;
      
      const gender = document.getElementById('edit-gl-gender');
      gender.value = glData.gender;
      
      if(glData.type == 1) { //not gender
        gender.disabled = false;
      } else {
        gender.disabled = true;
      }

      //chapters
      await populateChapterSelect(novelKey, 'edit');
    } else {
      console.error("Glossary data not found for key:", glKey);
    }
  } catch (error) {
    console.error("Error populating edit form:", error);
  }
}


function getChapterId(element) {
  // Find the closest table row (<tr>) element to the clicked button.
  const tableRow = element.closest('tr');

  // If a table row is found, search within it for the button with the specified classes.
  if (tableRow) {
    const chapterButton = tableRow.querySelector('.btn-edit.gl-to-chapter');

    // Check if the chapter button exists.
    if (chapterButton) {
      // If the button exists, extract the id from its onclick attribute.
      if (chapterButton.onclick) {
        const onclickValue = chapterButton.getAttribute('onclick');
        const parts = onclickValue.split(', ');
        if (parts.length > 1) {
          localStorage.setItem('NR-chapter-key', parts[1].replace(/['"\)]/g, ''));
        }
      }
    } else {
      localStorage.removeItem('NR-chapter-key');
      const editBtn2 = document.getElementById('gl-edit-btn-2');
      editBtn2.style.opacity = '0.5';
      editBtn2.disabled = true;
      
      
    }
  }
}


async function populateChapterSelect(novelKey, idPrefix) {
  try {
      const keys = await chapterStore.keys();
      const filteredKeys = keys.filter(key => key.startsWith(novelKey+'-'));

      const chapters = await Promise.all(filteredKeys.map(key => chapterStore.getItem(key)));

      const chaptersWithKeys = chapters.map((chapter, index) => ({
          ...chapter,
          key: filteredKeys[index],
      }));

      chaptersWithKeys.sort((a, b) => a.position - b.position);

      const selectDiv = document.getElementById(idPrefix+'-gl-first-appearance');

      var select = `
        <select id="${idPrefix}-gl-fa-select" style="width:100%">
          <option value="">Unknown</option>
      `;

      chaptersWithKeys.forEach(chapter => {
          select += '<option value="'+chapter.key+'">'+chapter.title+'</option>';
      });

      select += '</select>';
      selectDiv.innerHTML = select;

      if(localStorage.getItem('NR-chapter-key')) {
        document.getElementById(idPrefix+'-gl-fa-select').value = localStorage.getItem('NR-chapter-key');
      }
  } catch (error) {
      console.error('Error populating select:', error);
  }
}


async function updateGlossary() {
  const glKey = localStorage.getItem('NR-glossary-key');
  const type = document.getElementById('edit-gl-type');
  const gender = document.getElementById('edit-gl-gender');
  const tlText = document.getElementById('edit-gl-tl-text');
  const origText = document.getElementById('edit-gl-orig-text');
  const desc = document.getElementById('edit-gl-desc');
  const firstAppearance = document.getElementById('edit-gl-fa-select');
  var  firstAppearanceContent = document.querySelector('option[value="'+firstAppearance.value+'"]').textContent;

  if (!type.value.trim()) {
    type.value = 2; //Not a character
  }

  if (!gender.value.trim()) {
    gender.valuer = 0;
  }

  if (!tlText.value.trim()) {
      alert('Please enter the translated text.')
      return;
  }

  if (!origText.value.trim()) {
    alert('Please enter the original text.')
    return;
  }

  if (firstAppearance.value == '') {
    firstAppearanceContent = '';
  }

  const updatedGLData = {
    text: tlText.value.trim(),
    original: origText.value.trim(),
    type: type.value.trim(),
    gender: gender.value.trim(),
    description: desc.value.trim(),
    firstAppearance: [firstAppearance.value.trim(), firstAppearanceContent],
    scrollPosition: localStorage.getItem("NR-last-focus-position")
  };

  try {

      await glossaryStore.setItem(glKey, updatedGLData);

      changeView('glossary-list');
      successMsg("Glossary item updated successfully.");
  } catch (error) {
      console.error("Error updating glossary item: ", error);
  }
}



function updateScrollPos(position) {
  localStorage.setItem('NR-scroll-position', position);
}

function isCharacter(idPrefix) {
  const type = document.getElementById(idPrefix+'-gl-type');
  const gender = document.getElementById(idPrefix+'-gl-gender');
  
  if(type.value == 1) {
    gender.disabled = false;
  } else {
    gender.disabled = true;
    gender.selectedIndex = 0;
  }
}

//Get the selected text from chapter textarea to add to glossary
async function getSelected() {
  let selectedText = ctEdit.value.substring(ctEdit.selectionStart, ctEdit.selectionEnd);
  let selectedText2 = ""; // Initialize selectedText2 to an empty string
 

  // Check for the pattern "Sample (glossary)"
  const match = selectedText.match(/^(.*?)\s*\(([^)]+)\)$/);

  if (match) {
    selectedText = match[1].trim(); // Extract "Sample" and remove leading/trailing spaces
    selectedText2 = match[2].trim(); // Extract "glossary" and remove leading/trailing spaces
  }

  console.log("selectedText:", selectedText);
  console.log("selectedText2:", selectedText2);

  // You can now use selectedText and selectedText2 as needed.
}

/* ------------------- END of Glossary --------------------------------------  */








/*  -------------------------------------- MSC -------------------------------------- */



function successMsg(message) {
  const notif = document.getElementById('success-msg');
  notif.style.display = 'block';
  notif.innerHTML = message;

  hideOnClickOutside('success-msg');

  setTimeout(function() {
      notif.style.display = 'none';
  }, 10000);

}

// String to 6-digits number
function stringToSixDigitNumber(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return null; // Handle invalid input
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xFFFFFFFF; // Simple hash function
  }

  // Ensure positive value and reduce to 6 digits
  let result = Math.abs(hash % 1000000);

  // Ensure it's 6 digits, and doesn't begin with 0.
  if (result < 100000) {
    result += 100000; // Add 100000 to those below 6 digits.
  }

  return result;
}

//For message closing if clicked elsewhere
function hideOnClickOutside(elementId) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  const outsideClickListener = (event) => {
    if (!element.contains(event.target)) {
      element.style.display = 'none'; // Or element.classList.add('hidden');
      removeClickListener();
    }
  };

  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener);
  };

  document.addEventListener('click', outsideClickListener);
}




//Add data input
function addData(data, action = null) {
  var cursorPosition = ctEdit.selectionStart;
  var textToAdd = data;

  var currentValue = ctEdit.value;
  var newValue = currentValue.substring(0, cursorPosition) + textToAdd + currentValue.substring(cursorPosition);

  ctEdit.value = newValue;
  ctEdit.selectionStart = ctEdit.selectionEnd = cursorPosition + textToAdd.length; // Move cursor after inserted text.
  ctEdit.focus(); // Keep focus on textarea
  
  const newTitle = getTitle(newValue);
  document.getElementById('ct-sm-edit').innerHTML = newTitle;

  if(action !== null) {
    document.getElementById('ctt-seps').selectedIndex = 0;
  }
  

  saveChapter();
  

}


//Font size 
function setFontSize(size) {
  var fontSize = size;

  localStorage.setItem('NR-font-size', fontSize);
  ctEdit.style.cssText = "font-size: "+fontSize+"px";
  ctView.style.cssText = "font-size: "+fontSize+"px";

  document.getElementById('ctt-font-size').value = fontSize;
}


//Up & Down arrow buttons
function toup() {
  ctEdit.selectionStart = 0;
  ctEdit.selectionEnd = 0;
  ctEdit.focus(); // Optional: Focus the textarea
}

function todown() {
  const length = ctEdit.value.length;
  ctEdit.selectionStart = length;
  ctEdit.selectionEnd = length;
  ctEdit.focus(); // Optional: Focus the textarea
}




//Scroll positions
ctEdit.addEventListener('scroll', () => {
  const scrollPosition = ctEdit.scrollTop;
  localStorage.setItem('NR-scroll-position', scrollPosition);
  
});

ctView.addEventListener('scroll', () => {
  const scrollPosition = ctView.scrollTop;
  localStorage.setItem('NR-scroll-position', scrollPosition);
});

function scrollToPos() {
  const savedScrollPosition = localStorage.getItem('NR-scroll-position');

  setTimeout(() => {
    ctEdit.scrollTop = savedScrollPosition;
    ctView.scrollTop = savedScrollPosition;
  }, 500);
  
}
