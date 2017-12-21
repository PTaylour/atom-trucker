'use babel'

import Dialog from './Dialog'

export default class MoveDialogView extends Dialog {
    constructor(initialPath) {
        super({
            initialPath: atom.project.relativize(initialPath),
            select: false,
            cursorPosition: str => str.lastIndexOf('/') + 1,
            prompt: 'Enter the new path for the file',
            iconClass: 'icon-arrow-right',
        })
        this.initialPath = initialPath
    }

    onConfirm(newPath) {
        console.log('moving to', newPath)

        console.log('asdf', this.initialPath, newPath)
        if (this.initialPath === newPath) {
            this.close()
            return
        }

        if (!this.isNewPathValid(newPath)) {
            this.showError(`'${newPath}' already exists.`)
            return
        }

        console.log('now moving')

        try {
            console.log('closing')
            this.close()
        } catch (error) {
            this.showError(`${error.message}`)
        }
    }

    isNewPathValid(newPath) {
        try {
            oldStat = fs.statSync(this.initialPath)
            newStat = fs.statSync(newPath)

            // New path exists so check if it points to the same file as the initial
            // path to see if the case of the file name is being changed on a on a
            // case insensitive filesystem.
            return (
                this.initialPath.toLowerCase() === newPath.toLowerCase() &&
                oldStat.dev === newStat.dev &&
                oldStat.ino === newStat.ino
            )
        } catch (_) {
            return true // new path does not exist so it is valid
        }
    }
}
