import { Pool, QueryResult } from "pg"

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT ?? "5432"),
});

export default {
    async query(text: string, params: any[], callback?: (err: Error, result: QueryResult<any>) => void) {
        let client;
        try {
            client = await pool.connect();
            if (callback) {
                client.query(text, params, callback);
            } else {
                client.query(text, params);
            }
        } catch (e) {
            console.error(`query error: ${e}`);
        }
        finally {
            if (client) {
                client.release();
            }
        }
    }
}