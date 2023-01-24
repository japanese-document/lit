import { promisify } from 'node:util'
// eslint-disable-next-line import/no-named-as-default
import glob from 'glob'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { marked } from 'marked'
import {
  BASE_URL, BODY, CSS_PATH, DESCRIPTION, SEPARATOR, TITLE, CSS, URL, INDEX,
  INDEX_PAGE_DESCRIPTION, INDEX_PAGE_HEADER, INDEX_PAGE_TITLE, SOURCE_DIR, HEADER
} from './config.js'

const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window as unknown as Window)

export function createHash(text: string) {
  const document = new window.DOMParser().parseFromString(text, 'text/html')
  return document.body.textContent!
    .replaceAll(/(\s|\?|:|&|=|%|"|'|\/|@)/g, '_')
    .replaceAll(/</g, '-_')
    .replaceAll(/>/g, '_-')
}

const renderer = {
  link(href: string, _title: string, text: string) {
    return `<a href="${href}" class="Link">${text}</a>`
  },
  heading(text: string, level: number) {
    const hash = createHash(text)
    return `<h${level} id="${hash}"><a href="#${hash}">${text}</a></h${level}>\n`
  }
}

marked.use({ renderer })

interface Meta {
  header: {
    name: string
    order: number
  }
  order: number
}

export interface Page {
  meta: Meta
  title: string
  url: string
}

interface IndexItem {
  name: string
  pages: {
    title: string
    url: string
  }[]
}

export function createTitle(md: string) {
  return md.slice('# '.length, md.indexOf('\n'))
}

export function getMarkDownFileNames(): Promise<string[]> {
  return promisify(glob)(`${SOURCE_DIR}/**/*.md`).catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

export function getMetaAndMd(content: string): [Meta, string] {
  const [meta, md] = content.split(SEPARATOR)
  return [JSON.parse(meta), md.trim()]
}

export function createDescription(html: string) {
  const _html = html.slice(html.indexOf('\n'))
  const document = new window.DOMParser().parseFromString(_html, 'text/html')
  return document.body.textContent!.replaceAll(/\n/g, '').replaceAll(/"/g, '&quot;').slice(0, 300)
}

export function createURL(dir: string, name: string) {
  const prefixDirCount = SOURCE_DIR.length + 1
  if (dir.length <= prefixDirCount) {
    return `${BASE_URL}/${name}.html`
  }
  return `${BASE_URL}/${dir.slice(prefixDirCount)}/${name}.html`
}

export function createHTML(
  layout: string, title: string, body: string, description: string, url: string,
  cssPath: string, indexMenu: string, headerList: string) {
  const html = layout
    .replaceAll(TITLE, DOMPurify.sanitize(title))
    .replace(BODY, DOMPurify.sanitize(body))
    .replaceAll(DESCRIPTION, DOMPurify.sanitize(description))
    .replace(URL, DOMPurify.sanitize(url))
    .replace(CSS, DOMPurify.sanitize(cssPath))
    .replace(INDEX, DOMPurify.sanitize(indexMenu))
    .replace(HEADER, DOMPurify.sanitize(headerList))
  return html
}

export async function createPage(
  layout: string, md: string, title: string, url: string, indexMenu: string, headerList: string) {
  const body = marked.parse(md)
  const description = createDescription(body)
  return createHTML(layout, title, body, description, url, CSS_PATH, indexMenu, headerList)
}

export function createIndexItems(pages: Page[]) {
  return pages.reduce((p, _p) => {
    const { order, name } = _p.meta.header
    const { title, url } = _p
    p[order] ??= {
      name,
      pages: []
    }
    const page = p[order].pages[_p.meta.order]
    if (page) {
      console.error(page, _p)
      throw Error('page already exists.')
    }
    p[order].pages[_p.meta.order] = {
      title,
      url
    }
    return p
  }, [] as IndexItem[])
}

export function createIndexMenu(items: IndexItem[]) {
  return `
    <div class="index-menu">${items.reduce((p, item) => `${p}
      <details open>
        <summary>${item.name}</summary>${item.pages.reduce((p, page) => `${p}
        <p><a href="${page.url}">${page.title}</a></p>`, '')}
      </details>`, '')}
    </div>`
}

export function createHeaderList(md: string) {
  const list = md
    .split('\n')
    .filter((l) => l.slice(0, 2) === '# ' || l.slice(0, 3) === '## ' || l.slice(0, 4) === '### ' || l.slice(0, 5) === '#### ')
    .map((l) => {
      for (let i = 2; i <= 5; i++ ) {
        if (l.slice(0, i) === `${'#'.repeat(i -1)} `) {
          const _header = l.slice(i).trim()
          const header = marked.parse(_header).trim()
          const href = createHash(header)
          const document = new window.DOMParser().parseFromString(header, 'text/html')
          return `<p class="h${i -1}"><a href="#${href}">${document.body.textContent}</a></p>`
        }
      }
    })
    .join('\n')
  return `<div class="header-list">${list}</div>`
}

export function createIndexPage(layout: string, indexItems: IndexItem[]) {
  const md = indexItems.reduce((md: string, p) => {
    return `${md}\n## ${p.name}\n${p.pages.map(p => `* [${p.title}](${p.url})`).join('\n')}`
  }, `# ${INDEX_PAGE_HEADER}\n`)
  const body = marked.parse(md)
  return createHTML(layout, INDEX_PAGE_TITLE, body, INDEX_PAGE_DESCRIPTION, BASE_URL, CSS_PATH, '', '')
}