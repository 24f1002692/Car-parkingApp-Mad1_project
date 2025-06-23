document.addEventListener('DOMContentLoaded', () => {
    setupTogglePassword();
});


function setupTogglePassword() {
    console.log('togglePassword-called')
    const passwordInput = document.getElementById('login-input-password');
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

document.getElementById('login-button').addEventListener('click', async(event) => {
    event.preventDefault();       
    const loader = document.getElementById('loader');
    const emailInput = document.getElementById('login-input-email');
    const passwordInput = document.getElementById('login-input-password');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const email_error_div = document.getElementById('email-error-div');
    const password_error_div = document.getElementById('password-error-div');

    emailInput.addEventListener('focus', () => {
        email_error_div.innerHTML = '';
        emailInput.style.border='';
    });

    passwordInput.addEventListener('focus', () => {
        password_error_div.innerHTML = '';
        passwordInput.style.border='';
    });

    
    // Validating form
    if(email == ''){
        email_error_div.innerHTML = 'Email field is required';
        emailInput.style.border = '0.6px solid red';
        return false;
    }else if(email.length > 40 || email.length < 11){
        email_error_div.innerHTML = 'Email must be 11-40 characters long';
        emailInput.style.border = '0.6px solid red';
        return false;
    }else if((!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|ds\.study\.iitm\.ac\.in)$/.test(email))){
        email_error_div.innerHTML = 'Format of Email is invalid, check it.';
        emailInput.style.border = '0.6px solid red';
        return false;
    }else{
        email_error_div.innerHTML = '';
    }


    if (password == ''){
        password_error_div.innerHTML = 'Password field is required';
        passwordInput.style.border = '0.6px solid red';
        return false;
    }else if(password.length < 5 || password.length > 15){
        password_error_div.innerHTML = 'Password should be of 5-15 character';
        passwordInput.style.border = '0.6px solid red';
        return false;
    }else if(!(/[!@#$%^&*(),.?":{}|<>]/.test(password) && /[A-Z]/.test(password))){
        password_error_div.innerHTML = 'Password must have an Uppercase and a special character';
        passwordInput.style.border = '0.6px solid red';
        return false;
    }else{
        password_error_div.innerHTML = '';
    }

    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 400)); 
    const resp = await fetch('/TruLotParking/yourDashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email, 
            password: password
        })
    });
    
    loader.style.display = 'none';
    const res = await resp.json();
    
    if(res.success){
        await customAlert(res.message);
        loader.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 400));
        window.location.href = res.dashboard;
    }else{
        await customAlert(res.message);
        return;
    }
});