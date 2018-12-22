function count_as_page (section) {
    return !(section.classList.contains('not-page') ||
        section.classList.contains('title') ||
        section.classList.contains('section'));
}

window.addEventListener('load', function() {
    // process slides
    process_slides();
    // flatten();
});