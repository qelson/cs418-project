# CS418 Authentication Portal

A retro Windows XP–styled secure access portal built for **CS418 Milestone 1**.

The application implements a full authentication workflow including registration, email verification, login, two-factor authentication, and a user dashboard.

## Features

- User registration
- Email verification
- Secure login
- Two-Factor Authentication (OTP)
- User dashboard
- Profile editing
- Password change functionality
- Retro Windows XP themed interface

## Tech Stack

Frontend
- React
- CSS

Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Project Structure

client/ → React frontend  
server/ → Node/Express backend  
models/ → MongoDB schemas  
routes/ → API routes  
middleware/ → authentication middleware  

## Running the Project

### 1. Install dependencies

Frontend

```
cd client
npm install
```

Backend

```
cd server
npm install
```

### 2. Configure environment variables

Create a `.env` file inside the **server** directory using `.env.example` as a template.

### 3. Start the backend

```
cd server
npm start
```

### 4. Start the frontend

```
cd client
npm start
```

The application will run at:

```
http://localhost:3000
```

## Authentication Flow

1. Register a new account  
2. Verify email  
3. Login with credentials  
4. Enter OTP verification code  
5. Access the user dashboard  

## Author

Quin Elson  
CS418 – Old Dominion University