// Importing books, authors, genres, and the constant for books per page from the external data module
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

/*-------------------------------------Encapsulating UI Elements----------------------------------------------------------*/
const elements = 
{
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

// Destructuring the elements object to simplify access
const 
{
    headerSearchIcon,
    headerSettingsIcon,
    searchOverlay,
    searchForm,
    settingsTheme,
    searchCancelButton,
    searchGenresSelect,
    searchAuthorsSelect,
    settingsOverlay,
    settingsForm,
    settingsCancelButton,
    bookListItems,
    bookListBlur,
    bookListImage,
    bookListTitle,
    bookListSubtitle,
    bookListDescription,
    listCloseButton,
    listActive,
    showListButton,
    showListMessage
} = elements;

/*--------------------------------------------------Book Object-------------------------------------------- */
const book = {
    // Helper function to create a book preview element
    createBookElement({ author, id, image, title }, authors) {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', id);
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        return element;
    },

    //Render Books to Main
    render(books, authors, booksPerPage) {
        const fragment = document.createDocumentFragment();
        books.slice(0, booksPerPage).forEach(book => {
            fragment.appendChild(this.createBookElement(book, authors));
        });
        return fragment;
    },

    //Dropdown Menu Creation (Reusable for both genre and author)
    createDropdown(options, firstOptionText) {
        const dropdownHtml = document.createDocumentFragment();
        const firstElement = document.createElement('option');
        firstElement.value = 'any';
        firstElement.innerText = firstOptionText;
        dropdownHtml.appendChild(firstElement);

        Object.entries(options).forEach(([id, name]) => {
            const element = document.createElement('option');
            element.value = id;
            element.innerText = name;
            dropdownHtml.appendChild(element);
        });

        return dropdownHtml;
    },

    //Genre Dropdown Menu
    genreDropdown(genres) {
        return this.createDropdown(genres, 'All Genres');
    },

    //Author Dropdown Menu
    authorDropdown(authors) {
        return this.createDropdown(authors, 'All Authors');
    },

    //Search Books
    search(event, books, authors, bookListItems, showListMessage, showListButton) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = books.filter(singleBook => {
            const genreMatch = filters.genre === 'any' || singleBook.genres.includes(filters.genre);
            const titleMatch = !filters.title.trim() || singleBook.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch = filters.author === 'any' || singleBook.author === filters.author;
            return genreMatch && titleMatch && authorMatch;
        });

        // Update the page with filtered results
        page = 1;
        matches = result;

        // Show or hide no results message
        showListMessage.classList.toggle('list__message_show', result.length < 1);

        // Clear current items and add new filtered items to the DOM
        bookListItems.innerHTML = '';
        const newItems = document.createDocumentFragment();
        result.slice(0, BOOKS_PER_PAGE).forEach(book => newItems.appendChild(this.createBookElement(book, authors)));

        bookListItems.appendChild(newItems);
        this.updateShowMoreButton(showListButton, matches, page, BOOKS_PER_PAGE);

        // Scroll the page back to the top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close the Search Card
        searchOverlay.open = false;
    },

    //Manage Show More Button
    updateShowMoreButton(showListButton, matches, page, booksPerPage) {
        const remainingBooks = matches.length - (page * booksPerPage);
        showListButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
        `;
        showListButton.disabled = remainingBooks <= 0;
    },

    //Book Summary
    summaryCard(event) {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        // Find clicked book by matching dataset preview ID
        for (const node of pathArray) {
            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node.dataset.preview);
                if (active) break;
            }
        }

        // If a book is found, update the modal with book details
        if (active) {
            listActive.open = true;
            bookListBlur.src = active.image;
            bookListImage.src = active.image;
            bookListTitle.innerText = active.title;
            bookListSubtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            bookListDescription.innerText = active.description;
        }
    },

    //Show More Books
    ShowMore(showListButton, bookListItems, matches, page, booksPerPage, authors) {
        const fragment = document.createDocumentFragment();
        matches.slice(page * booksPerPage, (page + 1) * booksPerPage).forEach(book => {
            fragment.appendChild(this.createBookElement(book, authors));
        });

        bookListItems.appendChild(fragment);
        page += 1;
        this.updateShowMoreButton(showListButton, matches, page, booksPerPage);
    }
};


/*-----------------------------------------------Theme Object------------------------------------------------------------ */
const ThemeManager = {
    init() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            settingsTheme.value = 'night';
            this.applyTheme('night');
        } else {
            settingsTheme.value = 'day';
            this.applyTheme('day');
        }
    },

    applyTheme(theme) {
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
    },

    handleThemeChange(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        this.applyTheme(theme);
        settingsOverlay.open = false;
    }
};

/*-----------------------------------------------Event Listeners for UI (Cards) Interactions--------------------------------------------------------- */

searchCancelButton.addEventListener('click', () => { searchOverlay.open = false })
settingsCancelButton.addEventListener('click', () => { settingsOverlay.open = false })

headerSearchIcon.addEventListener('click', () => { searchOverlay.open = true; searchTitleInput.focus()})
headerSettingsIcon.addEventListener('click', () => { settingsOverlay.open = true })

searchForm.addEventListener('submit', (event) => { book.search(event, books, authors, bookListItems, showListMessage, showListButton);});

bookListItems.addEventListener('click', (event) => book.summaryCard(event));

showListButton.addEventListener('click', () => { book.ShowMore(showListButton, bookListItems, matches, page, BOOKS_PER_PAGE, authors); });
listCloseButton.addEventListener('click', () => { listActive.open = false })


/*----------------------------------------------------Main Program Execution--------------------------------------------------------- */

let page = 1; // Keeps track of the current page of book listings
let matches = books // Holds the filtered list of books

ThemeManager.init();
settingsForm.addEventListener('submit', (event) => ThemeManager.handleThemeChange(event));

const bookFragment = book.render(matches, authors, BOOKS_PER_PAGE);
const createGenreDropdown = book.genreDropdown(genres);
const createAuthorDropdown = book.authorDropdown(authors);

bookListItems.appendChild(bookFragment);
searchGenresSelect.appendChild(createGenreDropdown)
searchAuthorsSelect.appendChild(createAuthorDropdown);

book.updateShowMoreButton(showListButton, matches, page, BOOKS_PER_PAGE);