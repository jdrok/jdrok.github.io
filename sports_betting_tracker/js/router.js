// create document click that watches the nav links only
document.addEventListener("click", (e) => {
    const { target } = e; // Destructuring target from event object

    // Only prevent default and route if the target is a specific anchor tag
    if (target.matches('a:not(.external):not(.settings-btn)')) {
        e.preventDefault(); // <-- MOVE THIS LINE HERE
        route(e); // Pass the event object to the route function
    }
    // Remove e.preventDefault() from here
});

const basePath = "/sports_betting_tracker"; // Your GitHub Pages base path
const path = 'sports_betting_tracker/'; // This variable seems unused, can be removed if not needed elsewhere

//Create the Routes
const routes = {
    404: {
        template: "templates/404.html",
        title: "404 Error",
        description: "Page not found",
        class: "page-404"
    },
    "/": {
        template: "templates/index.html",
        title: "Bet History",
        class: "bet-history"
    },
    "/new-entry": {
        template: "templates/new-entry.html",
        title: "New Entry",
        class: "new-entry"
    },
    "/calculator": {
        template: "templates/calculator.html",
        title: "Calculator",
        class: "calculator"
    },
    "/database": {
        template: "templates/database.html",
        title: "Database",
        class: "database"
    }
};

//Create a function that watches the URL and calls the urlLocationHandler
const route = (event) => {
    event = event || window.event; // get window.event if event argument not provided
    event.preventDefault();

    // Determine the path to push to history based on the clicked link
    const targetHref = event.target.href;
    const url = new URL(targetHref); // Create a URL object to easily get pathname

    let pathForPushState = url.pathname;
    
    // Ensure the path includes the basePath for pushState
    // If the link is '/sports_betting_tracker/' it's fine
    // If it's '/sports_betting_tracker/calculator', it's fine
    // If a link was just '/calculator', prepend basePath
    if (!pathForPushState.startsWith(basePath)) {
        pathForPushState = basePath + pathForPushState;
    }
    
    // Use pushState to maintain clean URLs for internal navigation
    window.history.pushState({}, "", pathForPushState);
    locationHandler();
};

//Create a function that handles the URL location
const locationHandler = async () => {
    let locationPath = window.location.pathname; // Get the URL path (e.g., /sports_betting_tracker/calculator)
    let locationHash = window.location.hash;     // Get the URL hash (e.g., #/calculator)
    let currentRoutePath = '';                   // This will be the path used for routing
    let matchedRoute = null;
    let params = {};

    // --- Core Logic for Handling Paths ---
    if (locationHash) {
        // If there's a hash, prioritize it (this comes from 404.html redirect)
        currentRoutePath = locationHash.substring(1); // Remove the leading '#'
        // Ensure that '#/' is treated as just '/' for routing
        if (currentRoutePath === '/') {
            currentRoutePath = '/';
        }
    } else {
        // No hash, so we're either on the root or navigated internally via pushState
        if (locationPath.startsWith(basePath) && locationPath !== basePath) {
            currentRoutePath = locationPath.substring(basePath.length);
            // If it becomes empty after removing base path (e.g., /sports_betting_tracker becomes '')
            if (currentRoutePath === "") {
                currentRoutePath = "/"; // Treat as root
            }
        } else if (locationPath === basePath || locationPath === basePath + '/') {
            // Handle the exact base path or base path with trailing slash
            currentRoutePath = "/"; 
        } else {
            // Fallback for paths not matching basePath, might indicate issues
            currentRoutePath = "/"; 
        }

        // If after all adjustments, the path is empty, make it root
        if (currentRoutePath.length === 0) {
            currentRoutePath = "/";
        }
    }
    // --- End Core Logic for Handling Paths ---

    // Check for dynamic routes first (if you had any like /details-123)
    for (const path in routes) {
        if (path.endsWith("-") && currentRoutePath.startsWith(path)) {
            matchedRoute = routes[path];
            const id = currentRoutePath.substring(path.length);
            params.id = id; // Extract the ID as a parameter
            break; // Stop searching once a match is found
        } else if (currentRoutePath === path) {
            matchedRoute = routes[path];
            break;
        }
    }

    // If no specific route is found, default to 404
    const route = matchedRoute || routes["404"];
    const html = await fetch(route.template).then((response) => response.text());
    const contentHtml = document.getElementById("content");
    contentHtml.innerHTML = html;
    
    contentHtml.scrollTo(0, 0);
    
    document.title = route.title;
    const content = document.getElementById('content');
    content.className = '';
    content.classList.add('main-content');
    content.classList.add(route.class);

    // Common styling for tab buttons (before specific page loads)
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(tabBtn => {
        tabBtn.style.backgroundColor = 'transparent';
        tabBtn.style.border = '1px solid #aaa';
    });

    // Update bankroll, assuming updateCurrentBankroll is defined elsewhere
    await updateCurrentBankroll(); 
    
    // Page-specific initializations
    if(route.class === 'bet-history') {
        localStorage.getItem('SBT-bets-view') || localStorage.setItem('SBT-bets-view', 'all');
        loadBets(); // Assuming loadBets is defined elsewhere
        tabBtns[0].style.backgroundColor = '#1274d1';
        tabBtns[0].style.border = '1px solid #1274d1';
        
    } else if(route.class === 'new-entry') {
        loadNewEntry(); // Assuming loadNewEntry is defined elsewhere
        const searchBoxes = document.querySelectorAll('.textbox-div input');
        searchBoxes.forEach(sb => {
            sb.addEventListener('focus', (event) => {
                event.target.select();
            });
        });
        tabBtns[1].style.backgroundColor = '#1274d1';
        tabBtns[1].style.border = '1px solid #1274d1';

    } else if(route.class === 'calculator') {
        tabBtns[2].style.backgroundColor = '#1274d1';
        tabBtns[2].style.border = '1px solid #1274d1';
        await loadDefaults(); // Assuming loadDefaults is defined elsewhere
        calculateLastInput(); // Assuming calculateLastInput is defined elsewhere
    }
    // No specific else for 'database' in the original logic, assuming it's handled by generic content loading.
};

// Create a function that allows programmatic navigation
const navigateTo = (pathName) => {
    // Construct the full path with the basePath
    let fullPath;
    if (pathName === '/') {
        fullPath = basePath + '/';
    } else {
        fullPath = basePath + pathName;
    }

    // Use pushState to change the URL without a full page reload
    window.history.pushState({}, "", fullPath);
    
    // Call the locationHandler to load the new content
    locationHandler();
};

// add an event listener to the window that watches for url changes (back/forward buttons)
window.onpopstate = locationHandler;
window.route = route; // Make 'route' globally accessible if needed (was in original)
locationHandler(); // Initial call to handle the current URL on page load
