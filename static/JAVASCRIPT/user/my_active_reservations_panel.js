document.addEventListener("DOMContentLoaded", () => {
    const userDetailButtons = document.querySelectorAll(".user-detail-btn");
    const lotDetailButtons = document.querySelectorAll('.lot-detail-btn');

    const panel = document.getElementById("userDetailsPanel");
    const lotPanel = document.getElementById('lotDetailsPanel');

    const mainContent = document.querySelector(".card-container");
    const paginationContainer = document.getElementById('pagination-container');

    const closeBtn = document.querySelector(".close-user-details");
    const lotCloseBtn = document.querySelector(".close-lot-details");

    const nameEl = document.getElementById("panel-name");
    const emailEl = document.getElementById("panel-email");
    const phoneEl = document.getElementById("panel-phone");
    const locationEl = document.getElementById("panel-location");

    const lotName = document.getElementById('Lot-name');
    const lotPrice = document.getElementById('Lot-price');
    const lotLocation = document.getElementById('Lot-location');

    userDetailButtons.forEach(button => {
        button.addEventListener("click", async() => {
            const loader = document.getElementById('loader');
            loader.style.display = 'flex';
            await new Promise(resolve => setTimeout(resolve, 750));
            loader.style.display = 'none';

            const card = button.closest(".card");   // jis card pe wo button khud present hai
            const details = card.querySelector(".details");

            if (!details){ 
                customAlert('No User Exist for this reservation');
                return;
            }

            const name = details.querySelector(".reserve-para strong")?.textContent.trim() || "N/A";
            const phone = details.querySelector(".reserve-para")?.textContent.split(',')[1]?.trim() || "N/A";

            // Extracting hidden email and location from <p> inside `.details`)
            const paragraphs = details.querySelectorAll("p");
            const email = paragraphs[1]?.textContent.trim() || "N/A";
            const location = paragraphs[2]?.textContent.trim() || "N/A";

            nameEl.textContent = name;
            phoneEl.textContent = phone;
            emailEl.textContent = email;
            locationEl.textContent = location;

            panel.classList.remove("hidden");
            panel.classList.add("show");
            mainContent.classList.add("blurred");
            paginationContainer.classList.add("blurred");
        });
    });


    lotDetailButtons.forEach(button => {
        button.addEventListener("click", async() => {
            const loader = document.getElementById('loader');
            loader.style.display = 'flex';
            await new Promise(resolve => setTimeout(resolve, 500));
            loader.style.display = 'none';

            const card = button.closest(".card");
            const details = card.querySelector(".details");

            if (!details){ 
                customAlert('No Parking Lot Exist for this reservation');
                return;
            }

            const paragraphs = details.querySelectorAll("p");
            const lotname = paragraphs[3]?.textContent.trim() || "N/A";
            const price = paragraphs[4]?.textContent.trim() || "N/A";
            const location = paragraphs[5]?.textContent.trim() || "N/A";

            lotName.textContent = lotname;
            lotPrice.textContent = price;
            lotLocation.textContent = location;

            lotPanel.classList.remove("hidden");
            lotPanel.classList.add("show");
            mainContent.classList.add("blurred");
            paginationContainer.classList.add("blurred");

        })
    })

    closeBtn.addEventListener("click", () => {
        panel.classList.remove("show");
        panel.classList.add("hidden");
        mainContent.classList.remove("blurred");
        paginationContainer.classList.remove("blurred");
    });

    lotCloseBtn.addEventListener('click', () => {
        lotPanel.classList.remove("show");
        lotPanel.classList.add('hidden');
        mainContent.classList.remove("blurred");
        paginationContainer.classList.remove("blurred");
    })
});