import { enableOtpSectionFeatures } from "./OtpPageFeatures.js";

document.addEventListener('DOMContentLoaded', () => {
    setupTogglePassword();
});


function setupTogglePassword() {
    console.log('togglePassword-called')
    const passwordInput = document.getElementById('signup-input-password');
    const icon = document.getElementById('eye-icon');
    
    icon.addEventListener('click', () => {
        if(passwordInput.type == 'password'){
            passwordInput.type = 'text';
        }else {
            passwordInput.type = 'password';
        }

        icon.classList.toggle('fa-eye');        // initially i set the class to slash(hide) in my html icon, now as user clicks, the toggle will add fa-eye and remove fa-eye-slash....and on again click event things revert and so on
        icon.classList.toggle('fa-eye-slash');
    });
};

//------------------------------------------------------------------------------------------

async function unique_user_check(email) {
    const email_error_div = document.getElementById('email-error-div');
    const emailInput = document.getElementById('signup-input-email');

    emailInput.addEventListener('focus', () => {
        email_error_div.innerHTML = '';
    });

    // sending a separate post request to check whether the user with this email already exists ?
    try {
        if (email) {
            const response = await fetch('/TruLotParking/signup/check_user_exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email }) 
            })
    
            const data = await response.json();  // parsing response to readable format (json format)

            if(data.error){
                email_error_div.innerHTML = 'Internal Server Error';
                return false;
            }
            
            if (data.user_exists) {
                email_error_div.innerHTML = 'User with this email already exists.';
                emailInput.style.border = '0.6px solid red';
                return false;
            }
            return true;
        }
    }catch(e){
        email_error_div.innerHTML = 'Server error !';
        return false;
    }
}


// async function validate_phoneNumber(phone) {
//     const phone_error_div = document.getElementById('phone-error-div');
//     const phone_input = document.getElementById('signup-input-phone');

//     phone_input.addEventListener('focus', () => {
//         phone_error_div.innerHTML = '';
//     });

//     // sending a separate post request to check whether the user with this email already exists ?
//     try {
//         if (phone) {
//             const response = await fetch('/TruLotParking/signup/validate-phone', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({ phone: phone }) 
//             })
    
//             const data = await response.json();    // parsing resp to json(human readable)

//             if(!data.success){
//                 phone_error_div.innerHTML = 'Invalid Phone number in India.';
//                 phone_input.style.border = '0.6px solid red';
//                 return false;
//             }
//             return true;
//         }
//     }catch(e){
//         console.log(e);
//         phone_error_div.innerHTML = 'Server error !';
//         return false;
//     }
// }

async function validate_address(address) {
    const address_error_div = document.getElementById('address-error-div');
    const address_input = document.getElementById('signup-textarea-address');

    address_input.addEventListener('focus', () => {
        address_error_div.innerHTML = '';
    });

    // sending a separate post request to check whether the user with this email already exists ?
    try {
        if (address) {
            const response = await fetch('/TruLotParking/signup/validate-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ address: address }) 
            })
    
            const data = await response.json();    // parsing resp to json(human readable)

            if(!data.success){
                address_error_div.innerHTML = data.error;
                address_input.style.border = '0.6px solid red';
                return false;
            }
            return true;
        }
    }catch(e){
        console.log(e);
        address_error_div.innerHTML = 'Server error !';
        return false;
    }
}

function validateGenderSelection() {
    const genderOptions = document.querySelectorAll('input[name="gender"]');

    for (let option of genderOptions) {
        if (option.checked) {
            return option.value; 
        }
    }

    return null;  
}

const signupBody = document.getElementById('signup-form');

const verifyBtn = document.getElementById('verify-email-btn');
verifyBtn.addEventListener('click', async () => {
    const username_input = document.getElementById('signup-input-username');
    const email_input = document.getElementById('signup-input-email');
    const password_input = document.getElementById('signup-input-password');
    const address_input = document.getElementById('signup-textarea-address');

    const username = username_input.value;
    const password = password_input.value;
    const email = email_input.value;
    const address = address_input.value;
    
    const email_error_div = document.getElementById('email-error-div');
    const password_error_div = document.getElementById('password-error-div');
    const username_error_div = document.getElementById('username-error-div');
    const address_error_div = document.getElementById('address-error-div');

    const loader = document.getElementById('loader');

    username_input.addEventListener('focus', () => {
        username_input.style.border = '';
        username_error_div.innerHTML = '';
    })

    email_input.addEventListener('focus', () => {
        email_input.style.border = '';
        email_error_div.innerHTML = '';
    });

    password_input.addEventListener('focus', () => {
        password_input.style.border = '';
        password_error_div.innerHTML = '';
    });

    address_input.addEventListener('focus', () => {
        address_input.style.border = '';
        address_error_div.innerHTML = '';
    });
    
    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 300));
    if(username == ''){
        username_error_div.innerHTML = 'Username field is required';
        username_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(username.length < 3 || username.length > 25){
        username_error_div.innerHTML = 'Username must be of 3-25 letters';
        username_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        username_error_div.innerHTML = '';
    }


    if (password == ''){
        password_error_div.innerHTML = 'password field is required';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(password.length < 5 || password.length > 15){
        password_error_div.innerHTML = 'Password must be of length 5-15';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(!(/[!@#$%^&*(),.?":{}|<>]/.test(password) && /[A-Z]/.test(password))){
        password_error_div.innerHTML = 'Format of password is invalid';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        password_error_div.innerHTML = '';
    }


    if(email == ''){
        email_error_div.innerHTML = 'Email field is required';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(email.length > 50 || email.length < 11){
        email_error_div.innerHTML = 'Email format is incorrect';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if((!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|ds\.study\.iitm\.ac\.in)$/.test(email))){
        email_error_div.innerHTML = 'Format of email is invalid, check it.';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        email_error_div.innerHTML = '';
    }

    if(address == ''){
        address_error_div.innerHTML = 'Address field is required';
        address_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(address.length < 30){
        address_error_div.innerHTML = 'More precise address is required'
        address_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(address.length > 200){
        address_error_div.innerHTML = 'Address is very long';
        address_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        address_error_div.innerHTML = '';
    }

    const gender = validateGenderSelection();
    if(!gender){
        loader.style.display = 'none';
        customAlert("Please select your gender.");
        return false;
    }

    const resp = await unique_user_check(email);
    if(!resp){
        loader.style.display = 'none';
        return false;
    }

    const resp3 = await validate_address(address);
    if(!resp3){
        loader.style.display = 'none';
        return false;
    }

    const payload = {username, password, email, address, gender};

    const res = await fetch('/signup/emailVerification/requestOtp', {              // request OTP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    loader.style.display = 'none';

    if (data.success) {
        sessionStorage.setItem('formData', JSON.stringify(payload));   // user information is stored in sessionStorage
        
        await customAlert(data.message);
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('requestOtp_form').style.display = 'block';      // form where user will put otp, will be displayed.
        enableOtpSectionFeatures();
    } else {
        await customAlert(data.message);
        if(data.message == 'Your Email is already Verified, Creating your account on TruLot.....'){

            loader.style.display = 'flex';
            const res = await fetch('/TruLotParking/signup/role/userDashboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username, 
                    email: email, 
                    password: password, 
                    address: address,
                    gender: gender
                })
            });

            const resp = await res.json();
            
            if(resp.success){
                sessionStorage.removeItem('formData');
                signupBody.style.display = 'none';      // form where user will put otp, will be displayed.
                await new Promise(resolve => setTimeout(resolve, 400)); 
                window.location.href = resp.path;
            }else{
                await customAlert(resp.message);
                signupBody.style.display = 'block';
                return;
            }
        }
    }
});


// requestOtp form
const requestOtp_btn = document.getElementById('requestOtp_btn');   // submit otp button 

requestOtp_btn.addEventListener('click', async () => {
    requestOtp_btn.disabled = true;

    const otpInputs = document.querySelectorAll('.otp-value');
    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (!/^\d{4}$/.test(otp)) {
        await customAlert('Enter a valid 4-digit OTP....');
        requestOtp_btn.disabled = false;
        loader.style.display = 'none';
        return false;
    }

    const formData = JSON.parse(sessionStorage.getItem('formData'));
    if (!formData) {
        await customAlert("Please fill the signup form again.");
        window.location.reload();
        return;
    }
    const email = formData.email;
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const res = await fetch('/signup/emailVerification/verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });

    const data = await res.json();
    if (data.success) {
        await customAlert(data.message);
        const res = await fetch('/TruLotParking/signup/role/userDashboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.username, 
                email: formData.email, 
                password: formData.password, 
                address: formData.address,
                gender: formData.gender
            })
        });

        const resp = await res.json();
        loader.style.display = 'none';

        if(resp.success){
            sessionStorage.removeItem('formData');
            signupBody.style.display = 'none';      // form where user will put otp, will be displayed.
            await new Promise(resolve => setTimeout(resolve, 400)); 
            window.location.href = resp.path;
        }else{
            signupBody.style.display = 'block';
            await customAlert(resp.message);
        }
    } else {
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        await customAlert(data.error);

    }
});

