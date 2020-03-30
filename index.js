const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');
const HOME = os.homedir()
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);
const SRCPATH = `${HOME}/wkspc/personal/aliaser`
const clipboardy = require('clipboardy');


async function delete_select() {
  let links = JSON.parse(fs.readFileSync(`${SRCPATH}/links.json`));
  let linkNames = Object.keys(links)

  let { selection } = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Delete alias...',
        choices: linkNames
      });

  var remover = spawn('rm', [`${HOME}/symlinks/${selection}`])
  remover.on('close', (code) => {
    if (code == 0) {
      removeJSON(selection)
    } else {
      throw new Error(`Failed to delete symlink from ${HOME}/symlinks/${selection}`)
    }
  });

}

function createLink(shortcutname) {
  var linker = spawn('ln', ["-s", process.cwd(), `${HOME}/symlinks/${shortcutname}`])
  linker.on('close', (code) => {
    if (code == 0) {
      addJSON(shortcutname, process.cwd())
    } else {
      throw new Error(`Failed to add symlink at ${HOME}/symlinks/${selection}`)
    }
  });
}

function exists(name) {
  let links = JSON.parse(fs.readFileSync(`${SRCPATH}/links.json`));
  let value = links[name];
  return (value != null && value != undefined && value != "")
}

function addJSON(name, dir) {
  let links = JSON.parse(fs.readFileSync(`${SRCPATH}/links.json`));
  links[name] = dir
  fs.writeFileSync(`${SRCPATH}/links.json`, JSON.stringify(links));
}
function removeJSON(name) {
  let links = JSON.parse(fs.readFileSync(`${SRCPATH}/links.json`));
  delete links[name]
  fs.writeFileSync(`${SRCPATH}/links.json`, JSON.stringify(links));
}

async function getLink() {
  let links = JSON.parse(fs.readFileSync(`${SRCPATH}/links.json`));
  console.log("Choose an alias name to copy");

  var linkDescriptions = []
  var linkTitles = []
  for (link in links) {
    var linkExpanded = links[link]
    if (linkExpanded.startsWith(HOME)) {
      linkExpanded = `~${linkExpanded.substring(HOME.length)}`
    }
    linkDescriptions.push(`${link} (${linkExpanded})`);
    linkTitles.push(link)
  }

  let { selection } = await inquirer.prompt({
        type: 'list',
        name: 'selection',
        message: 'Choose an alias name to copy...',
        choices: linkDescriptions
      });


  var og_name = linkTitles[linkDescriptions.indexOf(selection)]
  var clipboard = `cd ${og_name}`
  clipboardy.writeSync(clipboard)
  console.log(`Copied '${clipboard}' to clipboard.`);
}


try {
  operator = process.argv[2]
  if (operator == "new") {
    const symlinkName = process.argv[3];
    if (!symlinkName || symlinkName == "") {
      throw new Error("Can not create new alias without shortcut name");
    } else if (exists(symlinkName)) {
      throw new Error(`Can not create alias named ${symlinkName}. Alias already exists.`)
    } else {
      createLink(symlinkName);
    }
  } else if (operator == "list") {
    getLink();
  } else if (operator == "rm") {
    delete_select();
  }
} catch (error) {
  console.log(error.message);
}
