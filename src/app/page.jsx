import { client, connectClient } from "@/lib/db";
import Link from "next/link";

const getBooks = async () => {
    // Ensure the Redis client is connected
    await connectClient();

    // check the number of clients
    const info = await client.info("clients");
    const connectedClients = info.match(/connected_clients:(\d+)/i)[1];

    if (connectedClients >= 27) {
        await client.quit();
        return [];
    }

    // get all books with their scores
    const results = await client.zRangeWithScores("books", 0, -1);

    // get hash for each book using pipeling
    const books = Promise.all(
        results.map((book) => client.hGetAll(`books:${book.score}`))
    );

    return books;
};

export default async function Home() {
    const books = await getBooks();

    return (
        <main>
            <nav className="flex justify-between">
                <h1 className="font-bold">Books on Redis!</h1>
                <Link href="/create" className="btn">
                    Add a new book
                </Link>
            </nav>

            {books.length === 0 ? (
                <p>No books found</p>
            ) : (
                books.map((book) => (
                    <div key={book.title} className="card">
                        <h2>{book.title}</h2>
                        <p>By {book.author}</p>
                        <p>{book.blurb}</p>
                        <p>Rating: {book.rating}</p>
                    </div>
                ))
            )}
        </main>
    );
}
