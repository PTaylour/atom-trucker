'use babel'
import MoveDialogView from './MoveDialogView'
import move from './move'
import parseMenuItem from './parseMenuItem'
import { CompositeDisposable } from 'atom'

function getPathOfActiveFile() {
    const editor = atom.workspace.getActiveTextEditor()
    return editor.getPath()
}

const doMove = (initialPath, ...args) =>
    move(initialPath, ...args)
        .then(({ output, newPath }) =>
            atom.notifications.addSuccess('Trucking complete', {
                dismissable: true,
                description: output,
                buttons: [
                    {
                        text: 'Revert',
                        onDidClick: () => doMove(newPath, initialPath), // reverse arguments
                    },
                ],
            })
        )
        .catch(({ output }) =>
            atom.notifications.addError('Error Trucking', {
                description: output,
            })
        )

export default {
    dialog: null,
    subscriptions: null,

    activate() {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable()

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'trucker:move': event => {
                    const targetPath = parseMenuItem(event.target)
                    this.showMoveDialog(
                        targetPath ? () => targetPath : getPathOfActiveFile
                    )
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

    showMoveDialog(getOriginalPathOfFile) {
        this.dialog = new MoveDialogView(getOriginalPathOfFile(), doMove, {
            willMove: ({ initialPath, newPath }) =>
                console.debug('will-move-entry', initialPath, newPath),
            onMove: ({ initialPath, newPath }) =>
                console.debug('entry-moved', initialPath, newPath),
            onMoveFailed: ({ initialPath, newPath }) =>
                console.debug('move-entry-fail', initialPath, newPath),
        })
        this.dialog.attach()
    },
}
