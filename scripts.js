// Importing books, authors, genres, and the constant for books per page from the external data module
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'


class BookConnect
{
    constructor(books, authors, genres, booksPerPage)
    {
        this.books = books;
        this.authors = authors;
        this.genres = genres;
        this.BOOKS_PER_PAGE = booksPerPage;

        this.page = 1; // Keeps track of the current page of book listings
        this.matches = books // Holds the filtered list of books
        this.elements = this._initializeUIElements();
    }

    _initializeUIElements() {
        return {
        //Header elements
        headerSearchIcon: document.querySelector('[data-header-search]'),
        headerSettingsIcon: document.querySelector('[data-header-settings]'),

        // Search Card elements
        searchOverlay: document.querySelector('[data-search-overlay]'),
        searchForm: document.querySelector('[data-search-form]'),
        searchCancelButton: document.querySelector('[data-search-cancel]'),
        searchTitleInput: document.querySelector('[data-search-title]'),
        searchGenresSelect: document.querySelector('[data-search-genres]'),
        searchAuthorsSelect: document.querySelector('[data-search-authors]'),

        // Theme Card elements
        settingsOverlay: document.querySelector('[data-settings-overlay]'),
        settingsForm: document.querySelector('[data-settings-form]'),
        settingsTheme:  document.querySelector('[data-settings-theme]'),
        settingsCancelButton: document.querySelector('[data-settings-cancel]'),

        //Summary Card elements
        bookListItems: document.querySelector('[data-list-items]'),
        bookListBlur: document.querySelector('[data-list-blur]'),
        bookListImage: document.querySelector('[data-list-image]'),
        bookListTitle: document.querySelector('[data-list-title]'),
        bookListSubtitle: document.querySelector('[data-list-subtitle]'),
        bookListDescription:document.querySelector('[data-list-description]'),
        listCloseButton: document.querySelector('[data-list-close]'),
        listActive: document.querySelector('[data-list-active]'),

        //Show More elements
        showListButton: document.querySelector('[data-list-button]'),
        showListMessage: document.querySelector('[data-list-message]'),
        }
    }

    // Render the books in the UI
    renderBooks() {
    const starting = document.createDocumentFragment();
    const booksToRender = this.matches.slice(0, this.BOOKS_PER_PAGE);

    booksToRender.forEach(book => {
        const bookObj = new Book(book.id, book.title, book.author, book.image, book.description, book.genres, book.published);
        starting.appendChild(bookObj.createPreviewElement(this.authors));
    });

    this.elements.bookListItems.appendChild(starting);
    this.updateShowMoreButton();    
    }

    // Update the "Show More" button
    updateShowMoreButton() {
        const remainingBooks = this.matches.length - (this.page * this.BOOKS_PER_PAGE);
        this.elements.showListButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
        this.elements.showListButton.disabled = remainingBooks <= 0;
    }

    // Handle "Show More" button click
    handleShowMore() {
        this.page += 1;
        this.renderBooks();
    }

    // Handle search form submission
    handleSearch() {
        const formData = new FormData(this.elements.searchForm);
        const filters = Object.fromEntries(formData);
        const result = this.books.filter(book => {
            let genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            let titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            let authorMatch = filters.author === 'any' || book.author === filters.author;

            return genreMatch && titleMatch && authorMatch;
        });

        this.matches = result;
        this.page = 1;
        this.renderBooks();
        this.updateShowMoreButton();
    }
}



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
searchGenresSelect.appendChild(genreHtml)


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
searchAuthorsSelect.appendChild(authorsHtml)



/*------------------------------------Event Listeners for UI (Cards) Interactions------------------------------------------------------- */

// Closes the Search Card when the cancel button is clicked
searchCancelButton.addEventListener('click', () => {
    searchOverlay.open = false
})

// Closes the Settings Card when the cancel button is clicked
settingsCancelButton.addEventListener('click', () => {
    settingsOverlay.open = false
})

// Opens the Search Card and sets focus on the search 'input field'
headerSearchIcon.addEventListener('click', () => {
    searchOverlay.open = true 
    searchTitleInput.focus()
})

//Opens the Settings Card when the settings button is clicked
headerSettingsIcon.addEventListener('click', () => {
    settingsOverlay.open = true 
})

// Closes the Summary Card when the close button is clicked
listCloseButton.addEventListener('click', () => {
    listActive.open = false
})


/*-------------------------------------Handling Summary Card Click Event---------------------------------------------------- */
bookListItems.addEventListener('click', (event) => {
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
        listActive.open = true // Open modal
        bookListBlur.src = active.image // Set book image (blurred)
        bookListImage.src = active.image // Set book image
        bookListTitle.innerText = active.title  // Set book title
        bookListSubtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})` // Set book author and published year
        bookListDescription.innerText = active.description // Set book description
    }
})