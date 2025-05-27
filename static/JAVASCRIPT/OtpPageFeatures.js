export function enableOtpSectionFeatures(){
    const otpInputs = document.querySelectorAll("#otp-box .otp-value");     // selecting all inputs inside otp-bpx only
    
    otpInputs.forEach((input, index) => {
        // adding a input event listener to each input
        input.addEventListener("input", (e) => {
            const value = e.target.value;
            if ((value.length === 1 || e.key === 'ArrowRight') && index < otpInputs.length - 1) {         // it will check that the value length should be exactly one and the index will not exceed the array length
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft" && index > 0) {
                const prevInput = otpInputs[index - 1];
                prevInput.focus();

                // delaying 5ms so, that input box will be focus properly then the cursor will be placed at the end...
                // if we don't use setTimeout, as we focus on prev box, as the same time selectionRange will see that no value already there.......although there a value...
                setTimeout(() => {
                    const length = prevInput.value.length;
                    prevInput.setSelectionRange(length, length);    // range starts with same length and ends at same length, out the typing cursor at the end....
                }, 5);
            }
        });
    });
}