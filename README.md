# EstateNest — MERN Real Estate Platform

> Find a place that feels like home.

**Live demo:** https://estatenest-kappa.vercel.app
**API:** https://estatenest-api-1m8i.onrender.com/api/properties (free Render instance, the first request after idle can take ~50s)

## About

EstateNest is a full-stack real-estate marketplace built with MongoDB, Express, React and Node as part of the Dev Weekends Fellowship (task: _MERN Hotel Real Estate_).

Buyers can search homes for sale and rent, contact the listing agent, schedule property visits and leave reviews. Agents can publish and manage listings, maintain a public agent profile, answer inquiries and confirm visits. Each role gets its own protected dashboard.

All listings, agents and agencies in the seed data are fictional.

## Features

- Registration and login with bcrypt-hashed passwords
- JWT authentication (7-day token sent as a `Bearer` header)
- Two roles: **buyer** (default) and **agent**, enforced on the server
- Protected React routes with redirect back after login, and expired-session handling
- Property search by city, listing type, property type, price range and bedrooms
- Sorting by newest, price low → high, price high → low
- Property CRUD for agents, with ownership checks
- Public agent profiles with listing counts
- Inquiries (buyer → agent) with status tracking: new → contacted → closed
- Reviews (1–5 stars, one per buyer per property)
- Visit appointments: requested → confirmed → completed / cancelled
- Buyer and agent dashboards
- Responsive layout from 375px phones to 1440px desktops

## Five CRUD Resources

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Properties | ✅ | ✅ | ✅ | ✅ |
| Agent Profiles | ✅ | ✅ | ✅ | ✅ |
| Inquiries | ✅ | ✅ | ✅ | ✅ |
| Reviews | ✅ | ✅ | ✅ | ✅ |
| Appointments | ✅ | ✅ | ✅ | ✅ |

| Resource | Route file | Controller | Model |
|---|---|---|---|
| Properties | `server/src/routes/propertyRoutes.js` | `propertyController.js` | `Property.js` |
| Agent Profiles | `server/src/routes/agentRoutes.js` | `agentController.js` | `Agent.js` |
| Inquiries | `server/src/routes/inquiryRoutes.js` | `inquiryController.js` | `Inquiry.js` |
| Reviews | `server/src/routes/reviewRoutes.js` | `reviewController.js` | `Review.js` |
| Appointments | `server/src/routes/appointmentRoutes.js` | `appointmentController.js` | `Appointment.js` |

## Auth Flow

```text
Register/Login
      ↓
Password hashed/verified (bcryptjs)
      ↓
JWT issued  { userId, role }, expires in 7d
      ↓
React stores JWT (localStorage)
      ↓
Authorization: Bearer <token>   (added by client/src/api/api.js)
      ↓
Auth middleware (verifies token, loads user into req.user)
      ↓
Role middleware (where needed) → ownership-checked query → protected resource
```

If a request comes back `401` while a token is stored, the client clears the session and sends the user to the login page with a "session expired" message.

## Tech Stack

**Frontend:** React, Vite, React Router, Fetch API, plain CSS
**Backend:** Node.js, Express 5, MongoDB, Mongoose, jsonwebtoken, bcryptjs, cors, dotenv
**Hosting:** Vercel (client), Render (API), MongoDB Atlas (database)

## Roles and Permissions

| Action | Buyer | Agent |
|---|---|---|
| Browse properties and agents | ✅ | ✅ |
| Create / edit / delete properties | ❌ (403) | ✅ own only |
| Create / edit / delete agent profile | ❌ (403) | ✅ own only |
| Send inquiry | ✅ | ❌ (403) |
| Edit inquiry message / delete inquiry | ✅ own only | ❌ |
| Update inquiry status | ❌ | ✅ for own properties |
| Write review | ✅ | ❌ (403) |
| Edit / delete review | ✅ own only | — |
| Request visit | ✅ | ❌ (403) |
| Reschedule / cancel / delete visit | ✅ own only | ❌ (cannot delete) |
| Confirm / complete / cancel visit | ❌ | ✅ for own properties |

**Ownership rule:** IDs like `owner`, `buyer`, `agent` and `author` are never read from the request body. They come from `req.user` (the verified token) or from the property itself. Queries for edits and deletes always include the owner, e.g. `{ _id: id, owner: req.user._id }`, so another user's resource returns **404** instead of revealing that it exists.

## API Routes

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Logged in |

### Properties
| Method | Route | Access |
|---|---|---|
| GET | `/api/properties` | Public. Query: `city`, `propertyType`, `listingType`, `minPrice`, `maxPrice`, `bedrooms`, `sort` (`newest`, `price-low`, `price-high`), `featured`, `limit` |
| GET | `/api/properties/mine` | Agent |
| GET | `/api/properties/:id` | Public |
| POST | `/api/properties` | Agent |
| PUT | `/api/properties/:id` | Agent (owner) |
| DELETE | `/api/properties/:id` | Agent (owner), also removes the property's inquiries, reviews and visits |

### Agent Profiles
| Method | Route | Access |
|---|---|---|
| GET | `/api/agents` | Public |
| GET | `/api/agents/me` | Agent |
| GET | `/api/agents/:id` | Public (profile + listings) |
| POST | `/api/agents` | Agent (one profile per account) |
| PUT | `/api/agents/:id` | Agent (own profile) |
| DELETE | `/api/agents/:id` | Agent (own profile) |

### Inquiries
| Method | Route | Access |
|---|---|---|
| GET | `/api/inquiries` | Buyer (sent) / Agent (received) |
| GET | `/api/inquiries/:id` | Buyer or agent of that inquiry |
| POST | `/api/inquiries` | Buyer |
| PUT | `/api/inquiries/:id` | Buyer edits `message`/`phone`, agent edits `status` |
| DELETE | `/api/inquiries/:id` | Buyer who sent it |

### Reviews
| Method | Route | Access |
|---|---|---|
| GET | `/api/reviews?property=<id>` | Public |
| GET | `/api/reviews/mine` | Logged in |
| GET | `/api/reviews/:id` | Public |
| POST | `/api/reviews` | Buyer |
| PUT | `/api/reviews/:id` | Author |
| DELETE | `/api/reviews/:id` | Author |

### Appointments
| Method | Route | Access |
|---|---|---|
| GET | `/api/appointments` | Buyer (requested) / Agent (for own properties) |
| GET | `/api/appointments/:id` | Buyer or agent of that visit |
| POST | `/api/appointments` | Buyer |
| PUT | `/api/appointments/:id` | Buyer reschedules or cancels, agent sets `status` |
| DELETE | `/api/appointments/:id` | Buyer who requested it |

All errors use the same shape: `{ "message": "..." }`.

## Project Structure

```text
devweekends-mern-real-estate/
├── client/
│   ├── public/                  favicon + image placeholder
│   ├── src/
│   │   ├── api/api.js           single fetch helper (JWT header + error handling)
│   │   ├── context/             AuthContext (logged-in user, login/logout)
│   │   ├── components/          reusable UI (cards, forms, lists, navbar...)
│   │   │   └── dashboard/       buyer/agent dashboard sections
│   │   ├── pages/               one file per route
│   │   ├── styles/              base, layout and component CSS
│   │   └── utils/               formatting helpers and shared constants
│   ├── vercel.json              SPA rewrite so refreshing /dashboard works
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/         request handlers, one per resource
│   │   ├── middleware/          auth, role, error, not-found
│   │   ├── models/              Mongoose schemas
│   │   ├── routes/              Express routers
│   │   ├── seed/                demo data + seed script
│   │   ├── utils/               httpError, pickFields, participantFilter
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
└── README.md
```

## Local Setup

You need Node.js 20+ and a MongoDB database (local or Atlas).

Server:

```bash
cd server
npm install
cp .env.example .env    # then edit the values
npm run seed            # optional: demo agents, buyers, 12 properties, reviews
npm run dev
```

Client:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173.

### Environment Variables

Backend (`server/.env`):

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/estatenest
JWT_SECRET=replace_with_long_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Frontend (`client/.env`):

```text
VITE_API_URL=http://localhost:5000
```

`.env` files are git-ignored and never committed.

### Demo Accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Agent | `aarav.agent@example.com` | `password123` |
| Agent | `priya.agent@example.com` | `password123` |
| Agent | `kabir.agent@example.com` | `password123` |
| Buyer | `riya.buyer@example.com` | `password123` |
| Buyer | `dev.buyer@example.com` | `password123` |

Set `SEED_DEMO_PASSWORD` in `server/.env` before seeding to use a different password.

## Deployment

1. **MongoDB Atlas:** create a free cluster, a database user, allow network access, copy the connection string.
2. **Render (API):** new Web Service from the GitHub repo, root directory `server`, build `npm install`, start `npm start`. Environment: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.
3. **Vercel (client):** import the repo, root directory `client`, framework Vite. Environment: `VITE_API_URL=<Render URL>`.
4. Set `CLIENT_URL=<Vercel URL>` on Render (no trailing slash) and redeploy.
5. Run `npm run seed` once against the Atlas database (from your machine with the Atlas `MONGO_URI`, or from the Render shell).

## Known Limitations

- Images are added as URLs. There is no file upload.
- No pagination. The API returns at most 60 properties per search.
- Demo accounts share a public password, so anyone can log in and edit the demo listings.
- The free Render instance sleeps when idle, so the first request can be slow.
