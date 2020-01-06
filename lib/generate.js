import chalk from 'chalk'
import path from 'path'
import nunjucks from 'nunjucks'
const fs = require('fs-extra')

function logger(message, type) {
  const color = type === 'DONE' ? 'green' : type === 'ERROR' ? 'red' : 'blue'
  console[type === 'ERROR' ? 'error' : 'log'](`%s ${message}`, chalk[color].bold(type))
}


async function svgtojs({ src, dest }) {
  const files = fs.readdirSync(src)
  const icons = []
  const templateDirectory = path.resolve(__dirname, '../lib/templates')
  const index = `${templateDirectory}/template.index.njk`
  const d = `${dest}/icons`

  if (await !fs.pathExists(d)) {
    await fs.mkdir(d)
    logger('built directory', 'DONE')
  } else {
    await fs.emptyDir(d)
  }

  for (const file of files) {
    if (file.slice(-4) !== '.svg') continue
    const svg = fs.readFileSync(`${src}/${file}`, 'utf-8')
    const viewBox = String(svg.match(/viewBox="[^"]+/)).slice(9)
    const name = file.slice(0, -4)
    const path = svg.replace(/^[^>]+>|<[^<]+$/g, '').replace(/\s*([<>])\s*/g, '$1') // Minified SVG body
    const camelCase = name.replace(/[\.\_\-\s]+./g, (m) => m.slice(-1).toUpperCase())
    const [width, height] = viewBox.split(' ').slice(2)

    icons.push({ path, name: camelCase, viewBox, height, width })
  }

  const indexTemplate = nunjucks.render(`${index}`, { icons })
  await fs.writeFile(`${d}/index.js`, indexTemplate, (err) => {
    if (err) logger('Something went wrong', 'ERROR')
  })

  logger('Created all Icons!', 'DONE')
}

export async function generate(options) {
  await svgtojs(options)
}
