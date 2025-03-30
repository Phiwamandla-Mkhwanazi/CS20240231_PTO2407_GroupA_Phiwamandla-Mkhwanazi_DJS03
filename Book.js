class Book {
    constructor(id, title, author, image, description, genres, published) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.image = image;
        this.description = description;
        this.genres = genres;
        this.published = published;
    }

    // Method to create the preview button for each book
    createPreviewElement(authors) {
        const element = document.createElement('button');
        element.classList = 'preview';
        element.setAttribute('data-preview', this.id);

        element.innerHTML = `
            <img class="preview__image" src="${this.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.author]}</div>
            </div>
        `;

        return element;
    }
}
