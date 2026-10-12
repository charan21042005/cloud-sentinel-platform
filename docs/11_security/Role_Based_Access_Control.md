# Cloud Sentinel role based access control

## Roles and implemented permissions

| Role | Read incidents and telemetry | Acknowledge or resolve incidents | Inject chaos | Manage users |
| --- | --- | --- | --- | --- |
| Viewer | Yes | No | No | No |
| Operator | Yes | Yes | No | No |
| Admin | Yes | Yes | Yes | Yes |

All three roles can read their own profile at `GET /api/v1/users/me`. The user list,
user detail, account creation, and role update endpoints are admin-only. Public account
registration at `/auth/register` always assigns `viewer`; a submitted `role` field is
ignored and cannot grant privileges. Password hashes are never part of the user response
schema.

The backend loads the account and current role from the database on each authenticated
request. Frontend role checks only control navigation and presentation. REST requests
without a valid active account receive `401`; a valid account without the required role
receives `403`. WebSocket incident and telemetry subscriptions also require an unexpired
token belonging to an active database user; anonymous fallback access has been removed.

Authorization is mapped to routes that exist today:

- Any authenticated role can read `GET /api/v1/incidents/` and
  `GET /api/v1/telemetry/system/live`.
- Operators and admins can call the incident acknowledge and resolve routes and the
  authenticated Alertmanager webhook.
- Only admins can call `/api/v1/chaos/inject` and the user-management routes under
  `/api/v1/users/`.
- Public health routes and the Prometheus scrape endpoint remain infrastructure
  endpoints outside interactive user RBAC. Their network exposure must be controlled
  by the deployment environment.

The webhook now requires a bearer token for an active operator or administrator. A
native Alertmanager sender does not obtain a user token automatically; connect it only
through an approved authenticated integration. No such token broker or adapter is
implemented here.

## First administrator

Ordinary users register in the frontend at `/auth/register` (API:
`POST /api/v1/auth/register`) and receive viewer access. There is no public administrator
setup endpoint. Create the first local administrator from the API
gateway directory after selecting the intended development database and applying the
reviewed schema migration:

```powershell
cd services/api-gateway
.\venv\Scripts\python.exe -m alembic upgrade head
.\venv\Scripts\python.exe -m app.cli.bootstrap_admin
```

The CLI prompts for username and email and uses a hidden password prompt twice. It
hashes the password with the existing bcrypt implementation, refuses to proceed if an
administrator or duplicate username/email already exists, and is not exposed as an API
route. It requires an explicitly configured `ENVIRONMENT=development`, with no
conflicting `.env` and process values. The resolved database URL must use the project's
async PostgreSQL driver, database `cloud_sentinel`, port `5432`, and a host that resolves
only to loopback (`localhost`, `127.0.0.1`, or `::1`). The CLI rejects the Compose service
hostname because it cannot prove that the service DNS target is local; when running the
CLI on the host, configure its database URL to use the Compose-published loopback port.
Verify the selected local database before running either command. Production bootstrap
needs a separately reviewed, approved operational procedure.

After bootstrap, sign in at `/auth/login`. Admins can create accounts and choose the
`viewer`, `operator`, or `admin` role at `/dashboard/users`. Role changes require
confirmation. The API rejects demotion of the last active administrator. Passwords are
only accepted at account creation; existing passwords cannot be retrieved or managed
from this page. The existing incident page has no working manual alert injector control;
chaos injection is available only through its admin-protected API.

## Migration and local verification

Migration `c4d62ae98510` converts the previous `analyst` role to `operator` and adds a
database constraint allowing only `admin`, `operator`, and `viewer`. Its downgrade
removes the constraint but leaves normalized role values in place. Review the target
database for any other legacy role values and follow the backup policy before applying
it; this change was not applied as part of the code implementation.

Run focused tests from `services/api-gateway` with the project virtual environment:

```powershell
.\venv\Scripts\python.exe -m pytest tests/test_auth.py tests/test_users.py tests/test_incidents.py -q
```

The tests use an in-memory SQLite database and synthetic accounts. They cover viewer
registration, attempted role escalation, `401`/`403` behavior, operator and admin
permissions, password hash response safety, last-admin protection, CLI bootstrap
refusal, and authenticated WebSocket handshakes. Frontend tests cover the admin user
navigation and management page with mocked API responses.

## Known security follow-ups

This work does not replace the existing browser token storage or change the API's
current CORS policy. The JWT remains in `localStorage`, CORS is currently broad, and
public registration has no rate limiting; review these before exposing the application
beyond a trusted local environment. The browser supplies the WebSocket token in its
query string, so access logs must redact query strings. The Prometheus endpoint also
relies on deployment network controls rather than user RBAC.
