# TruLot Parking App

## Overview

TruLot is a modern, web-based smart parking solution designed for four-wheelers. It enables seamless interaction between users and administrators to manage real-time parking operations efficiently. This application is part of the **Modern Application Development - 1 (MAD1)** course project and showcases robust backend logic and dynamic frontend usability.

## Table of Contents

* [Features](#features)

* [Admin Features](#admin-features)
* [User Features](#user-features)
* [Technology Stack](#technology-stack)
* [Modules and APIs](#modules-and-apis)
* [Database Design](#database-design)
* [Setup Instructions](#setup-instructions)
* [Security Measures](#security-measures)
* [Why JavaScript](#why-javascript)
* [Development Approach](#development-approach)

## Features

### Admin Features

* Secure login for admin
* Create, edit, and delete parking lots (deletion allowed only if all spots are empty)
* Define up to 20 parking slots per lot
* Monitor slots' status: *free*, *occupied*, or *under maintenance*
* Track user reservations and parking activity
* Generate daily and monthly summaries using charts
* Send email reminders for pending user payments
* View list of bills (pending and non-pending)

### User Features

* Secure signup with OTP verification via email
* Login with email and password
* Book available parking lots (auto-assigns the first free spot)
* Dashboard to view current and past bookings
* Notification for pending payments upon login
* Real-time parking and billing history charts
* Option to mark a spot as free (ending a reservation)


---------------------------------------------------------------IMPORTANT TECHNOLOGIES USED ------------------------------------
## Technology Stack

### Backend :

* **Python**
* **Flask** (with Blueprints)
* **Flask-SQLAlchemy** (ORM)
* **SQLite3** (Database)
* **Redis** (Rate limiting)
* **APScheduler** (Scheduled background tasks)
* **PyJWT** (Authentication tokens)

### Frontend :

* **HTML5**, **CSS3**, **Bootstrap**
* **JavaScript** (DOM manipulation, form validation, API communication)
* **Chart.js** (Visualizations)
* **Jinja2** (Templating engine)

### External APIs :

* **Sendinblue / Brevo (sib\_api\_v3\_sdk)** – Email & OTP delivery
* **Twilio API** – WhatsApp OTP delivery (limited)
* **OpenCage Geocoding API** – Location validation
* **Unsplash API** – Dynamic lot & user image generation


-------------------------------------------------------------------- CONTROLLERS --------------------------------------------------
## Routers / Controllers

**Authentication, middlewares & Forms:**

* `signup_route.py` – Signup, OTP verification, and validation
* `login_route.py` – Secure login and session management
* `validate_phone.py`, `validate_address.py` – Input validation
* `generators.py` – JWT token generation and decoding

**Admin:**

* `createLot.py` – Lot creation
* `registered_users.py` – View all registered users
* `spotDetails.py` – Slot-level details and control
* `admin_summaryChart.py` – Summary statistics via Chart.js
* `generateImages.py` – Lot image generation using Unsplash


**User:**

* `myProfile.py` – Manage user profile and image
* `reservedSpots.py` – View reservation history
* `view_book_spot.py` – Book available spots
* `ratings.py` – Post feedback for parking lots
* `user_summaryChart.py` – Spending analytics


## Database Design

* `users` – Core user details (name, email, password, image, gender, role)
* `lots` – Parking lot metadata (name, price, availability, ratings, images)
* `parking_spots` – Slot status within each lot
* `reserved_parking_spots` – Booking records with timestamps and billing
* `address` – Address with geolocation
* `rating` – User reviews for lots
* `email_verification` – OTP verification status
* `password_reset_token` – Secure token-based reset mechanism
* `geographical_details` – Links lots to city/state/country


------------------------------------------------------------------- HOW TO SET UP -------------------------------------------------------
## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/24f1002692/Appdev-car-parking.git
   cd Appdev-car-parking
   ```

2. **Set Up Virtual Environment**

   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure .env File**
   Add environment variables like `SECRET_KEY`, `DATABASE_URI`, `BREVO_API_KEY`, `TWILIO_API_KEY`, `IMAGES_ACCESS_KEY` etc.

5. **Run the App**

   ```bash
   python app.py
   ```

## Security Measures

* **JWT Authentication**: Authorize users securely via signed tokens
* **Redis Rate Limiting**: Prevents OTP/email abuse (max 3/hour)
* **Server-side Validation**: Protect against SQL injections and spoofed requests
* **Protected Routes**: Admin/User dashboards are accessible only post-authentication.


## Why JavaScript

JavaScript enhances UX by:
* Validating forms on the frontend before backend submission
* Reducing unnecessary server load
* Enabling dynamic DOM changes without full page reload
* Sending OTP/email verification requests asynchronously.


## Development Approach

1. **Authentication First**: Built secure signup/login with email OTP and JWT tokens.
2. **Admin Dashboard**: Focused on managing lots, slots, users, payments.
3. **User Dashboard**: Implemented user-friendly features like booking, charts, history.
4. **Visual UI**: Added charts, dynamic images, and pop-ups for rich UX.
5. **Modular Structure**: Routes separated using Flask Blueprints for scalability.

---

> This project demonstrates a real-world application of modern web technologies. It balances backend logic, frontend interactivity, and data security, making it a comprehensive full-stack application under the MAD-1 curriculum.
