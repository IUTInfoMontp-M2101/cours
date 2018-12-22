/**
 * List of slides
 * @type {Slide[]}
 */
let slides;
/**
 * Currently active slide
 * @type {Slide}
 */
let current_slide;
/**
 * Total number of pages (number of slides that count as pages)
 * @type {number}
 */
let nb_pages;
/**
 * Current page number (used when parsing all slides to add number count)
 * @type {number}
 */
let page_number;


/**
 * Representation of a slide
 *
 * Attributes:
 * - section: the HTML section that contains the data for the slide
 * - last_step: the index of the last valid step of the slide
 * - index: slide's index in the global array slides
 * - page_number: the page number of the slide if it is a numbered slide (undefined otherwise)
 *
 * @param section {HTMLElement} the section element that contains the information of the slide
 * @constructor
 */
function Slide(section) {
    // events handlers
    section.addEventListener('click', handle_click);

    // prepare dynamic elements (steps)
    let last_step = 0;
    let active_step = 0;
    let dynamic_elements = section.querySelectorAll('.uncover, .only');

    for (let j = 0; j < dynamic_elements.length; j++) {
        let element = dynamic_elements[j];

        // fix start/end values for dynamic elements
        if ('step' in element.dataset) {
            // if step value, start and end are set to step
            element.dataset.start = element.dataset.step;
            element.dataset.end = element.dataset.step;
        }
        if (!('start' in element.dataset || 'end' in element.dataset)) {
            // if no step, start or end value, implement default behavior:
            // - "uncover" from (active_step + 1) until the end of the slide)
            // - "only" for (active_step + 1) only
            active_step += 1;
            element.dataset.start = String(active_step);
            if (element.classList.contains('only')) {
                element.dataset.end = String(active_step);
            }
        } else if ('start' in element.dataset) {
            // remember starting step for next default "uncover" and "only"
            active_step = parseInt(element.dataset.start);
        }

        // remember highest step
        if (element.dataset.start > last_step) {
            last_step = parseInt(element.dataset.start);
        }
        if (element.dataset.end > last_step) {
            last_step = parseInt(element.dataset.end);
        }
    }
    this.page_number = page_number;

    // add header and footer
    let header = this.header();
    if (header) {
        section.insertBefore(this.header(), section.firstChild);
    }
    let footer = this.footer();
    if (footer) {
        section.appendChild(this.footer());
    }

    this.last_step = last_step;
    this.section = section;
    this.index = slides.length;
    this.display_step(0);
}


/**
 * Shows and hides dynamic elements to reflect the state of the slide at step n
 * @param n {number} step number to display
 */
Slide.prototype.display_step = function(n) {
    this.current_step = n;
    let dynamic_elements = this.section.querySelectorAll('.uncover, .only');

    for (let i = 0; i < dynamic_elements.length; i++) {
        let element = dynamic_elements[i];
        if (n < element.dataset.start || element.dataset.end < n) {
            if (element.classList.contains('only')) {
                element.classList.add('no-display');
            } else {
                element.classList.add('hidden');
            }
        } else {
            if (element.classList.contains('only')) {
                element.classList.remove("no-display");
            } else {
                element.classList.remove("hidden");
            }
        }
    }
};


/**
 * Return the header to be appended to the slide (`null` if no header)
 * This function can be redefined by themes.
 *
 * @returns {HTMLElement} element to be used as header (inserted before the slide content)
 */
Slide.prototype.header = function() {
    return null;
};


/**
 * Return an HTML element to be appended to the section as page counter.
 * This function can be redefined by themes.
 *
 * @returns {HTMLElement}
 */
Slide.prototype.page_counter = function() {
    let counter_div = document.createElement('div');
    counter_div.classList.add('page-counter');
    counter_div.innerText = this.page_number + ' / ' + nb_pages;
    return counter_div;
};


/**
 * Return the footer to be appended to the slide (`null` if no footer)
 * This function can be redefined by themes.
 *
 * @returns {HTMLElement} element to be used as footer (inserted after the slide content)
 */
Slide.prototype.footer = function() {
    let page_counter = this.page_counter();
    if (page_counter) {
        let footer_div = document.createElement('div');
        footer_div.classList.add('slide-footer');
        footer_div.appendChild(this.page_counter());
        return footer_div;
    }
    return null;
};


/**
 * Displays a specific slide
 *
 * @param slide {Slide} slide to display
 * @param end {boolean} whether the last step (true) or the first step (false) of the slide should be displayed
 */
function display_slide(slide, end=false) {
    if (current_slide !== slide) {
        current_slide.display_step(0);
        current_slide = slide;
    }
    current_slide.section.scrollIntoView();
    if (end) {
        current_slide.display_step(slide.last_step);
    } else {
        current_slide.display_step(0);
    }
}


/**
 * Show next slide
 */
function next_slide() {
    let index = current_slide.index;
    if (index + 1 < slides.length) {
        // move to next slide
        display_slide(slides[index + 1]);
    } else {
        // jump to last step if last slide
        current_slide.display_step(current_slide.last_step);
    }
}


/**
 * Show previous slide
 * By default, the first step of the previous slide is displayed. If `end` parameter is true, display last step of
 * previous slide instead.
 */
function prev_slide(end=false) {
    let index = current_slide.index;
    if (index - 1 >= 0) {
        // move to previous slide
        display_slide(slides[index - 1], end);
    } else {
        // if already on first slide, jump to first step
        current_slide.display_step(0);
    }
}


/**
 * Show next step on current slide (or first step of next slide if last step)
 */
function next_step() {
    if (current_slide.current_step + 1 > current_slide.last_step) {
        next_slide();
    } else {
        current_slide.display_step(current_slide.current_step + 1);
    }
}


/**
 * Show previous step on current slide (or last step of previous slide if first step)
 */
function prev_step() {
    if (current_slide.current_step - 1 < 0) {
        prev_slide(true);
    } else {
        current_slide.display_step(current_slide.current_step - 1);
    }
}


/**
 * Initial setup. Parses all slides, counts pages, prepares steps, etc.
 * Should be called in `window.onload`.
 */
function process_slides() {
    slides = [];
    let sections = document.querySelectorAll('section');

    // count number of pages
    nb_pages = 0;
    for (let i = 0; i < sections.length; i++) {
        if (count_as_page(sections[i])) {
            nb_pages += 1;
        }
    }

    page_number = 0;
    for (let i = 0; i < sections.length; i++) {
        if (count_as_page(sections[i])) {
            page_number += 1;
        }
        let slide = new Slide(sections[i]);
        slides.push(slide);
    }

    current_slide = slides[0];
    display_slide(current_slide);
}


/**
 * React to click event:
 *   - in leftmost third of current slide: previous step
 *   - in rest of current slide: next step
 *   - in another slide: make clicked slide active (and adjust scrolling to it)
 *
 * @param event {MouseEvent} click event
 */
function handle_click(event) {
    // get clicked section
    let section = event.target.closest('section');
    if (section !== current_slide.section) {
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].section === section) {
                return display_slide(slides[i]);
            }
        }
    }
    let rect = current_slide.section.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width; //x position within the element.
    if (x <= .33) {
        prev_step();
    } else {
        next_step();
    }
}

/**
 * React to key presses. Available actions:
 *   - Q or Left Arrow: previous step
 *   - D, Right Arrow or Space: next step
 *   - S or Down Arrow: next slide
 *   - Z or Up Arrow: previous slide
 *   - X: adjust scroll to current slide
 *   - J: jump to a specific page (prompts user for page number)
 */
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "q":
        case "ArrowLeft":
            event.preventDefault();
            prev_step();
            break;
        case " ":
        case "d":
        case "ArrowRight":
            event.preventDefault();
            next_step();
            break;
        case "s":
        case "ArrowDown":
            event.preventDefault();
            next_slide();
            break;
        case "z":
        case "ArrowUp":
            event.preventDefault();
            prev_slide();
            break;
        case "x":
            event.preventDefault();
            current_slide.section.scrollIntoView();
            break;
        case "j":
            let n = parseInt(window.prompt("Go to page"));
            if (Number.isInteger(n)) {
                goto(n);
            }
            break;
    }
});


/**
 * Jump to the first slide with given page number
 *
 * @param n {number} page number to jump to
 */
function goto(n) {
    if (n <= 0) {
        display_slide(slides[0]);
    } else if (n > nb_pages) {
        display_slide(slides[slides.length - 1]);
    } else {
        for (let i = 0; i < slides.length; i++) {
            if (slides[i].page_number === n) {
                return display_slide(slides[i]);
            }
        }
    }
}


/**
 * Transform the presentation into a pure HTML/CSS presentation by flattening all slide steps:
 *   - each slide is replaced by a sequence of slides corresponding to each of its display steps
 *   - elements that are not displayed in a step (class `only`) are removed from the DOM
 *   - anchors are added before each slide
 *   - links to previous and next slides are added on top of each slide
 *   - `script` elements are removed from the DOM
 *
 * Note: This function is not used automatically (can be used from the console or in a custom script)
 */
function flatten() {
    let step_counter = 0;
    for (let i = 0; i < slides.length; i++) {
        let slide = slides[i];
        for (let j = 0; j <= slide.last_step; j++) {
            slide.display_step(j);
            let section = slide.section.cloneNode(true);
            let anchor = document.createElement('a');
            anchor.id = "slide_anchor" + step_counter;
            let prev_link = document.createElement('a');
            prev_link.href = '#slide_anchor' + (step_counter - 1);
            prev_link.classList.add('prev_flat_link');
            section.appendChild(prev_link);
            let next_link = document.createElement('a');
            next_link.href = '#slide_anchor' + (step_counter + 1);
            next_link.classList.add('next_flat_link');
            section.appendChild(next_link);
            step_counter += 1;
            document.body.insertBefore(anchor, slide.section);
            document.body.insertBefore(section, slide.section);
        }
        slide.section.remove();
    }
    // remove all non-displayed elements
    let invisibles = document.getElementsByClassName('no-display');
    for (let i = invisibles.length - 1; i >= 0; i--) {
        invisibles[i].remove();
    }
    // remove all scripts from the page
    let scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].remove();
    }
}


/**
 * Whether the slide represented by the given section is counted as a page for numbering
 * This function can be redefined by themes.
 *
 * @param section {HTMLElement} a section element representing a slide
 * @returns {boolean}
 */
function count_as_page(section) {
    return !section.classList.contains('not-page');
}


window.onload = function() {
    process_slides();
};