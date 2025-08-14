/*!
* Start Bootstrap - Grayscale v7.0.6 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});




// Pillole.html pulsante Ordina per Tag

const container = document.getElementById('big-container');
const originalHTML = container.innerHTML; // salva l'HTML originale

function fadeOut(el, callback) {
    el.classList.remove('show');
    setTimeout(callback, 400);
}

function fadeIn(el) {
    requestAnimationFrame(() => {
        el.classList.add('show');
    });
}

function animateCascade(elements) {
    elements.forEach((el, i) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${i * 0.1}s`;
        requestAnimationFrame(() => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        });
    });
}

const btnTags = document.getElementById('btn-tags');
// stile bottone: minuscolo e più piccolo
btnTags.style.textTransform = "none";
btnTags.style.fontSize = "0.9rem";

let isTagView = false;

// Funzione per generare la vista tag
function showTagView(skipAnimation = false) {
    const books = Array.from(container.querySelectorAll('.book'));
    
    const tagsMap = {};
    books.forEach(book => {
        const bookTags = book.dataset.tags.split(',').map(t => t.trim());
        bookTags.forEach(tag => {
            if (!tagsMap[tag]) tagsMap[tag] = [];
            tagsMap[tag].push(book);
        });
    });

    const sortedTags = Object.keys(tagsMap).sort((a,b) => a.localeCompare(b, 'it', {sensitivity:'base'}));
    const tagColors = ['#f48fb1', '#80cbc4', '#9fa8da', '#ffb74d'];

    let html = `<div class="list-view-container" style="max-width:600px; margin:auto; background-color:#f8f9fa;">`;
    sortedTags.forEach((tag, index) => {
        const bgColor = tagColors[index % tagColors.length];
        html += `<h5 class="mt-3 tag-title" style="display:inline-block; background-color:${bgColor}; color:white; padding:5px 10px; border-radius:5px; font-size:1rem; margin-bottom:5px;">${tag}</h5>`;
        html += `<ul class="list-group mb-3">`;
        tagsMap[tag].forEach(book => {
            const link = book.querySelector('a')?.getAttribute('href');
            const title = book.querySelector('.pag')?.textContent.trim() || '';
            html += `<li class="list-group-item" style="font-size:1rem; background-color:transparent;"><a href="${link}" style="color:black; text-decoration:underline;">${title}</a></li>`;
        });
        html += `</ul>`;
    });
    html += `</div>`;

    container.innerHTML = html;

    if (!skipAnimation) {
        animateCascade(container.querySelectorAll('.tag-title, li'));
    }

    btnTags.textContent = "Vista a libri";
    isTagView = true;
}

// Click button toggle
btnTags.addEventListener('click', function() {
    fadeOut(container, () => {
        if (!isTagView) {
            showTagView();
        } else {
            container.innerHTML = originalHTML;
            animateCascade(container.querySelectorAll('.book'));
            btnTags.textContent = "Ordina per tags";
            isTagView = false;
        }
        fadeIn(container);
    });
});

container.classList.add('fade-transition', 'show');

// ✅ Vista tag immediata se URL contiene ?view=tags
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'tags') {
        // mostra subito la vista tag senza fade/animazione
        showTagView(true);

        // scroll immediato
        const firstTag = container.querySelector('.tag-title');
        if (firstTag) {
            firstTag.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }
});





