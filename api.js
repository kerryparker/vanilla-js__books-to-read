export class Api {
    async searchBooks(query, pageNum) {
      let booksPage = await fetch(
        `https://openlibrary.org/search.json?q=${query}&page=${pageNum}`
      );
      return await booksPage.json();
    }
  }