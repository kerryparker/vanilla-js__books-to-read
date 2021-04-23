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
  prevBtn = document.querySelector(".nav-prev-btn");
  nextBtn = document.querySelector(".nav-next-btn");
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
    this.collapseHelper = collapseHelper;
    this.setListeners();
    this.getLocalBooks();
  }

  setListeners() {
    this.goBtn.addEventListener("click", () => {
      this.searchBooks();
    });

    this.prevBtn.addEventListener("click", () => {
      if (this.page > 1) {
        this.page--;
        this.searchBooks();
      }
    });

    this.nextBtn.addEventListener("click", () => {
      if (
        this.booksResponse &&
        this.booksResponse.start + 100 <= this.booksResponse.numFound
      ) {
        this.page++;
        this.searchBooks();
      }
    });

    this.booksResults.addEventListener("click", (event) => {
      const bookId = event.target.id;
      this.currBook = this.booksResponse.docs.find((b) => b.id === bookId);
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
    this.api.searchBooks(this.input.value, this.page).then((booksPage) => {
      this.processBooksPage(booksPage);
      this.updateBottomNavBar(booksPage);
    });
  }

   setAddButtonListener() {
    this.addButton = document.getElementById("addButton");
    this.addButton.addEventListener("click", event => {
      if (this.currBook != null) {
        console.log(this.currBook);
        event.preventDefault();
        let div = document.createElement("div");
        div.classList.add("read-list__item");
        let authors = this.currBook && this.currBook.author_name
            ? this.currBook.author_name.join(", ")
            : "N/A";
        div.innerHTML = `<div><p class="read-list__title">${this.currBook.title}</p>
          <p class="read-list__author">${authors}</p></div>
          <button class="mark-btn"><i class="fas fa-check"></i></button><button class="remove-btn"><i class="fas fa-minus-square"></i></button>`;
        this.readList.appendChild(div);
        this.saveLocalBooks(div.innerHTML);
        this.bookCounter++;
        this.btnBookCounter.innerText = this.bookCounter;
      }
    });
  }

  setMarkRemoveButtonListener() {
    this.readList.addEventListener("click", (event) => {
      const item = event.target;
      const listItem = item.parentElement;
      console.log(`className: ${item.className}`);
      if (item.className === "remove-btn") {
        this.removeLocalBooks(listItem.innerHTML);
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
    this.booksResponse = booksPage;
    this.booksResponse.docs.forEach((item) => {
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

  saveLocalBooks(item) {
    let items;
    if (localStorage.getItem("items") === null) {
      items = [];
    } else {
      items = JSON.parse(localStorage.getItem("items"));
    }

    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    //localStorage.clear();
  }

  getLocalBooks() {
    let items;
    if (localStorage.getItem("items") === null) {
      items = [];
    } else {
      items = JSON.parse(localStorage.getItem("items"));
    }
    items.forEach((item) => {
      let div = document.createElement("div");
      div.classList.add("read-list__item");
      div.innerHTML = item;
      this.readList.appendChild(div);
    });
    this.bookCounter = items.length;
    this.btnBookCounter.innerText = this.bookCounter;
  }

  removeLocalBooks(item) {
    let items;
    if (localStorage.getItem("items") === null) {
      items = [];
    } else {
      items = JSON.parse(localStorage.getItem("items"));
    }
    const itemIndex = item;
    items.splice(items.indexOf(itemIndex), 1);
    localStorage.setItem("items", JSON.stringify(items));
  }
}

class CollapseHelper {
  setCollapsing(className) {
    let collapse = document.getElementsByClassName(className);
    for (let i = 0; i < collapse.length; i++) {
      collapse[i].addEventListener("click", function () {
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

const bookListComponent = new BooksUI(new Api(), new CollapseHelper());
