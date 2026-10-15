# StudentHub frontend

React/TypeScript/Vite/Tailwind interface preserving the supplied Stitch design. Follow the [root README](../README.md) for Flask, MySQL, environment configuration and browser tests.

```sh
npm ci
cp .env.example .env
npm run dev
npm run lint
npm test
npm run build
```

Open http://localhost:3000. `VITE_API_BASE_URL` defaults to http://127.0.0.1:5001/api. No AI API key is required. Phone, coursework and historical information are not stored by the current schema. System States / UI contains labelled demonstration interactions only.
