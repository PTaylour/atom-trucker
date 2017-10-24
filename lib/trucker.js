'use babel';

import TruckerView from './trucker-view';
import { CompositeDisposable, BufferedNodeProcess } from 'atom';

export default {

  truckerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.truckerView = new TruckerView(state.truckerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.truckerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'trucker:move': () => this.move()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.truckerView.destroy();
  },

  serialize() {
    return {
      truckerViewState: this.truckerView.serialize()
    };
  },

  move() {
    console.log('Trucker was toggled!');
    const command = 'ps'
    const args = ['-ef']
    const stdout = (output) => console.log(output)
    const stderr = (output) => console.error(output)
    const exit = (code) => console.log("ps -ef exited with #{code}")
    const process = new BufferedNodeProcess({command, args, stdout, stderr, exit})
    process.start()
    console.log(process, 'process')
    atom.notifications.addSuccess('Toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
