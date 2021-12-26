import fs from "fs/promises";

export const loadDir = async (dir: string) => {
    const directory = await fs.readdir(dir, { withFileTypes: true })

    const dirs = directory
        .filter(i => i.isDirectory())
        .map(d => d.name);

    const files = directory
        .filter(i => i.isFile())
        .map(f => f.name);

    return { dirs, files }
}