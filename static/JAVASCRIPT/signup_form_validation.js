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
        console.log('unique check failed - ',e);
        email_error_div.innerHTML = 'Server error !';
        return false;
    }
}

async function check_country_exists(country) {
    console.log(country);
    try{
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}`);     // using an external api (rest countries api).
        console.log(response.ok);
        // response not came, country won't exist
        if(!response.ok){
            return false;
        }
        return true;   // country exists
    }catch(e){
        return {message : 'cannot fetch, check_country_error'};
    }
}

async function validateForm(event) {
    event.preventDefault();       
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const usernameInput = document.getElementById('signup-input-username');
    const passwordInput = document.getElementById('signup-input-password');
    const emailInput = document.getElementById('signup-input-email');
    const countryInput = document.getElementById('signup-input-country');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const email = emailInput.value.trim();
    const country = countryInput.value.trim();

    const username_error_div = document.getElementById('username-error-div');
    const password_error_div = document.getElementById('password-error-div');
    const email_error_div = document.getElementById('email-error-div');
    const country_error_div = document.getElementById('country-error-div');


    usernameInput.addEventListener('focus', () => {
        username_error_div.innerHTML = '';
        usernameInput.style.border = '';
    });

    passwordInput.addEventListener('focus', () => {
        password_error_div.innerHTML = '';
        passwordInput.style.border = '';
    });

    emailInput.addEventListener('focus', () => {
        email_error_div.innerHTML = '';
        emailInput.style.border = '';
    });
    
    countryInput.addEventListener('focus', () => {
        country_error_div.innerHTML = '';
        countryInput.style.border = '';
    });

    
    // Validating form
    if(username == ''){
        username_error_div.innerHTML = 'username field is required';
        usernameInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(username.length > 15 || username.length < 5){
        username_error_div.innerHTML = 'username exceeds limit of 15 characters';
        usernameInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        username_error_div.innerHTML = '';
    }


    if (password == ''){
        password_error_div.innerHTML = 'password field is required';
        passwordInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(password.length < 8 || password.length > 15){
        password_error_div.innerHTML = 'password should be of 8-15 characters.';
        passwordInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(!(/[!@#$%^&*(),.?":{}|<>]/.test(password) && /[A-Z]/.test(password))){
        password_error_div.innerHTML = 'Incorrect password Format.';
        passwordInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        password_error_div.innerHTML = '';
    }


    if(email == ''){
        email_error_div.innerHTML = 'email field is required';
        emailInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(email.length > 40 || email.length < 11){
        email_error_div.innerHTML = 'email format is incorrect';
        emailInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if((!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|ds\.study\.iitm\.ac\.in)$/.test(email))){     // from frontend only supporting three types of email. (can new free api to allow every email after verify their addresses using api)
        email_error_div.innerHTML = 'format of email is invalid, check it.';
        emailInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        email_error_div.innerHTML = '';
    }
    

    if(country == ''){
        country_error_div.innerHTML = 'country field is required.';
        countryInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(country.length > 20 || country.length < 2){
        country_error_div.innerHTML = 'country name is invalid.';
        countryInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }
    

    const res = await check_country_exists(country);
    if(!res){
        country_error_div.innerHTML = 'Country with this name does not exist.';
        countryInput.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }

    // if inputs are valid then only we reach here to check is there is any duplicate user...
    const result = await unique_user_check(email);
    if(!result){
        loader.style.display = 'none';
        return false;
    }
    
    document.getElementById('signup-form').submit();  // Manually submit the form, loader disappear due to reload...
}