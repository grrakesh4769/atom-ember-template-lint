'use babel'

const loophole = require('loophole');
const LinterHelpers = require('atom-linter');
const {File} = require('atom');
const importFrom = require('import-from');

const configFileName = ".template-lintrc.js";

function getConfigFileFromDirectory(directory) {
    return directory.getEntriesSync().find(function (entry) {
        return entry.isFile() && entry.getBaseName() === configFileName;
    });
}

function getLocalTemplateLint(editorFilePath) {
  let currentDir = new File(editorFilePath).getParent();
  let foundConfig;
  while (!(foundConfig = getConfigFileFromDirectory(currentDir)) && !currentDir.isRoot()) {
      currentDir = currentDir.getParent();
  }

  // we couldn't find a template lint donfig so we should bail
  if (!foundConfig) {
    return
  }

  let configPath = foundConfig.getPath();

  const Linter = importFrom(foundConfig.getPath(), 'ember-template-lint');

  return new Linter({
      configPath,
  });
}

export function activate() {
    require('atom-package-deps').install('atom-ember-template-lint');
}

export function provideLinter() {
    return {
        name: 'Ember Template Linter',
        grammarScopes: [
            'text.html.mustache',
            'text.html.htmlbars',
            'text.html.handlebars'
        ],
        scope: 'file', // or 'project'
        lintsOnChange: true,
        lint: async function (textEditor) {
            return new Promise(function (resolve, reject) {
                let linter = getLocalTemplateLint(textEditor.getPath());

                // if we couldn't find a template-lint config then we probably shouldn't lint
                if (!linter) {
                  return [];
                }

                let linterErrors = [];

                loophole.allowUnsafeNewFunction(() => {
                    linterErrors = linter.verify({
                        source: textEditor.getText(),
                        moduleId: textEditor.getPath().slice(0, -4),
                        filePath: textEditor.getPath()
                    });
                });

                // support ember-template-lint 2.x and 3.x
                if (linterErrors.then) {
                  linterErrors.then(resolve);
                } else {
                  resolve(linterErrors);
                }

            }).then((linterErrors) => {
              let errors = linterErrors.map(
                  (error) => ({
                      severity: 'error',
                      excerpt: error.message,
                      description: error.rule,
                      location: {
                          file: textEditor.getPath(),
                          position: LinterHelpers.generateRange(textEditor, error.line - 1, error.column)
                      }
                  })
              );

              return errors;
            })
        }
    }
}
