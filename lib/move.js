'use babel'
import { BufferedProcess } from 'atom'
import { join } from 'path'

const TRUCKER_PATH = join(__dirname, '../node_modules/.bin/trucker')

const getProjectWorkingDirectory = fileName =>
    atom.project.getPaths().find(path => fileName.startsWith(path)) ||
    atom.project.getPaths()[0]

export default (initialPath, newPath) => {
    console.log(`moving ${initialPath} -> ${newPath}`)
    console.log(`setting scope to ${getProjectWorkingDirectory(newPath)}`)
    const command = TRUCKER_PATH
    const args = [
        '--scope',
        getProjectWorkingDirectory(newPath),
        initialPath,
        newPath,
    ]
    return new Promise((resolve, reject) => {
        let standardError = []
        let standardOut = []

        const stdout = output => console.log(output) || standardOut.push(output)
        const stderr = output =>
            console.error(output) || standardError.push(output)

        const exit = code => {
            if (code === 0) {
                resolve({ output: standardOut.join('\n'), newPath })
            }
            reject({ output: standardError.join('\n'), newPath })
        }

        const process = new BufferedProcess({
            command,
            args,
            stdout,
            stderr,
            exit,
        })
        process.start()
    })
}
