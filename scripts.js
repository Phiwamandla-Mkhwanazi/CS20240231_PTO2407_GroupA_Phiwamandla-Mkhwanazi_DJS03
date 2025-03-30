// Importing books, authors, genres, and the constant for books per page from the external data module
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1; // Keeps track of the current page of book listings
let matches = books // Holds the filtered list of books

/*--------------------------------------Populating Main Container with Books --------------------------------------------------- */

//Creating a DocumentFragment to store book elements before adding them to the DOM
const starting = document.createDocumentFragment()

// Iterating through the first set of books (up to BOOKS_PER_PAGE) and creating UI elements
for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
   
    const element = document.createElement('button') // Create a new button element for each book
    element.classList = 'preview' // Assign a class to the button for styling purposes
    element.setAttribute('data-preview', id) // Set a custom data attribute 'data-preview' that holds the book's ID

    // Set inner HTML structure for summary card 
    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `

    starting.appendChild(element) // Append the created button element to the DocumentFragment
}

// Once all elements have been created, append the fragment to the DOM at the specified location
document.querySelector('[data-list-items]').appendChild(starting)


/*------------------------------------Genre Dropdown Menu------------------------------------------------------- */

// Create a new DocumentFragment for the genres dropdown
const genreHtml = document.createDocumentFragment()

// Create an option for 'All Genres' and append it to the fragment
const firstGenreElement = document.createElement('option')
firstGenreElement.value = 'any'
firstGenreElement.innerText = 'All Genres'
genreHtml.appendChild(firstGenreElement)

// Loop through the genres object and create an option for each genre
for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    genreHtml.appendChild(element)
}
// Append the genres options to the dropdown in the DOM
document.querySelector('[data-search-genres]').appendChild(genreHtml)


/*---------------------------------Author Dropdown Menu---------------------------------------------------------- */

// Create a new DocumentFragment for the authors dropdown
const authorsHtml = document.createDocumentFragment()

// Create an option for 'All Authors' and append it to the fragment
const firstAuthorElement = document.createElement('option')
firstAuthorElement.value = 'any'
firstAuthorElement.innerText = 'All Authors'
authorsHtml.appendChild(firstAuthorElement)

// Loop through the authors object and create an option for each author
for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    authorsHtml.appendChild(element)
}

// Append the authors options to the dropdown in the DOM
document.querySelector('[data-search-authors]').appendChild(authorsHtml)


/*-----------------------------------Theme Selection Based on User Preference-------------------------------------------------------- */

// Checking for dark mode preference and applying theme settings accordingly
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}


/*------------------------------------Handling "Show More" Button------------------------------------------------------- */

// Setting up the "Show More" button with remaining book count
document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`

// Disable the button if there are no more books to show
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

// Update the button's inner HTML with a dynamic count of remaining books to show
document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

/*------------------------------------Event Listeners for UI (Cards) Interactions------------------------------------------------------- */

// Closes the Search Card when the cancel button is clicked
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

// Closes the Settings Card when the cancel button is clicked
document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

// Opens the Search Card and sets focus on the search 'input field'
document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

//Opens the Settings Card when the settings button is clicked
document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

// Closes the Summary Card when the close button is clicked
document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

/*--------------------------------Updating Theme (settings form/Theme Card) Based on User Selection----------------------------------------------- */

// Event listener to save the Theme (settings form)  when submitted
document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    // Apply selected theme settings
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    // Close the Theme Card
    document.querySelector('[data-settings-overlay]').open = false
})

/*----------------------------------Handling Search Form Submission---------------------------------------------- */

// Event listener to handle the Search (search form) submission
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target) // Get the form data from HTML
    const filters = Object.fromEntries(formData)  // Extract filters from form data
    const result = [] // Initialize an empty array to store matching books

    // Filter books based on search criteria (title, author, genre)
    for (const book of books) {
        let genreMatch = filters.genre === 'any' // Default to true if 'any' is selected

        // Check if the book's genres match the selected genre
        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }
        // Check if the book matches the filters and add it to the result array
        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)  // Add matching book to result array
        }
    }
    // Update the main container based on search results
    page = 1;
    matches = result

    // If no results are found, show the 'no results' message
    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    // Clear the current items and add new filtered items to the DOM
    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment() // Create a document fragment for better performance

    // Loop through the filtered results and create book preview buttons
    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button') // Create a button element
        element.classList = 'preview' // Assign CSS class   
        element.setAttribute('data-preview', id) // Set custom attribute for preview ID
    
        // Set inner HTML structure for summary card
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element) //Append button to document fragment
    }

     // Append the new items to the DOM
    document.querySelector('[data-list-items]').appendChild(newItems)
    
    // Disable "Show more" button if there are no more items to show
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1
    
    // Update the "Show more" button text and remaining count
    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `
    // Scroll the page back to the top smoothly
    window.scrollTo({top: 0, behavior: 'smooth'});

    //close the Search Card
    document.querySelector('[data-search-overlay]').open = false
})


/*----------------------------------Handling "Show More" Button------------------------------------------------ */
document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment() // Create document fragment for performance

    // Get next batch of books from the matches array
    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button') // Create a button element
        element.classList = 'preview' // Assign CSS class
        element.setAttribute('data-preview', id) // Set custom attribute for preview ID
    
        // Set inner HTML structure for summary card 
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element) // Append element to document fragment
    }

    // Append new batch of books to the list
    document.querySelector('[data-list-items]').appendChild(fragment)
    // Increment page count
    page += 1
})


/*-------------------------------------Handling Summary Card Click Event---------------------------------------------------- */
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath()) // Get event path for cross-browser compatibility
    let active = null // Initialize variable to store active book details

    // Loop through event path nodes to find the clicked book
    for (const node of pathArray) {
        if (active) break // Stop if book is already found

        // Check if the node contains a preview dataset attribute
        if (node?.dataset?.preview) {
            let result = null  // Initialize variable to store matched book
            
            // Find the book that matches the clicked preview ID
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result // Assign found book to active variable
        }
    }
        
    // If a book is found, update the book preview modal
    if (active) {
        document.querySelector('[data-list-active]').open = true // Open modal
        document.querySelector('[data-list-blur]').src = active.image // Set book image (blurred)
        document.querySelector('[data-list-image]').src = active.image // Set book image
        document.querySelector('[data-list-title]').innerText = active.title  // Set book title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})` // Set book author and published year
        document.querySelector('[data-list-description]').innerText = active.description // Set book description
    }
})