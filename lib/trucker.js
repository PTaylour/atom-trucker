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

export default {
    dialog: null,
    subscriptions: null,

    activate() {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable()

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'trucker:move': () => this.showMoveDialog(),
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

    showMoveDialog() {
        this.dialog = new MoveDialogView(getPathOfActiveFile(), {
            willMove: ({ initialPath, newPath }) =>
                emitter.emit('will-move-entry', { initialPath, newPath }),
            onMove: ({ initialPath, newPath }) =>
                emitter.emit('entry-moved', { initialPath, newPath }),
            onMoveFailed: ({ initialPath, newPath }) =>
                emitter.emit('move-entry-failed', { initialPath, newPath }),
        })
        this.dialog.attach()
    },

    move() {
        console.log(
            'Trucker was toggled!',
            getPathOfActiveFile(),
            getPathOfActiveFile() + '-moved'
        )

        const command = TRUCKER_PATH
        const args = [
            '--scope',
            getProjectWorkingDirectory(),
            '--dry-run',
            getPathOfActiveFile(),
            getPathOfActiveFile() + '-moved',
        ]
        const stdout = output => console.log(output)
        const stderr = output => console.error(output)
        const exit = code => console.log(`ps -ef exited with ${code}`)
        const process = new BufferedProcess({
            command,
            args,
            stdout,
            stderr,
            exit,
        })
        process.start()
        console.log(process, 'process')
        atom.notifications.addSuccess('Toggled!')
    },
}
