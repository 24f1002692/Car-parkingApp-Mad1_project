document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-box');
    if (!searchInput) return;

    const targetClass = searchInput.dataset.targetClass;     // e.g., 'lot-card' or 'user-card'
    const cards = document.querySelectorAll(`.spot-box.${targetClass}`);

    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        let isAnyVisible = false;

        cards.forEach(card => {
            const cardName = (card.dataset.name || "").toLowerCase();
            console.log(cardName);
            const isMatch = searchValue === "" || cardName.includes(searchValue);
            console.log(isMatch)

            card.style.display = isMatch ? "flex" : "none";
            card.classList.toggle("hide", !isMatch);

            if (isMatch) isAnyVisible = true;
        });

        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = isAnyVisible ? 'none' : 'block';
        }
    });
});