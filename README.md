# Fib Overkill

## The most over-engineered fibonacci calculator on the web

Really just an excuse to play around with new tech, including Next.js, FastApi, and Rust.

The UI requests the fibonacci value of a given index from the API. If the API has it cached, it'll return the value immediately. Otherwise, it'll send the index value to a multi-threaded Rust worker via a Redis queue, and tell the UI to start polling.

The Rust worker will compute the value and update the cache, to be picked up by the next poll request from the UI.

Fib Overkill uses docker to manage various components:

-   UI: Next.js in Typescript
-   API: FastApi in Python
-   Nginx: Web server
-   Worker: Rust
-   Queue: Redis

Run `make` to build and run the docker images
