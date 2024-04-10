"use server";

import { client } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createBook(formData) {
    const { title, rating, author, blurb } = Object.fromEntries(formData);

    // create book id
    const id = Date.now();

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
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}
