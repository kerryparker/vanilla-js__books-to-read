export class CollapseHelper {
    setCollapsing(className) {
     let collapse = document.getElementsByClassName(className);
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