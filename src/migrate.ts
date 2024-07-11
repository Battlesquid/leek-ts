import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDatabase, getPgConnection } from "./db";

(async () => {
    console.info("Getting database");
    const db = await getDatabase();
    console.info("Getting pg connection");
    const connection = await getPgConnection();
    console.info("Running migration");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.info("Closing pg connection");
    await connection.end();
})();
