export class BooksUI {
  /* left panel */
  goBtn = document.getElementById("goButton");
  input = document.getElementById("searchInput");
  booksResults = document.getElementById("searchResultHolder");
  prevBtn = document.querySelector(".nav-prev-btn");
  nextBtn = document.querySelector(".nav-next-btn");
  loader = document.querySelector(".lds-default");
  /* center panel */
  bookInfoHolder = document.getElementById("bookInfoHolder");
  /* right panel */
  readList = document.getElementById("readListHolder");
  btnDoneCounter = document.querySelector(".done-counter");
  btnBookCounter = document.querySelector(".books-counter");

  api;
  collapseHelper;
  booksResponse;
  currBook;
  selectedBookDiv;
  doneCounter = 0;
  bookCounter = 0;
  page = 1;

  constructor(api, collapseHelper) {
    this.api = api;
    this.loader.style.display = "none";
    this.collapseHelper = collapseHelper;
    this.setListeners();
    this.addLocalBooks();
  }

  setListeners() {
    this.goBtn.addEventListener("click", () => {
      this.loader.style.display = "flex";
      this.booksResults.style.display = "none";
      this.searchBooks();
    });

    this.input.addEventListener("keyup", (e) => {
      if (e.code === "Enter") {
      this.loader.style.display = "flex";
      this.booksResults.style.display = "none";
      this.searchBooks();
      }
    })

    this.prevBtn.addEventListener("click", () => {
      if (this.page > 1) {
        this.loader.style.display = "flex";
        this.booksResults.style.display = "none";
        this.page--;
        this.searchBooks();
      }
    });

    this.nextBtn.addEventListener("click", () => {
      if (
        this.booksResponse &&
        this.booksResponse.start + 100 <= this.booksResponse.numFound
      ) {
        this.loader.style.display = "flex";
        this.booksResults.style.display = "none";
        this.page++;
        this.searchBooks();
      }
    });

    this.booksResults.addEventListener("click", event => {
      const bookId = event.target.id;
      this.currBook = this.booksResponse.docs.find(b => b.id === bookId);
      if (!this.currBook) {
        // click on something else
        return false;
      }

      const currentDiv = this.booksResults.querySelector(
        "#" + this.currBook.id
      );
      currentDiv.classList.add("select-book");

      if (this.selectedBookDiv != null && this.selectedBookDiv != currentDiv) {
        this.selectedBookDiv.classList.remove("select-book");
      }
      this.selectedBookDiv = currentDiv;

      this.displayBookInfo(this.currBook);
    });

    this.setMarkRemoveButtonListener();
  }

  searchBooks() {
    this.api.searchBooks(this.input.value, this.page).then(booksPage => {
      this.processBooksPage(booksPage);
      this.updateBottomNavBar(booksPage);
    });
  }

  setAddButtonListener() {
    this.addButton = document.getElementById("addButton");
    this.addButton.addEventListener("click", event => {
      if (this.currBook != null && !this.isBookAdded()) {
        console.log(this.currBook);
        event.preventDefault();
        let div = document.createElement("div");
        div.classList.add("read-list__item");
        let subtitle = this.currBook.subtitle ? this.currBook.subtitle : "";
        let authors =
          this.currBook && this.currBook.author_name
            ? this.currBook.author_name.join(", ")
            : "N/A";
        div.innerHTML = `<div>
          <p class="read-list__title">${this.currBook.title}</p>
          <p>${subtitle}</p>
          <p class="read-list__author">${authors}</p></div>
          <div class="read-list-btns"><button class="mark-btn"><i class="fas fa-check"></i></button><button class="remove-btn"><i class="fas fa-minus-square"></i></button></div>`;

        this.readList.appendChild(div);
        this.saveLocalBooks(div.innerHTML);
        this.bookCounter++;
        this.btnBookCounter.innerText = this.bookCounter;
      }
    });
  }

  setMarkRemoveButtonListener() {
    this.readList.addEventListener("click", event => {
      const item = event.target;
      const listItem = item.parentElement.parentElement;
      console.log(`className: ${item.className}`);
      if (item.className === "remove-btn") {
        this.removeLocalBooks(listItem.innerHTML);
        listItem.remove();
        this.bookCounter--;
        this.btnBookCounter.innerText = this.bookCounter;
      } else if (item.className === "mark-btn") {
        this.removeLocalBooks(listItem.innerHTML);
        listItem.classList.toggle("marked-item");

        this.doneCounter++;
        this.btnDoneCounter.innerText = this.doneCounter;

        let removeButton = listItem.querySelector(".remove-btn");
        removeButton.remove();
        item.remove();
        this.markLocalBooks(listItem.innerHTML);
      }
    });
  }

  processBooksPage(booksPage) {
    this.booksResponse = booksPage;
    this.loader.style.display = "none";
    this.booksResults.style.display = "initial";
    this.booksResponse.docs.forEach(item => {
      item.id = item.key.split("/").pop();
    });
    let elementsStr = this.booksResponse.docs.reduce((acc, curr) => {
      return (
        acc + `<div id="${curr.id}" class="book-short">${curr.title}</div>`
      );
    }, "");
    this.booksResults.innerHTML = elementsStr;
  }

  updateBottomNavBar(booksPage) {
    const pageInfo = document.querySelector(".page-info");
    pageInfo.innerHTML = `<span>Found: ${booksPage.numFound} </span>
      <span>Start: ${booksPage.start} </span>
      <span>Page size: 100</span>`;
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
    this.collapseHelper.setCollapsing("collapsible");
  }

  getBookingInfoHtml(bookInfo, type) {
    let subtitle = "";
    if (bookInfo.subtitle != null) {
      subtitle = bookInfo.subtitle;
    }
    let authors =
      bookInfo && bookInfo.author_name
        ? bookInfo.author_name.join(", ")
        : "N/A";
    let result = `
        <h2>${bookInfo.title}</h2>
        <h4>${subtitle}</h4>
        <h4>By ${authors}</h4>
        <p>Full text available: ${bookInfo.has_fulltext}</p>
        <p>Type: ${bookInfo.type}</p>`;
    switch (type) {
      case 1:
        result += `<p class="collapsible">Publisher: <span>Click to show</span></p>
          <div class="content"><p>${bookInfo.publisher.join(", ")}</p></div>
          <p class="collapsible">ISBN: <span>Click to show</span></p>
          <div class="content"><p>${bookInfo.isbn.join(", ")}</p></div>`;
        break;
      case 2:
        result += `<p class="collapsible">Publisher: <span>Click to show</span></p>
        <div class="content"> <p>${bookInfo.publisher.join(", ")}</p></div>
        <p>ISBN: <b>${bookInfo.isbn.join(", ")}</b></p>`;
        break;
      case 3:
        result += `<p>Publisher: ${bookInfo.publisher.join(", ")}</p>
        <p class="collapsible">ISBN: <span>Click to show</span></p>
        <div class="content"><p>${bookInfo.isbn.join(", ")}</p></div>`;
        break;
      case 4:
        result += `<p>Publisher: ${bookInfo.publisher.join(", ")}</p>
        <p>ISBN: ${bookInfo.isbn.join(", ")}</p>`;
        break;
    }
    result += `<button id="addButton">Add book to Read List</button>`;
    return result;
  }

  isBookAdded() {
    let authors =
      this.currBook && this.currBook.author_name
        ? this.currBook.author_name.join(", ")
        : "N/A";
    let storedBooks = this.getLocalBooks();
    let result = false;
    storedBooks.forEach(book => {
      if (book.includes(`${this.currBook.title}`) && book.includes(authors)) {
        result = true;
      }
    });
    return result;
  }

  getLocalBooks() {
    let items;
    if (localStorage.getItem("items") === null) {
      items = [];
    } else {
      items = JSON.parse(localStorage.getItem("items"));
    }
    return items;
  }

  saveLocalBooks(item) {
    let items = this.getLocalBooks();
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    //localStorage.clear();
  }

  addLocalBooks() {
    let items = this.getLocalBooks();
    items.forEach(item => {
      let div = document.createElement("div");
      div.classList.add("read-list__item");
      if (!item.includes("</button>")) {
        div.classList.add("marked-item");
        this.doneCounter += 1;
        this.btnDoneCounter.innerText = this.doneCounter;
      }
      div.innerHTML = item;
      this.readList.appendChild(div);
    });
    this.bookCounter = items.length;
    this.btnBookCounter.innerText = this.bookCounter;
  }

  removeLocalBooks(item) {
    let items = this.getLocalBooks();
    items.splice(items.indexOf(item), 1);
    localStorage.setItem("items", JSON.stringify(items));
  }

  markLocalBooks(item) {
    let items;
    if (localStorage.getItem("items") === null) {
      items = [];
      console.log("items === null");
    } else {
      items = JSON.parse(localStorage.getItem("items"));
      console.log(`items size: ${items.length}`);
    }
    let idx = items.indexOf(item);
    if (idx != -1) {
      items.splice(idx, 1, item);
    } else {
      items.push(item);
    }

    localStorage.setItem("items", JSON.stringify(items));
  }
}
