let addButton = document.getElementById("addButton");
let readList = document.getElementById("readListHolder");
let doneCounter = [];
let bookCounter = [];
let btnDoneCounter = document.querySelector(".done-counter");
let btnBookCounter = document.querySelector(".books-counter");

addButton.addEventListener("click", addToRead);
readList.addEventListener("click", removeOrMarkRead);

function addToRead(event) {
  event.preventDefault();
  let div = document.createElement("div");
  div.classList.add("read-list__item");
  div.innerHTML = `<p class="read-list__title">Title of the book</p>
    <p class="read-list__author">Author</p>
    <button class="mark-btn">Mark as read</button><button class="remove-btn">Remove from list</button>`;
  readList.appendChild(div);
  bookCounter.push(div);
  console.log(bookCounter);
  btnBookCounter.innerText = bookCounter.length;
}

function removeOrMarkRead(e) {
  const item = e.target;
  const listItem = item.parentElement;
  if (item.className === "remove-btn") {
    listItem.remove();
    bookCounter.pop();
    btnBookCounter.innerText = bookCounter.length;
  } else if (item.className === "mark-btn") {
    listItem.classList.toggle("marked-item");
    doneCounter.push(listItem);
    btnDoneCounter.innerText = doneCounter.length;
    let button = listItem.querySelector(".remove-btn");
    button.remove();
    item.remove();
  }
}
