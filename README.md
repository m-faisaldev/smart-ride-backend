# Smart Ride Backend

A Node.js backend for a ride-hailing platform supporting drivers, passengers, chat, group rides, and vehicle onboarding. Built with Express, MongoDB, and modular service architecture.

## Features

- **Driver & Passenger Authentication**: Secure login, registration, and onboarding for both drivers and passengers.
- **Vehicle Onboarding**: Drivers can register and update vehicle details (supports mini car, ac car, bike, auto, tourbus).
- **Ride Management**: Book, accept, reject, and manage rides for both individual and group rides.
- **Group Rides**: Special support for group rides, especially for tourbus drivers.
- **Chat System**: Real-time chat between drivers and passengers, including group chat.
- **OTP Verification**: Secure phone number verification using OTP.
- **File Uploads**: Upload and manage driver documents, profile images, and vehicle assets.
- **Validation & Error Handling**: Robust request validation and centralized error handling.
- **Logging**: Application logging for debugging and monitoring.

## Project Structure

```
smart-ride-backend/
├── public/                # Static assets (documents, driver-assets, profile-images)
├── src/
│   ├── api/
│   │   ├── controllers/   # Route controllers (chat, driver, passenger)
│   │   ├── routes/        # API route definitions
│   │   └── config/        # Configuration files (db, socket, twillio)
│   ├── middlewares/       # Express middlewares (auth, validation, upload, etc.)
│   ├── models/            # Mongoose models (driver, passenger, ride, chat, etc.)
│   ├── services/          # Business logic (driver, passenger, chat, OTP, etc.)
│   ├── utils/             # Utility functions (AppError, logger, etc.)
│   └── validations/       # Joi validation schemas
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## API Overview

### Authentication

- `/api/v1/driver/auth/` — Driver login, registration, onboarding
- `/api/v1/passenger/auth/` — Passenger login, registration

### Rides

- `/api/v1/driver/rides/available/` — Get available rides for drivers (supports group rides for tourbus)
- `/api/v1/driver/rides/history/` — Driver ride history
- `/api/v1/passenger/rides/` — Passenger ride booking and management

### Chat

- `/api/v1/chat/` — Real-time chat and group chat endpoints

### Uploads

- `/api/v1/driver/upload/` — Driver document and image uploads

## Validation

- All endpoints use Joi schemas for request validation (see `src/validations/`).

## Getting Started

1. **Install dependencies**
   ```sh
   pnpm install
   ```
2. **Configure environment**
   - Set up MongoDB and Twilio credentials in environment/config files.
3. **Run the server**
   ```sh
   node src/server.js
   ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
