document.addEventListener(
"DOMContentLoaded",

()=>{

const links =
document.querySelectorAll(
"a[href]"
);

document.body.style.opacity=0;

setTimeout(()=>{

document.body.style.transition=
"opacity .6s ease";

document.body.style.opacity=1;

},100);

links.forEach(link=>{

link.addEventListener(
"click",

e=>{

const url=
link.getAttribute(
"href"
);

if(
url &&
url.includes(
".html"
)
){

e.preventDefault();

document.body.style.opacity=0;

setTimeout(()=>{

window.location=url;

},400);

}

}

);

});

}
);
