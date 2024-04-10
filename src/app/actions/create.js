"use server";

import { client, connectClient } from "@/lib/db";

export async function createBook(formData) {
    const { title, rating, author, blurb } = Object.fromEntries(formData);

    // create book id
    const id = Date.now();

    // Ensure the Redis client is connected
    await connectClient();

    try {
        // check the number of clients
        const info = await client.info("clients");
        const connectedClients = info.match(/connected_clients:(\d+)/i)[1];

        if (connectedClients >= 27) {
            await client.quit();
            return { error: "Too many clients connected. Try again later." };
        }

        // add book to sorted set
        const uniqueId = await client.zAdd(
            "books",
            {
                value: title,
                score: id,
            },
            { NX: true }
        );

        if (!uniqueId) {
            return { error: "Book already exists" };
        }

        // save new hash for the book
        await client.hSet(`books:${id}`, {
            title,
            rating,
            author,
            blurb,
        });
    } finally {
        // Ensure the Redis client is disconnected
        await client.disconnect();
    }
}
