'use babel'

import { join, dirname } from 'path'
import TruckerView from './trucker-view'
import DialogView from './dialog-view'
import { CompositeDisposable, BufferedProcess } from 'atom'

const TRUCKER_PATH = join(__dirname, '../node_modules/.bin/trucker')

function getPathOfActiveFile() {
    const editor = atom.workspace.getActiveTextEditor()
    return editor.getPath()
}

const getProjectWorkingDirectory = () => dirname(getPathOfActiveFile())

export default {
    truckerView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.truckerView = new TruckerView(state.truckerViewState)
        this.dialogView = new DialogView({
            initialPath: 'asdf',
            select: false,
            cursorPosition: str => str.lastIndexOf('/') + 1,
            prompt: 'Enter the new path for the file',
        })

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable()

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'trucker:move': () => this.toggleMoveDialog(),
            })
        )
    },

    deactivate() {
        this.dialogView.close()
        this.subscriptions.dispose()
        this.truckerView.destroy()
    },

    serialize() {
        return {
            truckerViewState: this.truckerView.serialize(),
        }
    },

    toggleMoveDialog() {
        return this.dialogView.isVisible()
            ? this.dialogView.close()
            : this.dialogView.attach()
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
        return this.modalPanel.isVisible()
            ? this.modalPanel.hide()
            : this.modalPanel.show()
    },
}
