'use babel'

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const {
    TextEditor,
    CompositeDisposable,
    Disposable,
    Emitter,
    Range,
    Point,
} = require('atom')
const path = require('path')

const getFullExtension = filePath => {
    let fullExtension = ''
    let extension = path.extname(filePath)
    while (extension) {
        fullExtension = extension + fullExtension
        filePath = path.basename(filePath, extension)
        extension = path.extname(filePath)
    }
    return fullExtension
}

export default class Dialog {
    constructor(param) {
        if (param == null) {
            param = {}
        }
        const { initialPath, select, iconClass, prompt, cursorPosition } = param
        this.emitter = new Emitter()
        this.disposables = new CompositeDisposable()

        this.element = document.createElement('div')
        this.element.classList.add('trucker-dialog')

        this.promptText = document.createElement('label')
        this.promptText.classList.add('icon')
        if (iconClass) {
            this.promptText.classList.add(iconClass)
        }
        this.promptText.textContent = prompt
        this.element.appendChild(this.promptText)

        this.miniEditor = new TextEditor({ mini: true })
        const blurHandler = () => {
            if (document.hasFocus()) {
                return this.close()
            }
        }
        this.miniEditor.element.addEventListener('blur', blurHandler)
        this.disposables.add(
            new Disposable(() =>
                this.miniEditor.element.removeEventListener('blur', blurHandler)
            )
        )
        this.disposables.add(
            this.miniEditor.onDidChange(() => this.showError())
        )
        this.element.appendChild(this.miniEditor.element)

        this.errorMessage = document.createElement('div')
        this.errorMessage.classList.add('error-message')
        this.element.appendChild(this.errorMessage)

        atom.commands.add(this.element, {
            'core:confirm': () => this.onConfirm(this.miniEditor.getText()),
            'core:cancel': () => this.cancel(),
        })

        this.miniEditor.setText(initialPath)

        if (select) {
            let selectionEnd
            const extension = getFullExtension(initialPath)
            const baseName = path.basename(initialPath)
            const selectionStart = initialPath.length - baseName.length
            if (baseName === extension) {
                selectionEnd = initialPath.length
            } else {
                selectionEnd = initialPath.length - extension.length
            }
            this.miniEditor.setSelectedBufferRange(
                Range(Point(0, selectionStart), Point(0, selectionEnd))
            )
        }

        if (cursorPosition) {
            this.miniEditor.setCursorBufferPosition(
                Point(0, cursorPosition(this.miniEditor.getText()))
            )
        }
    }

    attach() {
        this.panel = atom.workspace.addModalPanel({ item: this })
        this.miniEditor.element.focus()
        return this.miniEditor.scrollToCursorPosition()
    }

    close() {
        const { panel } = this
        this.panel = null
        if (panel != null) {
            panel.destroy()
        }
        this.emitter.dispose()
        this.disposables.dispose()
        this.miniEditor.destroy()
        const activePane = atom.workspace.getCenter().getActivePane()
        if (!activePane.isDestroyed()) {
            return activePane.activate()
        }
    }

    cancel() {
        this.close()
        return __guard__(document.querySelector('.tree-view'), x => x.focus())
    }

    isVisible() {
        return !!this.panel && this.panel.isVisible()
    }

    showError(message) {
        if (message == null) {
            message = ''
        }
        this.errorMessage.textContent = message
        if (message) {
            this.element.classList.add('error')
            return window.setTimeout(
                () => this.element.classList.remove('error'),
                300
            )
        }
    }
}
function __guard__(value, transform) {
    return typeof value !== 'undefined' && value !== null
        ? transform(value)
        : undefined
}
