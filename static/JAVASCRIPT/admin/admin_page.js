const deleteIcons = document.querySelectorAll('#delete-icon');
const loader = document.getElementById('loader');

deleteIcons.forEach(deleteIcon => {
    deleteIcon.addEventListener('click', async () => {
        const lotId = deleteIcon.dataset.lotId;
        console.log(lotId);

        const confirmation = prompt('Type "delete lot" to confirm deletion of this parking lot:');

        if (confirmation !== 'delete lot') {
            await new Promise(resolve => setTimeout(resolve, 300));
            alert('Deletion cancelled. You must type "delete lot" to confirm.');
            return;
        }

        loader.style.display = 'flex';

        try {
            const response = await fetch(`/TruLotParking/role/adminDashboard/deleteParkingLot?lot_id=${lotId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            loader.style.display = 'none';
            alert(result.msg);  

            if (response.ok && result.success) {
                window.location.href = "/TruLotParking/role/adminDashboard";
            }
        } catch (err) {
            alert("Something went wrong. Please try again.");
        }
    });
});
