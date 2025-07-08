document.getElementById('pay-btn').addEventListener('click', async() => {
    const reservedSpotId = document.getElementById('pay-btn').getAttribute('data-reserved-id');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 400));

    try{
        const res = await fetch('/TruLotParking/role/userDashboard/my-active-reservations/billing-desk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reserved_spot_id: reservedSpotId })
        });

        const json_res = await res.json();
    
        if(json_res.success){
            loader.style.display = 'none';
            await customAlert(json_res.message);
            loader.style.display = 'flex';
            const response = await fetch('/TruLotParking/role/userDashboard/hasPendingBills');
            const resp = await response.json();
            if(resp.success){
                window.location.href = '/TruLotParking/role/userDashboard/my-pending-bills';
            }else if(!resp.success && resp.msg){
                loader.style.display = 'none';
                customAlert(resp.msg);
            }else{
                window.location.href = json_res.path;
            }

        }else{
            loader.style.display = 'none';
            await customAlert(json_res.message);
        }
    }catch(err){
        loader.style.display = 'none';
        await customAlert("Something went wrong. Please try again later.");
    }
});