const items = document.querySelectorAll("nav a");

items.forEach(item=>{

item.addEventListener(
"click",

()=>{

document
.querySelector(
".active"
)
.classList
.remove(
"active"
);

item
.classList
.add(
"active"
);

}

);

});
