import { Collection } from "discord.js";
import path from "path";
import { loadDir } from ".";
import {
    Command,
    CommandExec,
    CommandStructure,
    GroupCommandBase,
    ParentCommandBase,
    Subcommand
} from "../types/CommandTypes";

const loadSubcmdGroups = async (subcmdDir: string, parentBase: ParentCommandBase, groups: string[], cmds: Collection<string, CommandStructure>, execs: Collection<string, CommandExec>) => {
    for (const group of groups) {
        const dirpath = path.resolve(__dirname, `${subcmdDir}/${group}`);
        const directory = await loadDir(dirpath)

        const base: GroupCommandBase = (await import(`${dirpath}/base`)).default

        const groupCmds: Subcommand[] = (await Promise.all(
            directory.files
                .filter(f => !f.startsWith('base'))
                .map(s => import(`${dirpath}/${s}`))
        )).map(f => f.default);

        groupCmds.forEach(groupCmd => {
            base.structure.addSubcommand(groupCmd.structure)
            const name = `${parentBase.structure.name}_${group}_${groupCmd.structure.name}`
            execs.set(name, groupCmd.execute)
        })

        parentBase.structure.addSubcommandGroup(base.structure)
    }

    cmds.set(parentBase.structure.name, parentBase.structure)
}

const loadSubcmds = async (dir: string, cmdNames: string[], cmds: Collection<string, CommandStructure>, execs: Collection<string, CommandExec>) => {
    for (const cmd of cmdNames) {
        const dirpath = path.resolve(__dirname, `${dir}/${cmd}`)
        const directory = await loadDir(dirpath)

        const base: Command = (await import(`${dirpath}/base`)).default

        const subcmds: Subcommand[] = (await Promise.all(
            directory.files
                .filter(f => !f.startsWith('base'))
                .map(s => import(`${dirpath}/${s}`))
        )).map(f => f.default);

        subcmds.forEach(subcmd => {
            base.structure.addSubcommand(subcmd.structure)
            const name = `${base.structure.name}_${subcmd.structure.name}`;
            execs.set(name, subcmd.execute)
        })

        await loadSubcmdGroups(dirpath, base, directory.dirs, cmds, execs);
    }
}

const loadSlashCommands = async (dir: string, cmds: Collection<string, CommandStructure>, execs: Collection<string, CommandExec>) => {
    const dirpath = path.resolve(__dirname, `${dir}/slash`)
    const directory = await loadDir(dirpath)

    const cmdFiles: Command[] = (await Promise.all(
        directory.files.map(f => import(`${dirpath}/${f}`))
    )).map(f => f.default);

    cmdFiles.forEach(cmd => {
        cmds.set(cmd.structure.name, cmd.structure)
        execs.set(cmd.structure.name, cmd.execute)
    })

    await loadSubcmds(dirpath, directory.dirs, cmds, execs)
}

export default loadSlashCommands