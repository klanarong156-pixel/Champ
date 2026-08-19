# Dashboard Source

The Dashboard is implemented in the repository's existing React source under `client/`, because that is the configured frontend entrypoint and build target. This directory documents the logical Dashboard boundary without creating a second competing application.

The page is `client/src/pages/Home.tsx`, shared styling is in `client/src/index.css`, and all MQTT interaction remains in the Backend. The Browser receives state through the Backend HTTP API and SSE event stream. No MQTT host credentials or broker client are bundled into the Dashboard.
