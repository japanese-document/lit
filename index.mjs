import fs from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import glob from 'glob'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { marked } from 'marked'

const { values: { dev } } = parseArgs({
  options: {
    dev: {
      type: 'boolean'
    }
  }
})

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

const TITLE = /__TITLE__/g
const BODY = '__BODY__'
const CSS = '__CSS__'
const CSS_PATH = dev ? '/app.css?v=001' : '/lit/app.css?v=001'
const BASE_URL = dev ? 'http://127.0.0.1:8000' : 'https://japanese-document.github.io/lit'
const URL = '__URL__'
const DESCRIPTION = /__DESCRIPTION__/g
const layout = fs.readFileSync('src/layout.html', 'utf8')
const renderer = {
  link(href, _title, text) {
    return `<a href="${href}" class="Link">${text}</a>`
  },
  heading(text, level) {
    const document = new window.DOMParser().parseFromString(text, 'text/html')
    const href = document.body.textContent.replaceAll(/\s/g, '_')
    return `<h${level}><a href="#${href}">${text}</a></h${level}>\n`
  }
}

marked.use({ renderer })

function getMarkDownFileNames() {
  return new Promise((resolve) => {
    glob('./src/**/*.md', (err, files) => {
      if (err !== null) {
        console.error(err)
        process.exit(1)
      }
      return resolve(files)
    })
  })
}

function createTitle(md) {
  return md.slice(2, md.indexOf('\n'))
}

function createDescription(html) {
  const _html = html.slice(html.indexOf('\n'))
  const document = new window.DOMParser().parseFromString(_html, 'text/html')
  return document.body.textContent.replaceAll(/\n/g, '').slice(0, 300)
}

function createURL(dir, name) {
  return `${BASE_URL}/${dir.slice(6)}/${name}.html`
}

function createHTML(title, body, description, url, cssPath) {
  const html = layout
    .replaceAll(TITLE, DOMPurify.sanitize(title)).replace(BODY, DOMPurify.sanitize(body))
    .replaceAll(DESCRIPTION, DOMPurify.sanitize(description)).replace(URL, DOMPurify.sanitize(url))
    .replace(CSS, DOMPurify.sanitize(cssPath))
  return html
}

async function createPage(md, title, url) {
  const body = marked.parse(md)
  const description = createDescription(body)
  const html = createHTML(title, body, description, url, CSS_PATH)
  return html
}

function createIndexPage(pages) {
  const title = 'Lit'
  const md = `# Lit\n${pages.map(p => `* [${p.title}](${p.url})`).join('\n')}`
  const body = marked.parse(md)
  const description = 'Lit'
  const html = createHTML(title, body, description, BASE_URL, CSS_PATH)
  return html
}

const markDownFileNames = await getMarkDownFileNames()
const pages = []
for (let markDownfileName of markDownFileNames) {
  const md = await fs.promises.readFile(markDownfileName, 'utf8')
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownfileName)
  const url = createURL(dir, name)
  const page = await createPage(md, title, url)
  const dirPath = `./docs/${dir.slice(6)}`
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath)
  }
  const htmlFileName = `${dirPath}/${name}.html`
  await fs.promises.writeFile(htmlFileName, page)
  pages.push({
    title,
    url
  })
}

const indexPage = createIndexPage(pages)
await fs.promises.writeFile('docs/index.html', indexPage)