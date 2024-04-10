import { createClient } from "redis";

const client = createClient({
    password: process.env.REDIS_PW,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

client.on("error", (err) => console.log("Redis Client Error", err));

let connectPromise;

const connectClient = () => {
    if (!connectPromise) {
        // Ensure that we only attempt to connect once
        connectPromise = client.connect().catch((err) => {
            console.log("Redis connection error: ", err);
            connectPromise = null; // Reset promise to allow retry on failure
        });
    }
    return connectPromise;
};

// Immediately invoke the connect logic to ensure the client attempts to connect on startup
connectClient();

export { client, connectClient };
