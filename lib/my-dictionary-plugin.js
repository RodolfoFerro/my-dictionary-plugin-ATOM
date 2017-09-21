'use babel';

import MyDictionaryPluginView from './my-dictionary-plugin-view';
import { CompositeDisposable } from 'atom';

export default {

  myDictionaryPluginView: null,
  modalPanel: null,
  subscriptions: null,
  wordToSearch: null,
  wordDefinition: null,

  activate(state) {
    wordToSearch = "default";
    wordDefinition = "default";

    this.myDictionaryPluginView = new MyDictionaryPluginView(state.myDictionaryPluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.myDictionaryPluginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'my-dictionary-plugin:toggle': () => this.toggle()
    }));
  },

  deactvate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.myDictionaryPluginView.destroy();
  },

  serialize() {
    return {
      myDictionaryPluginViewState: this.myDictionaryPluginView.serialize()
    };
  },

  toggle() {
    editor = atom.workspace.getActiveTextEditor();
    wordToSearch = editor.getSelectedText();
    if(!wordToSearch){
      wordToSearch = editor.getWordUnderCursor();
    }
    // Dictionary API consumption:
    data = null;
    xhr = null;
    xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        jsonText = JSON.parse(xhr.responseText);
        wordDefinition = jsonText.results[0].lexicalEntries[0].entries[0].senses[0].subsenses[0].definitions[0];
        console.log(jsonText.results[0].lexicalEntries[0].entries[0].senses[0].subsenses[0].definitions[0]);
      }
    });
    xhr.open("GET", "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/"+wordToSearch+'/definitions', false);
    xhr.setRequestHeader("accept", "application/json");
    xhr.setRequestHeader("app_id", "xxxx");
    xhr.setRequestHeader("app_key", "xxxx");
    xhr.send(data);
    this.myDictionaryPluginView.setElement();

    console.log('MyDictionaryPlugin was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
