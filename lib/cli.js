import inquirer from 'inquirer';
import meow from 'meow';
import { generate } from './generate';


const prompt = inquirer.createPromptModule();

function parseArgumentsIntoOptions() {
  const cli = meow(
    `
        Usage
        $ svgtojs <src> <dest>

        Options:
        -m, --module                  single module for each icon`,
    {
      stopEarly: true,
      flags: {
        module: {
          type: 'boolean',
          alias: 'm'
        }
      }
    });
  return {
    ...cli.flags,
    src: cli.input[0] || null,
    dest: cli.input[1] || null
  }

}

const allQuestions = [
  {
    type: 'input',
    name: 'src',
    message: 'Please enter the source path',
  },
  {
    type: 'input',
    name: 'dest',
    message: 'Please set the destination for the icons (enter to leave default main directory)'
  },
]

async function promptForMissingOptions(options) {
  let answers;
  await prompt(!options.src ? allQuestions : []).then(answer => answers = answer);

  return {
    ...options,
    ...answers
  };
}

export async function cli() {
  let options = parseArgumentsIntoOptions();
  options = await promptForMissingOptions(options);
  generate(options);
}