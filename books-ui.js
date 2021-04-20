class Api {
  async searchBooks(query, pageNum) {
    let booksPage = await fetch(
      `https://openlibrary.org/search.json?q=${query}&page=${pageNum}`
    );
    return await booksPage.json();
  }
}

class BooksUI {
  /* left panel */
  goBtn = document.getElementById("goButton");
  input = document.getElementById("searchInput");
  booksResults = document.getElementById("searchResultHolder");
  /* center panel */
  addButton = document.getElementById("addButton");
  bookInfoHolder = document.getElementById("bookInfoHolder");
  /* right panel */
  readList = document.getElementById("readListHolder");
  btnDoneCounter = document.querySelector(".done-counter");
  btnBookCounter = document.querySelector(".books-counter");

  api;
  books;
  currBook;
  doneCounter = 0;
  bookCounter = 0;

  constructor(api) {
    this.api = api;
    this.setListeners();
  }

  setListeners() {
    this.goBtn.addEventListener("click", () => {
      this.api.searchBooks(this.input.value, 1).then(booksPage => {
        this.processBooksPage(booksPage);
      });
    });

    this.booksResults.addEventListener("click", event => {
      const bookId = event.target.id;
      this.currBook = this.books.find(b => b.id === bookId);
      if (!this.currBook) {
        // click on something else
        return false;
      }
      this.displayBookInfo(this.currBook);
    });

    this.setAddButtonListener();
    this.setMarkRemoveButtonListener();
  }

  setAddButtonListener() {
    this.addButton = document.getElementById("addButton");
    this.addButton.addEventListener("click", () => {
      if (this.currBook != null) {
        console.log(this.currBook);
        event.preventDefault();
        let div = document.createElement("div");
        div.classList.add("read-list__item");
        div.innerHTML = `<p class="read-list__title">${this.currBook.title}</p>
        <p class="read-list__author">${this.currBook.author_name.join(", ")}</p>
        <button class="mark-btn">Mark as read</button><button class="remove-btn">Remove from list</button>`;
        this.readList.appendChild(div);
        this.bookCounter++;
        this.btnBookCounter.innerText = this.bookCounter;
      }
    });
  }

  setMarkRemoveButtonListener() {
    this.readList.addEventListener("click", event => {
      const item = event.target;
      const listItem = item.parentElement;
      console.log(`className: ${item.className}`);
      if (item.className === "remove-btn") {
        listItem.remove();
        this.bookCounter--;
        this.btnBookCounter.innerText = this.bookCounter;
      } else if (item.className === "mark-btn") {
        listItem.classList.toggle("marked-item");
        this.doneCounter++;
        this.btnDoneCounter.innerText = this.doneCounter;
        let removeButton = listItem.querySelector(".remove-btn");
        removeButton.remove();
        item.remove();
      }
    });
  }

  processBooksPage(booksPage) {
    this.books = booksPage.docs;
    this.books.forEach(item => {
      item.id = item.key.split("/").pop();
    });
    let elementsStr = this.books.reduce((acc, curr) => {
      return (
        acc + `<div id="${curr.id}" class="book-short">${curr.title}</div>`
      );
    }, "");
    this.booksResults.innerHTML = elementsStr;
  }

  displayBookInfo(bookInfo) {
    if (bookInfo.publisher != null && bookInfo.isbn != null) {
      if (bookInfo.publisher.length > 4 && bookInfo.isbn.length > 4) {
        bookInfoHolder.innerHTML = this.getBookingInfoHtml(bookInfo, 1);
      } else if (bookInfo.publisher.length > 4) {
        bookInfoHolder.innerHTML = this.getBookingInfoHtml(bookInfo, 2);
      } else if (bookInfo.isbn.length > 4) {
        bookInfoHolder.innerHTML = this.getBookingInfoHtml(bookInfo, 3);
      } else {
        bookInfoHolder.innerHTML = this.getBookingInfoHtml(bookInfo, 4);
      }
    } else {
      bookInfoHolder.innerHTML = this.getBookingInfoHtml(bookInfo, -1);
    }
    this.setAddButtonListener();
    this.setCollapsing();
  }

  getBookingInfoHtml(bookInfo, type) {
    let subtitle = "";
    if (bookInfo.subtitle != null) {
      subtitle = bookInfo.subtitle;
    }
    let result = `
        <h2>${bookInfo.title}</h2>
        <h4>${subtitle}</h4>
        <h4>By ${bookInfo.author_name.join(", ")}</h4>
        <p>Full text available: <b>${bookInfo.has_fulltext}</b></p>
        <p>Type: <b>${bookInfo.type}</b></p>`;
    switch (type) {
      case 1:
        result += `<p class="collapsible">Publisher: <b>Click to show</b></p>
          <div class="content"><p>${bookInfo.publisher.join(", ")}</p></div>
          <p class="collapsible">ISBN: <b>Click to show</b></p>
          <div class="content"><p>${bookInfo.isbn.join(", ")}</p></div>`;
        break;
      case 2:
        result += `<p class="collapsible">Publisher: <b>Click to show</b></p>
        <div class="content"> <p>${bookInfo.publisher.join(", ")}</p></div>
        <p>ISBN: <b>${bookInfo.isbn.join(", ")}</b></p>`;
        break;
      case 3:
        result += `<p>Publisher: <b>${bookInfo.publisher.join(", ")}</b></p>
        <p class="collapsible">ISBN: <b>Click to show</b></p>
        <div class="content"><p>${bookInfo.isbn.join(", ")}</p></div>`;
        break;
      case 4:
        result += `<p>Publisher: <b>${bookInfo.publisher.join(", ")}</b></p>
        <p>ISBN: <b>${bookInfo.isbn.join(", ")}</b></p>`;
        break;
    }
    result += `<button id="addButton">Add book to Read List</button>`;
    return result;
  }

  setCollapsing() {
    let collapse = document.getElementsByClassName("collapsible");
    for (let i = 0; i < collapse.length; i++) {
      collapse[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }
}


const bookListComponent = new BooksUI(new Api());