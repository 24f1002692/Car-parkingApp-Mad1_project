const deleteIcon = document.getElementById('delete-icon');
deleteIcon.addEventListener('click', async () => {
    const lotId = deleteIcon.dataset.lotId;

    try {
        const response = await fetch(`/TruLotParking/role/adminDashboard/deleteParkingLot?lot_id=${lotId}`, {
            method: 'DELETE'
        });

        const result = await response.json();  // <-- get JSON body from backend
        console.log(result);
        alert(result.msg);  

        if (response.ok && result.success) {               
            window.location.href = "/TruLotParking/role/adminDashboard";            // loads page only when deleted successfully.
        }
    } catch (err) {
        console.error("Network error:", err);
        alert("Something went wrong. Please try again.");
    }
});