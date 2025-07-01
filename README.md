# Smart Ride Backend

A Node.js backend for a ride-hailing platform supporting drivers, passengers, chat, group rides, and vehicle onboarding. Built with Express, MongoDB, and modular service architecture.

---

## What This Project Does

This backend powers a smart ride-hailing platform with:

- **Driver onboarding and vehicle registration** (including support for tourbus and group rides)
- **Passenger onboarding and authentication**
- **Ride creation, searching, and management** (pending, offered, accepted, rejected, completed, cancelled, expired)
- **Group ride logic** (especially for tourbus drivers)
- **Real-time chat and group chat** between drivers and passengers
- **OTP-based phone verification**
- **File uploads** for driver documents and profile images
- **Robust validation and error handling**
- **Logging and debugging utilities**

---

## Key Implementation Details

### 1. Driver & Vehicle Onboarding

- Drivers register and provide vehicle details (type, brand, model, number plate, color, etc.)
- Vehicle types supported: `mini car`, `ac car`, `bike`, `auto`, `tourbus`
- Tourbus drivers are handled specially for group rides

### 2. Ride Management

- Drivers fetch available rides based on their vehicle type
- For `tourbus` drivers, all group rides are shown (no group filter for others)
- Rides can be accepted, rejected, cancelled, or completed
- Ride status transitions are strictly validated

### 3. Group Rides

- Group rides are supported for tourbus drivers
- Group rides require a `groupAdmin` and `isGroupRide: true`
- Non-tourbus drivers see only non-group rides

### 4. Chat System

- Real-time chat between drivers and passengers
- Group chat for group rides
- Socket event validation using Joi schemas

### 5. Validation & Error Handling

- All API endpoints use Joi schemas for request validation
- Centralized error handling with custom `AppError` utility
- Consistent error responses for client and server errors

### 6. File Uploads

- Drivers can upload profile images and vehicle documents
- Uploaded files are stored in organized public folders

### 7. OTP Verification

- OTP service for phone number verification during onboarding
- Secure and time-limited OTP codes

### 8. Logging

- Application logs for debugging and monitoring
- Errors are logged with stack traces and timestamps

---

## Project Structure

```
smart-ride-backend/
├── public/                # Static assets (documents, driver-assets, profile-images)
├── src/
│   ├── api/
│   │   ├── controllers/   # Route controllers (chat, driver, passenger)
│   │   ├── routes/        # API route definitions


│   │── config/        # Configuration files (db, socket, twillio)
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

## Example Use Cases

- **Tourbus Driver**: Registers, uploads documents, and sees all group rides available for tourbus. Can accept, reject, or complete group rides.
- **Passenger**: Registers, books a ride (individual or group), chats with driver, and receives OTP for verification.
- **Driver (non-tourbus)**: Registers, uploads vehicle details, and sees only non-group rides matching their vehicle type.

## Technologies Used

- Node.js, Express.js
- MongoDB (Mongoose ODM)
- Joi (validation)
- Socket.io (real-time chat)
- Multer (file uploads)
- Twilio (OTP service)
- Winston (logging)

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
