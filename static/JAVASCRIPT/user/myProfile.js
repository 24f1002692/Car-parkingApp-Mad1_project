const userPanel = document.getElementById('user-panel');
const loader_div = document.getElementById('loader');
const overlay_div = document.getElementById('overlay-blur');
const cross_button = document.getElementById('back-button');
const search_box = document.getElementById('search-box');


document.getElementById('profile').addEventListener('click', async(e) => {
    e.preventDefault();

    const url = document.getElementById('profile').href;
    loader_div.style.display = 'flex';

    try{
        await new Promise(r => setTimeout(r, 100));
        const res = await fetch(url);
        const json_res = await res.json();
        loader_div.style.display = 'none';

        if(json_res.success){
            console.log('succeed')
            const user = json_res.user;
            const phones = json_res.phone_list;

            document.getElementById('user-image').src = user.image;
            const infoDiv = document.querySelector('#user-panel .info');
            infoDiv.innerHTML = `
                <p>${user.name} &nbsp; <span class="gender-badge">${user.gender === 'Male' ? 'M' : 'F'}</span></p>
                <p><strong>${user.email}</strong></p>
                <p><strong>${user.address}</strong></p>
                <p>${phones.length > 0 ? phones.slice(0, 3).join(', ') : 'N/A'}</p>
                <p>${user.restrictUser ? 'Your are restricted by Admin' : ''}</p>
            `;

            if (search_box) {
                search_box.readOnly = true;
                search_box.style.pointerEvents = 'none';
                search_box.setAttribute('tabindex', '-1');
            }

            document.querySelectorAll('.navbar a').forEach(link => {
                link.style.pointerEvents = 'none';
            });

            overlay_div.classList.add("blurred");
            userPanel.classList.add("active");
        }else{
            await customAlert(json_res.message);
        }
    }catch(err){
        console.log(err);
        loader_div.style.display = 'none';
        await customAlert('Something went wrong. Please try again later.');
    }
});


cross_button.addEventListener('click', () => {
    userPanel.classList.add("closing");

    setTimeout(() => {
        overlay_div.classList.remove("blurred");
        userPanel.classList.remove("active");
        userPanel.classList.remove("closing");
        document.body.classList.remove('rating-active');     // searchbox also inactive when rating box is displayed

        if (search_box) {
            search_box.readOnly = false;
            search_box.style.pointerEvents = '';
            search_box.removeAttribute('tabindex');
        }

        document.querySelectorAll('.navbar a').forEach(link => {
            link.style.pointerEvents = '';
        });
    }, 300);
});