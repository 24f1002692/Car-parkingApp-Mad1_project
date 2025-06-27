Array.from(document.getElementsByClassName('release-spot')).forEach(btn => {
    btn.addEventListener('click', async() => {
        const loader = document.getElementById('loader');
        const reservedSpotId = btn.getAttribute('data-reserved-id');
        const url = `/TruLotParking/role/userDashboard//my-active-reservations/releaseSpot?reserved_spotId=${reservedSpotId}`;
        
        loader.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 400));

        const res = await fetch(url);
        const resp = await res.json();
        
        loader.style.display = 'none';
        
        if(resp.success){
            await customAlert(resp.message);
            window.location.href = `${resp.path}?reserved_spot_id=${resp.reserved_spot_id}`;
        }else{
            await customAlert(resp.message);
        }
    })
});