'use babel';

import AtomEmberTemplateLintView from './atom-ember-template-lint-view';
import { CompositeDisposable } from 'atom';

export default {

  atomEmberTemplateLintView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomEmberTemplateLintView = new AtomEmberTemplateLintView(state.atomEmberTemplateLintViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomEmberTemplateLintView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-ember-template-lint:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomEmberTemplateLintView.destroy();
  },

  serialize() {
    return {
      atomEmberTemplateLintViewState: this.atomEmberTemplateLintView.serialize()
    };
  },

  toggle() {
    console.log('AtomEmberTemplateLint was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
