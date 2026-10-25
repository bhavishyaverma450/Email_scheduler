
# Email Scheduler

A web application for importing email recipients, composing messages, and scheduling emails through a dashboard.

## Screenshots

### 1. Email Scheduler Dashboard
<img width="1918" height="1020" alt="image" src="https://github.com/user-attachments/assets/148f00df-aa9c-4f87-b719-28cd5d3d9b46" />


### 2. Compose and Schedule Emails
<img width="1917" height="1018" alt="image" src="https://github.com/user-attachments/assets/fb3b43a3-7151-4fd8-938f-f86f401bb3dc" />


### 3. Source Code and Project Structure
<img width="1918" height="1078" alt="image" src="https://github.com/user-attachments/assets/2cf79dd0-0fda-4680-a194-7d6dad06a1bf" />


## Features

- Dashboard to view scheduled email entries.
- Compose emails with recipients, subject, and message body.
- Import recipient lists from CSV files.
- Configure email scheduling options.
- React frontend integrated with an Express backend.
- BullMQ and Redis dependencies for queue-related functionality.

> Note: Actual email delivery and queue processing should be considered complete only after they have been implemented and tested.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- Papa Parse
- Lucide React

**Backend**
- Node.js
- Express.js
- TypeScript
- BullMQ
- Redis (ioredis)
- Prisma

## Project Structure

```text
Email_scheduler/
├── backend/
│   ├── config/
│   ├── queues/
│   ├── routes/
│   │   ├── emailRoutes.ts
│   │   └── health.routes.ts
│   ├── services/
│   ├── workers/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   ├── package.json
│   └── ...
├── screenshots/
│   ├── frontend-1.png
│   ├── frontend-2.png
│   └── code-structure.png
├── .gitignore
└── README.md
```


## Current Implementation Status

- The frontend currently displays predefined/demo data for demonstration purposes.
- Email entries shown in the dashboard may be sample records and do not necessarily represent emails stored in a database or successfully delivered.
- The scheduling interface is being integrated with the backend.
- Actual email delivery, persistent storage, and background job processing depend on the implemented and tested backend functionality.

The project is under active development, and these features will be completed and verified as development progresses.


## Getting Started

### Prerequisites

- Node.js and npm
- Redis, if required by the queue implementation

### 1. Clone the Repository

```bash
git clone https://github.com/bhavishyaverma450/Email_scheduler.git
cd Email_scheduler
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`. Never commit real credentials or API keys.

### 3. Start the Backend

From the `backend` directory, run:

```bash
npx tsx server.js
```

The backend should start on the port configured in `server.js`.

### 4. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API

The frontend communicates with the backend to submit email scheduling requests. Refer to `backend/routes/emailRoutes.ts` for the currently implemented endpoints.

## Security

- Do not commit `.env` files or API credentials.
- Keep `node_modules/` and build output out of Git.
- Use `.env.example` to document required environment variable names without real secrets.

## Current Status

This project is under development. Verify backend functionality, scheduling persistence, queue processing, and actual email delivery before using it in production.

## Author

**Bhavishya Verma**

GitHub: [@bhavishyaverma450](https://github.com/bhavishyaverma450)
