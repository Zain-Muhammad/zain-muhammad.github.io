function openNav() {
    var element = document.getElementById("nav-mobile");
    element.classList.toggle("active");
}

// code for change the specialities
const symbols = ['Frontend Developer Extraordinaire', 'Master of User Interfaces', 'HTML, CSS, JS Wizard', 'Web Design Specialist', 'Web Design Maestro', 'Responsive Web Developer', 'Code Connoisseur', 'Digital Experience Engineer', 'Frontend Architect', 'UI Automation Expert'];
let count = 0;
const element = document.getElementById("change");
const iteration = () => {
    element.innerHTML = symbols[parseInt(count / 2, 10) % symbols.length] + ' .';
    if (count % 2 !== 0) {
        element.classList.add("out");
    } else {
        element.classList.remove("out");
    }
    count++;
    // if you're affraid the code could run for so long that it could fail,
    // 6 is enough (number of elems * 2)
    if (count === symbols.length * 2) {
        count = 0;
    }
};
let inthandle = setInterval(iteration, 2500);
iteration();


/* cursor js */
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', e => {
    cursor.setAttribute("style", "top: " + (e.pageY - 10) + "px; left: " + (e.pageX - 10) + "px;")
});

document.addEventListener('click', e => {
    cursor.classList.add("expand");
    setTimeout(() => {
        cursor.classList.remove("expand");
    }, 500);
});
/* cursor js */
