# MODERN APPLICATION DEVELOPMENT PROJECT - 1

-----------------------------------------------------------------------------------------------------------------------------------------------
# OVERVIEW : PARKING APP

# ADMIN FEATURES
- This is a four-wheeler(vehicles) parking app, in which a admin can login and create parking lots in various areas of different countries.
- Each Parking lot has around 20 parking slots.

- Admin can also view status of parking lots(vailable and non-available ) and slots(occupied, free, or under maintainence).
- Admin can edit/delete any number of parking lots, i.e., admin can increase or decrease the number of parking spots inside the lot.
  Note that : A parking lot can be     deleted only if all spots in the parking lot are empty.

- Admin can view list of registered users, active users and user details who booked some spots.
- Admin can check the parked vehicle details.

- The admin can view the summary charts of parking lots/spots.
- Admin can also send a email to the users to tell them about their pending payments, so that their users were get to know about it time to time.
- Admin also have a list of bills either with pending payments and non-pending payments.


# USER FEATURES
- A new user can signup to the app and can search for an available parking lot to book it to park his four-wheeler with best prices around him/her, if he/she required.
- IMPORTANT : 
- The user can choose an available parking lot and allocation is done as per the first available parking spot. Note: The user can’t select a parking spot.
  As user book for a particular lot, a spot number is assigned to him with spot details will be shown under booked spots.

- Existing user can login to our app and access his dashboard and can reserve or free a spot and can also access his/ her pending payments page.

- The timestamp is recorded between parking in and parking out.
- Shows the summary charts on his/her parking.

- As a user login to his/ her dashboard, if he has pending payments, then he/ she will saw a custom pop-up message.
- if user clicks on pay of any bill, then payment is done (no payment gateway rightnow).


# TECH STACK REQUIRED
1) flask => for Backend Apis.
2) One important thing, I used to manage the route in different files in controllers folder, for which Blueprint module imported from flask module.
2) SQlite and flask-SQLAlchemy => for database queries and models creation and binding backend with database.
3) HTML5, CSS and BOOTSTRAP(cascading style sheets), basic javascript(for hitting backend using fetch function and DOM manipulation).
4) Jinja2 for templating....


# PYTHON MODULES REQUIRED (requirements.txt)
1) flask , flask-sqlalchemy module.
2) blueprint module.
3) redis module.
4) sib_api_v3_sdk is an important module, called sendinBlue module. I used it to send emails to users (idea for how to send emails to users).
5) APScheduler
6) email_validator, pydantic, pycountry, phonenumbers, pyJWT, python-dotenv and many more.
5) other basics modules used are random, re, os, module.


# sib_api_v3_sdk Module
- send-in-blue version 3 software development kit integrated with BREVO(email service).

- command to install module : pip install sib_api_v3_sdk
- set up an API-key via signup with your official app email id and generate an api-key.

- In your router file, configure the module using Configuration() function of the sib module via configuration = sib_api_v3_sdk.configuration().
- Use this piece of code to set your Brevo Api-key => - configuration.api_key['api-key'] = 'Your-Api-Key' and create an email_sender.
- Create your custom email using SendSmtpEmail method of module and then send it using send_transac_email method.

- About usage of sib_api_v3_sdk module
- use to send offer emails, OTP emails, reset password links, and warning emails for pending payment emails....

# Why using BREVO ?
- As we send mails using an email service(without any official domain), google will bydefault send our app mails to gmail's spam folder of their gmail.
- To avoid it, we use official domains like brevo...

# APScheduler Module
- It is a module, that are used to add some additional tasks, such as periodically delete rows from a table based on some condition.

# redis module
- It is used to protect the special services from attackers.
- In my project, i use this module, to create a redis-client, that allows a specific email to request only 3 OTP and 3 Reset password links per hour.

# pyJWT
- This module is use to sign a token for the user, to authorise the user without asking her credentials again when user hits the protected api's of our backend.


--------------------------------------------------------------------------------------------------------------------------------------


# HOW TO SET UP VIRTUAL ENVIRONMENT AND FILE STRUCTURE? 

- Open Your default terminal and switch to powershell or command prompt to naviagte to your project directory.

- Step 1 : Clone the repository to your local machine.
- Clone Repository Using command - git clone https://github.com/24f1002692/Appdev-car-parking.git


- Step 2 : Navigate to the folder cloned using above step and Go with any one way to setup your virtual environment.
- Using Command Prompt (cmd)
- Create a virtual environment folder using the command => python3 -m venv folderName    (folderName is the name of the virtual environment folder).
- Activate your virtual environment using the command => source folderName/bin/activate.

- Using PowerShell (PS)
- Create a virtual environment folder using the command => python -m venv folderName    (folderName is the name of the virtual environment folder).
- Activate your virtual environment using the command => .\venv\Scripts\Activate.


- Step 3: Set up your .env file details, with your Admin info and Database name/ url, API key of email-sender service and others, app and JWT SECRET etc

- Step 4 : Run a command to install dependencies listed in requirement.txt - pip install -r requirements.txt

- Step 5 : After setup, run command to start the app - python app.py




-----------------------------------------------------------------------------------------------------------------------------------------------------------------
# IMPORTANT Q

#  WHY USE JAVASCRIPT ?
=> Few Reasons :
1) Using Javascript we can access any element of our document(model) and manipulate it according to our will which will enhance user experience and avoids page reloads.
2) It is also used to protect from the unnessary hitting the backend with manipulated data reduces load from server, and also can be used to hit other's backend or our own backend directly from frontend.

2) In signup, login forms and requestOTP forms, I used javascript for form validation from frontend side, so that user don't hit the backend api with irrelevant data again and again.
if the user entered some invalid data and submits, we immediately validate it and return with error message to user due to validate the form on frontend.
once user entered valid data and then javascript validate the form to true then we can manually or directly submit the form.

3) I also used javascript to send the request to the backend from frontend without submitting the form (while requesting OTP and verifiying it). So that the i can change user's view without reloading the page (DOM MANIPULATION).


-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
# HOW I APPROACHED APPDEV 1 PARKING PROJECT.....

# CREATING BASIC FILE STRUCTURE
- create a folder with the name project_folder_rollno, which has major five folders as controllers, instance, models, static, templates and a app.py(main file).
1) controllers folder is used to manage routes related to admin, user and forms.
2) instance folder
3) models folder is used to manage model(SQL Table) related to admin, user, login & signup forms.
4) static folder is used to store all the css, javascript part used in admin, user and form-sections.
5) templates folder is used to store the HTML5 structure of the admin, user and form-sections.
6) Readme.md file sections that store the explanations of the project.


# STEP 1 : CREATING A SIGNUP AND LOGIN PAGE....

# SIGNUP PAGE
- To start the project, I create a database named as appdev_database.sqlite3 and code a SQL table structure in user.py file in models.user_model. 
- Here, I used attributes called name, password, email(must be unique), country and an important attribute called role 
that is used to different the admin from other users. User can't choose their role, they are bydefault user in table structure.

- I hardcoded a row with my details and the role as admin in the init_userDb.py file in models.user_model, and as the table is initialised..., the table is created with one default row that is related to admin. As more user signup to the app, they were considered by default of user role.

- As the table is created, I moved to writing signup and login api.

- How to create a signup page ? how it works ?
- Answer -
- for the signup page, the endpoint is /signup/creatingUser, I write the backend for this endpoint in the signup_route.py file in controllers.form with server side validation to avoid attacks from developer tools say postman....
- At the signup route, i render a html form and validate it with from frontend as well as from backend.
- Once, we get the valid form data using frontend validation.

- After basic frontend validation, we also hit our backend from frontend to validate user phone number, whether it is a valid indian phone number or not ?

- After validating his basic details and phone number we send user a otp to verify that the email, user is providing us, is a valid email address and belong to him only.
- Once the email is verified, user can submit hit our endpoint where we initialised a user object with this form data and add it to user table, only if the user with the email does not exist....

- As his account is created, we also sign a JWT token for user and store it in user browser in cookie, so we can authorise user for protected Apis without asking user's credentials on every request made to the server. 

- To differentiate among users, I used their email id because each person can only have one email id.

- IMPORTANT : Once the user's email id is verified, we are storing it in a table right now for a specific time period(360 minutes), so that if user did not create his account after verification of his email, and if again try to create his account within that specific time period, that instead of verifying him again, we let user to him our api and create his account.


# LOGIN PAGE
- for the login page, the endpoint is /loginUser, which render a login-form where user can use their email and password to login... why use email ? Because in our user table, we assume that email id is unique.
Based on email, i will verify that the email provided is in my database or not.

- how it internally works ?
- Answer -
- I get the user email id and password using the login form and validate it on frontend, and if the data provided is seems valid, then only I manually submitted the form.
- After the submission, data goes to /yourDashboard, where it again validate via server side validation, and then we query in our database with the given email and password (here we need to use both email and password to query because, if we use only email, then may be user's email is correct but password even if is not correct, we allowed him/ her to the dashboard), which is security threat.

- If we find the user with the given email and the password, then we redirect him/her to their profile.

- As the user is logged in, we also sign a JWT token for user and store it in user browser in cookie, so we can authorise user for protected Apis without asking user's credentials on every request made to the server. 


-------------------------------------------------------------------------------------------------------------------------------------------

# WHY WE NEED TO DO BOTH FRONTEND AS WELL AS SERVER SIDE VALIDATION ?
- Answer -
- Frontend Validation of the form data, optimises the app such that end user can't hit our api unnecessary with invalid/ irrelevant data, reduces server load and increase the efficiency of our server.
- Frontend Validation must ensures that the form data send to end point must be valid/ relevant.

- Since, we are sending relevant data to our backend api, then why we are doing server side validation, also ?
- Because, there are many platforms, such as postman, hopscottch etc, that allow end user, to hit our api with accessing our forms, which could be problematic in case, where our api is sending sensitive data or increase threat of SQL injections, database impurities etc.


----------------------------------------------------------------------------------------------------------------------------------------






# STEP 2 : CREATE LANDING PAGE
- USING CSS AND BOOTSTRAP CREATE A LANDING PAGE OF YOUR OWN DESIGN & EMBED YOUR SIGNUP AND LOGIN ROUTES THERE.

- YOU CAN ALSO EMBED OTHER PAGES(ROUTES) AS PER YOUR NEED AND IDEAS, BUT REMEMBER THAT DON'T EMBED YOUR ADMIN OR USER DASHBOARD LINKS IN LANDING PAGE.
- THEY SHOULD BE PROTECTED VIA THE FORMS, ONCE USER GIVES US THEIR DATA THEN THEY ARE EXPOSED TO THESE URLs.


--------------------------------------------------------------------------------------------------------------------------------------------
# STEP 3 : CREATE ADMIN AND USER DASHBOARD

- ADMIN DASHBOARD