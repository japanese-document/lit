import fs from 'node:fs'
import path from 'node:path'
import { INDEX_PAGE_LAYOUT, OUTPUT_DIR, PAGE_LAYOUT, SOURCE_DIR } from './config.js'
import { createTitle, getMarkDownFileNames, getMetaAndMd, createURL, createPage, createIndexPage, Page, createIndexItems, createIndexMenu } from './utils.js'

const markDownFileNames = await getMarkDownFileNames()

const pages: Page[] = []
for (const markDownfileName of markDownFileNames) {
  const content = await fs.promises.readFile(markDownfileName, 'utf8')
  const [meta, md] = getMetaAndMd(content)
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownfileName)
  const url = createURL(dir, name)
  pages.push({
    meta,
    title,
    url
  })
}

const indexItems = createIndexItems(pages)
const indexMenu = createIndexMenu(indexItems)

const pageLayout = fs.readFileSync(PAGE_LAYOUT, 'utf8')
for (const markDownfileName of markDownFileNames) {
  const content = await fs.promises.readFile(markDownfileName, 'utf8')
  const [, md] = getMetaAndMd(content)
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownfileName)
  const url = createURL(dir, name)
  const page = await createPage(pageLayout, md, title, url, indexMenu)
  const prefixDirCount = SOURCE_DIR.length + 1
  const dirPath = `${OUTPUT_DIR}/${dir.slice(prefixDirCount)}`
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath)
  }
  const htmlFileName = `${dirPath}/${name}.html`
  await fs.promises.writeFile(htmlFileName, page)
}

const indexPageLayout = fs.readFileSync(INDEX_PAGE_LAYOUT, 'utf8')
const indexPage = createIndexPage(indexPageLayout, indexItems)
await fs.promises.writeFile(`${OUTPUT_DIR}/index.html`, indexPage)