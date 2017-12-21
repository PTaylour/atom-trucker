'use babel'

import { join, dirname } from 'path'
import MoveDialogView from './MoveDialogView'
import { CompositeDisposable, BufferedProcess, Emitter } from 'atom'

const TRUCKER_PATH = join(__dirname, '../node_modules/.bin/trucker')

function getPathOfActiveFile() {
    const editor = atom.workspace.getActiveTextEditor()
    return editor.getPath()
}

const emitter = new Emitter()

const getProjectWorkingDirectory = () => dirname(getPathOfActiveFile())

const move = (initialPath, newPath) => {
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

export default {
    dialog: null,
    subscriptions: null,

    activate() {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable()

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'trucker:move': () => this.showMoveDialog(getPathOfActiveFile),
                'trucker:moveTarget': event => {
                    console.log('asdf', event)
                    this.showMoveDialog(() => event.target.dataset.path)
                },
            })
        )
    },

    deactivate() {
        if (this.dialog) this.dialog.close()
        this.subscriptions.dispose()
    },

    serialize() {
        return {}
    },

    showMoveDialog(getPathOfFile) {
        this.dialog = new MoveDialogView(getPathOfFile(), move, {
            willMove: ({ initialPath, newPath }) =>
                emitter.emit('will-move-entry', { initialPath, newPath }),
            onMove: ({ initialPath, newPath }) =>
                emitter.emit('entry-moved', { initialPath, newPath }),
            onMoveFailed: ({ initialPath, newPath }) =>
                emitter.emit('move-entry-failed', { initialPath, newPath }),
        })
        this.dialog.attach()
    },
}
