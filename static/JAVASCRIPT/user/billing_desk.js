document.getElementById('pay-btn').addEventListener('click', async() => {
    const reservedSpotId = document.getElementById('pay-btn').getAttribute('data-reserved-id');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 400));
    const res = await fetch('/TruLotParking/role/userDashboard/my-active-reservations/billing-desk', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reserved_spot_id: reservedSpotId })
    });

    const json_res = await res.json();
    loader.style.display = 'none';
    
    if(json_res.success){
        await customAlert(json_res.message);
        window.location.href = json_res.path;
    }else{
        await customAlert(json_res.message);
    }
});