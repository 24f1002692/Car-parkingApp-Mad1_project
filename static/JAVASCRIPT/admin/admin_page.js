const deleteIcons = document.querySelectorAll('#delete-icon');
const loader = document.getElementById('loader');

deleteIcons.forEach(deleteIcon => {
    deleteIcon.addEventListener('click', async () => {
        const lotId = deleteIcon.dataset.lotId;
        try{
            await customPrompt({
                heading: `Type "DELETE LOT" to confirm deletion of this parking Lot`,
                placeholder: 'Type "DELETE LOT"',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                validator: (val) => val.trim().toLowerCase() === 'delete lot'
            });

            if (!confirmed) {
                return;
            }

            loader.style.display = 'flex';

            const response = await fetch(`/TruLotParking/role/adminDashboard/deleteParkingLot?lot_id=${lotId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            await new Promise(resolve => setTimeout(resolve, 500));
            loader.style.display = 'none';
            
            if (response.ok && result.success) {
                await customAlert(result.msg);  
                window.location.href = "/TruLotParking/role/adminDashboard";
            }
        } catch (err) {
            loader.style.display = 'none';
            return;
        }
    });
});
