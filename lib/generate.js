import chalk from 'chalk'
import path from 'path'
import nunjucks from 'nunjucks'
const fs = require('fs-extra')
import SVGO from 'svgo';

function logger(message, type) {
  const color = type === 'DONE' ? 'green' : type === 'ERROR' ? 'red' : 'blue'
  console[type === 'ERROR' ? 'error' : 'log'](`%s ${message}`, chalk[color].bold(type))
}

const getFileName = (str) => {
  const splitStr = str.split('/');
  const num = splitStr[splitStr.length - 1].length;
  return str.slice(-num);
}

const getSrcPath = (str) => {
  const splitStr = str.split('/');
  const num = splitStr[splitStr.length - 1].length;
  return str.slice(0, -num);
}

export async function buildSvg(file, src) {
  // add optimizer
  const svgo = new SVGO({
    plugins: [
      {
        removeViewBox: false
      }],
  });

  // read file
  const data = fs.readFileSync(src ? `${src}/${file}` : file, 'utf-8');

  // default cleanup of svg
  let optsvg;
  try {
    optsvg = await svgo.optimize(data);
  } catch (err) {
    logger('File could not be optimized', 'ERROR');
    return;
  }

  // parse the viewbox
  let viewBox = String(optsvg.data.match(/viewBox=('|")(.*?)("|')+/g)).replace(/('|")/g, '').slice(8);

  // get name of icon and camelCase it
  const name = getFileName(file).slice(0, -4);
  const camelCase = name.replace(/[\.\_\-\s]+./g, (m) => m.slice(-1).toUpperCase());

  // Minified SVG body
  const path = optsvg.data.replace(/^[^>]+>|<[^<]+$/g, '').replace(/\s*([<>])\s*/g, '$1').replace(/<text(.*?)<\/text>/g, '');

  // parse width and height from viewbox
  let { width, height } = optsvg.info;
  if ((!width | !height) && viewBox !== '') {
    const [w, h] = viewBox.split(' ').slice(2);
    width = w;
    height = h;
  } else if (viewBox === '' && width && height) {
    viewBox = `0 0 ${width} ${height}`;
  }

  return { path, name: camelCase, viewBox, height, width };
}

export async function svgtojs({ src, dest, module }, single) {
  const files = single ? [src] : fs.readdirSync(src);
  const icons = [];
  const templateDirectory = path.resolve(__dirname, '../lib/templates');

  if (dest) {
    if (await !fs.pathExists(dest)) {
      await fs.mkdir(dest);
      logger('built directory', 'DONE');
    }
  } else {
    dest = single ? getSrcPath(src) : src;
    logger('same directory', 'DONE');
  }

  for (const file of files) {
    if (file.slice(-4) !== '.svg') continue;

    icons.push(await buildSvg(file, single ? null : src));
  }

  if (module) {
    const templateIcon = `${templateDirectory}/template.icon.njk`;
    const templateModule = `${templateDirectory}/template.module.njk`;

    icons.forEach((icon) => {
      const renderIcon = nunjucks.render(`${templateIcon}`, icon);
      fs.writeFile(`${dest}/${icon.name}.js`, renderIcon, (err) => {
        if (err) logger('Something went wrong', 'ERROR');
      });
    });

    const renderModule = nunjucks.render(`${templateModule}`, { icons });

    fs.writeFile(`${dest}/index.js`, renderModule, (err) => {
      if (err) logger('Something went wrong', 'ERROR');
    });
  } else {
    const templateIndex = `${templateDirectory}/template.index.njk`;
    const renderIndex = nunjucks.render(`${templateIndex}`, { icons });

    fs.writeFile(`${dest}/index.js`, renderIndex, (err) => {
      if (err) logger('Something went wrong', 'ERROR');
    });
  }

  logger('Created all Icons!', 'DONE');
}

export async function generate(options) {
  await svgtojs(options, options.src.slice(-4) === '.svg');
}
