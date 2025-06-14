// const search_input = document.getElementById('search-box');

// search_input.addEventListener('input', () => {
//     const search_value = search_input.value?.toLowerCase() || "";
//     const cards = document.querySelectorAll('.card.lot-card');

//     let isAnyVisible = false;

//     cards.forEach(card => {
//         const lotName = (card.dataset.lotName || "").toLowerCase();
//         if (search_value === '' || lotName.includes(search_value)) {
//             card.style.display = 'block';
//             card.classList.remove('hide');
//             isAnyVisible = true;
//         } else {
//             card.style.display = 'none';
//             card.classList.add('hide');
//         }
//     });

//     const noResults = document.getElementById('no-results');
//     if (noResults) {
//         noResults.style.display = isAnyVisible ? 'none' : 'block';
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-box');
    if (!searchInput) return;

    const targetClass = searchInput.dataset.targetClass;     // e.g., 'lot-card' or 'user-card'
    const cards = document.querySelectorAll(`.card.${targetClass}`);

    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        let isAnyVisible = false;

        cards.forEach(card => {
            const cardName = (card.dataset.name || "").toLowerCase();
            console.log(cardName);
            const isMatch = searchValue === "" || cardName.includes(searchValue);
            console.log(isMatch)

            card.style.display = isMatch ? "block" : "none";
            card.classList.toggle("hide", !isMatch);

            if (isMatch) isAnyVisible = true;
        });

        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = isAnyVisible ? 'none' : 'block';
        }
    });
});
