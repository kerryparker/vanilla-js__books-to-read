let addButton = document.getElementById("addButton");
let readList = document.getElementById("readListHolder");

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
}

function removeOrMarkRead(e) {
  const item = e.target;
  if (item.className === "remove-btn") {
    const listItem = item.parentElement;
    listItem.remove();
  } else
   if (item.className === "mark-btn") {
      const listItem = item.parentElement;
      listItem.classList.toggle("marked-item");
      let button = listItem.querySelectorAll('button');
      button[1].remove();
      item.remove();
      
  }
}
