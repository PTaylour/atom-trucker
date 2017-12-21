'use babel'
import { BufferedProcess } from 'atom'
import { join, dirname } from 'path'

const TRUCKER_PATH = join(__dirname, '../node_modules/.bin/trucker')

const getProjectWorkingDirectory = () => dirname(getPathOfActiveFile())

export default (initialPath, newPath) => {
    console.log('Trucker was toggled!', initialPath, newPath)

    const command = TRUCKER_PATH
    const args = [
        '--scope',
        getProjectWorkingDirectory(),
        '--dry-run',
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
                resolve(standardOut.join('\n'))
            }
            reject(standardError.join('\n'))
        }

        const process = new BufferedProcess({
            command,
            args,
            stdout,
            stderr,
            exit,
        })
        process.start()
        console.log(process, 'process')
    })
        .then(output =>
            atom.notifications.addSuccess('Trucking complete', {
                dismissable: true,
                description: output,
            })
        )
        .catch(errOut =>
            atom.notifications.addError('Error Trucking', {
                description: errOut,
            })
        )
}
