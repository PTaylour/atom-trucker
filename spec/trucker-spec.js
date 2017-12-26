'use babel'

import temp from 'temp'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Trucker', () => {
    let workspaceElement, activationPromise, editor

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace)
        activationPromise = atom.packages.activatePackage('trucker')
        editor = atom.workspace.buildTextEditor()
        editor.setText('Some text')
        spyOn(editor, 'getPath').andReturn('path/to/file.js')
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(editor)

        const directory = temp.mkdirSync()
        atom.project.setPaths([directory])
    })

    describe('when the trucker:move event is triggered', () => {
        xit('shows the dialog panel', () => {
            // Before the activation event the view is not on the DOM, and no panel
            // has been created
            expect(
                workspaceElement.querySelector('.trucker-dialog')
            ).not.toExist()

            // This is an activation event, triggering it will cause the package to be
            // activated.
            atom.commands.dispatch(workspaceElement, 'trucker:move')

            waitsForPromise(() => {
                return activationPromise
            })

            runs(() => {
                expect(
                    workspaceElement.querySelector('.trucker-dialog')
                ).toExist()

                let truckerElement = workspaceElement.querySelector(
                    '.trucker-dialog'
                )
                expect(truckerElement).toExist()

                let truckerPanel = atom.workspace.panelForItem(truckerElement)

                console.log(
                    atom.workspace,
                    truckerElement,
                    atom.workspace.panelForItem(truckerElement)
                )
                expect(truckerPanel.isVisible()).toBe(true)
            })
        })

        it('hides and shows the view', () => {
            // This test shows you an integration test testing at the view level.

            // Attaching the workspaceElement to the DOM is required to allow the
            // `toBeVisible()` matchers to work. Anything testing visibility or focus
            // requires that the workspaceElement is on the DOM. Tests that attach the
            // workspaceElement to the DOM are generally slower than those off DOM.
            jasmine.attachToDOM(workspaceElement)

            expect(
                workspaceElement.querySelector('.trucker-dialog')
            ).not.toExist()

            // This is an activation event, triggering it causes the package to be
            // activated.
            atom.commands.dispatch(workspaceElement, 'trucker:move')

            waitsForPromise(() => {
                return activationPromise
            })

            runs(() => {
                // Now we can test for view visibility
                let truckerElement = workspaceElement.querySelector(
                    '.trucker-dialog'
                )
                expect(truckerElement).toBeVisible()
            })
        })
    })
})
