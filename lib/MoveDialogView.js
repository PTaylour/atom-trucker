'use babel'

import path from 'path'
import fs from 'fs'
import Dialog from './Dialog'

export default class MoveDialogView extends Dialog {
    constructor(initialPath, move, { onMove, willMove, onMoveFailed }) {
        super({
            initialPath: atom.project.relativize(initialPath),
            select: false,
            cursorPosition: str => str.lastIndexOf('/') + 1,
            prompt: 'Enter the new path for the file',
            iconClass: 'icon-arrow-right',
        })
        this.initialPath = initialPath
        this.move = move
        this.onMove = onMove
        this.willMove = willMove
        this.onMoveFailed = onMoveFailed
    }

    onConfirm(_newPath) {
        let newPath = _newPath.replace(/\s+$/, '') // replace trailing whitespace
        if (!path.isAbsolute(newPath)) {
            const [rootPath] = atom.project.relativizePath(this.initialPath)
            newPath = path.join(rootPath, newPath)
        }

        if (this.initialPath === newPath) {
            this.close()
            return
        }

        if (!this.isNewPathValid(newPath)) {
            this.showError(`'${newPath}' already exists.`)
            return
        }

        try {
            this.willMove({ initialPath: this.initialPath, newPath })
            this.move(this.initialPath, newPath).then(() => {
                this.onMove({ initialPath: this.initialPath, newPath })
                this.close()
            })
        } catch (error) {
            this.showError(`${error.message}`)
            this.onMoveFailed({ initialPath: this.initialPath, newPath })
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
