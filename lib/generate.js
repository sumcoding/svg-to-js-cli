import chalk from 'chalk'
import path from 'path'
import nunjucks from 'nunjucks'
const fs = require('fs-extra')
import SVGO from 'svgo';

function logger(message, type) {
  const color = type === 'DONE' ? 'green' : type === 'ERROR' ? 'red' : 'blue'
  console[type === 'ERROR' ? 'error' : 'log'](`%s ${message}`, chalk[color].bold(type))
}

async function svgtojs({ src, dest }) {
  const files = fs.readdirSync(src)
  const icons = []
  const templateDirectory = path.resolve(__dirname, '../lib/templates')
  const index = `${templateDirectory}/template.index.njk`
  const d = `${dest}`

  if (await !fs.pathExists(d)) {
    await fs.mkdir(d)
    logger('built directory', 'DONE')
  } else {
    await fs.emptyDir(d)
  }

  for (const file of files) {
    if (file.slice(-4) !== '.svg') continue
    // add optimizer
    const svgo = new SVGO();

    // read file
    const data = fs.readFileSync(`${src}/${file}`, 'utf-8');

    // default cleanup of svg
    const optsvg = await svgo.optimize(data);

    // parse the viewbox
    const viewBox = String(data.match(/viewBox=('|")(.*?)("|')+/g)).replace(/('|")/g, '');

    // get name of icon and camelCase it
    const name = file.slice(0, -4);
    const camelCase = name.replace(/[\.\_\-\s]+./g, (m) => m.slice(-1).toUpperCase());

    // Minified SVG body
    const path = optsvg.data.replace(/^[^>]+>|<[^<]+$/g, '').replace(/\s*([<>])\s*/g, '$1').replace(/<text(.*?)<\/text>/g, '');

    // parse width and height from viewbox
    const [width, height] = viewBox.split(' ').slice(2);

    icons.push({ path, name: camelCase, viewBox, height, width });
  }
  const indexTemplate = nunjucks.render(`${index}`, { icons });

  fs.writeFile(`${d}/index.js`, indexTemplate, (err) => {
    if (err) logger('Something went wrong', 'ERROR');
  });

  logger('Created all Icons!', 'DONE');
}

export async function generate(options) {
  await svgtojs(options)
}
