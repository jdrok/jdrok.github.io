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

    
    const basePath = "/";
    const path = '/';

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
        window.history.pushState({}, "", event.target.pathname);
        locationHandler();
    };



    //Create a function that handles the URL location
    const locationHandler = async () => {
        let location = window.location.pathname; // get the url path
        let matchedRoute = null;
        let params = {};



        // Adjust the location if the script is running in a subdirectory
        if (location.startsWith(basePath) && location !== basePath) {
            location = location.substring(basePath.length);
            if (location === "") {
                location = "/"; // Ensure root is correctly identified
            }
        } else if (location === basePath) {
            location = "/"; // Handle the exact base path
        }

        if (location.length === 0) {
            location = "/";
        }

        // Check for dynamic routes first
        for (const path in routes) {
            if (path.endsWith("-") && location.startsWith(path)) {
                matchedRoute = routes[path];
                const id = location.substring(path.length);
                params.id = id; // Extract the ID as a parameter
                break; // Stop searching once a match is found
            } else if (location === path) {
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

        

        const tabBtns = document.querySelectorAll('.tab-btn');

        tabBtns.forEach(tabBtn => {
            tabBtn.style.backgroundColor = 'transparent';
            tabBtn.style.border = '1px solid #aaa';
        });

        // total profit
        await updateCurrentBankroll();
        
        
        if(route.class === 'bet-history') {
            localStorage.getItem('SBT-bets-view') || localStorage.setItem('SBT-bets-view', 'all');
            loadBets();


            tabBtns[0].style.backgroundColor = '#1274d1';
            tabBtns[0].style.border = '1px solid #1274d1';
            
        } else

        if(route.class === 'new-entry') {
            
            loadNewEntry();
            

            const searchBoxes = document.querySelectorAll('.textbox-div input');
            searchBoxes.forEach(sb => {
                sb.addEventListener('focus', (event) => {
                    event.target.select();
                });
            });

            tabBtns[1].style.backgroundColor = '#1274d1';
            tabBtns[1].style.border = '1px solid #1274d1';

        } else

        if(route.class === 'calculator') {
            tabBtns[2].style.backgroundColor = '#1274d1';
            tabBtns[2].style.border = '1px solid #1274d1';
            await loadDefaults();
            calculateLastInput();
        }

        else { //database

        }


        
    };


    // Create a function that allows programmatic navigation
    const navigateTo = (pathName) => {
        // Construct the full path with the basePath if necessary
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



    // add an event listener to the window that watches for url changes
    window.onpopstate = locationHandler;
    window.route = route;
    locationHandler();


