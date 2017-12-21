'use babel'

import Dialog from './Dialog'

export default class MoveDialogView extends Dialog {
    constructor(initialPath) {
        super({
            initialPath,
            select: false,
            cursorPosition: str => str.lastIndexOf('/') + 1,
            prompt: 'Enter the new path for the file',
            iconClass: 'icon-arrow-right',
        })
    }
}
