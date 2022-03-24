import fs from "fs/promises";

export type File = {
    name: string;
    path: string;
    ext: string;
};

export const loadDir = async (dir: string) => {
    const directory = await fs.readdir(dir, { withFileTypes: true });

    const dirs = directory.filter((i) => i.isDirectory()).map((d) => d.name);

    const files = directory.filter((i) => i.isFile()).map((f) => f.name);

    return { dirs, files };
};

export const loadDirFull = async (dir: string): Promise<File[]> => {
    const files = [];
    const folder = await loadDir(dir);

    files.push(
        ...folder.files.map((f) => ({
            name: f.split(".")[0],
            path: `${dir}/${f}`,
            ext: f.split(".")[1],
        }))
    );

    for (const innerDir of folder.dirs) {
        const f = await loadDirFull(`${dir}/${innerDir}`);
        files.push(...f);
    }

    return files;
};

export * from "./interactionLoader";
export * from "./eventLoader";
export * from "./functionLoader";
