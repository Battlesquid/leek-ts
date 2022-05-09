import db from "#db/index";
import build from 'pino-abstract-transport';


export default async function (opts: any) {
    return build(async function (source) {
        for await (const obj of source) {
            try {
                db.query("INSERT INTO logs (timestamp, data) VALUES ($1, $2);", [obj.time, obj])
            } catch(e) {
                console.error("Failed to insert log");
                console.info(`Log Details: \n${obj}`);
            }
        }
    })
}