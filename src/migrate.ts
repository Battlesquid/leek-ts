import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getDatabase, getPgConnection } from "./db";

(async () => {
    const db = await getDatabase();
    const connection = await getPgConnection();
    await migrate(db, { migrationsFolder: "./drizzle" });
    await connection.end();
})();
