'use babel'
import MoveDialogView from './MoveDialogView'
import move from './move'
import { CompositeDisposable, Emitter } from 'atom'

function getPathOfActiveFile() {
    const editor = atom.workspace.getActiveTextEditor()
    return editor.getPath()
}

const emitter = new Emitter()

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
                'trucker:treeViewMove': event => {
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

    showMoveDialog(getOriginalPathOfFile) {
        this.dialog = new MoveDialogView(
            getOriginalPathOfFile(),
            (...args) =>
                move(...args)
                    .then(({ output, newPath }) =>
                        atom.notifications.addSuccess('Trucking complete', {
                            dismissable: true,
                            description: output,
                            buttons: [
                                {
                                    text: 'Revert',
                                    onDidClick: () =>
                                        atom.notifications.addError(
                                            'Not Implemented yet :/' + newPath
                                        ),
                                },
                            ],
                        })
                    )
                    .catch(({ output }) =>
                        atom.notifications.addError('Error Trucking', {
                            description: output,
                        })
                    ),
            {
                willMove: ({ initialPath, newPath }) =>
                    emitter.emit('will-move-entry', { initialPath, newPath }),
                onMove: ({ initialPath, newPath }) =>
                    emitter.emit('entry-moved', { initialPath, newPath }),
                onMoveFailed: ({ initialPath, newPath }) =>
                    emitter.emit('move-entry-failed', { initialPath, newPath }),
            }
        )
        this.dialog.attach()
    },
}
