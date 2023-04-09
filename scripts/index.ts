import fs from 'node:fs'
import path from 'node:path'
import { INDEX_PAGE_LAYOUT, OUTPUT_DIR, PAGE_LAYOUT, SOURCE_DIR } from './config.js'
import { createTitle, getMarkDownFileNames, getMetaAndMd, createURL, createPage, createIndexPage, Page, createIndexItems, createIndexMenu, createHeaderList } from './utils.js'

const markDownFileNames = await getMarkDownFileNames()

async function createPageData(markDownFileName: string): Promise<Page> {
  const content = await fs.promises.readFile(markDownFileName, 'utf8')
  const [meta, md] = getMetaAndMd(content)
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownFileName)
  const url = createURL(dir, name)
  const page = {
    meta,
    title,
    url
  }
  return page
}

const createPageDataPromises = markDownFileNames.map(
  (markDownFileName) => createPageData(markDownFileName))
const pages = await Promise.all(createPageDataPromises)

const indexItems = createIndexItems(pages)
const indexMenu = createIndexMenu(indexItems)
const pageLayout = fs.readFileSync(PAGE_LAYOUT, 'utf8')

async function createHTMLFile(
  markDownFileName: string, indexMenu: string, pageLayout: string, sourceDir: string, outputDir: string) {
  const content = await fs.promises.readFile(markDownFileName, 'utf8')
  const [, md] = getMetaAndMd(content)
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownFileName)
  const url = createURL(dir, name)
  const headerList = createHeaderList(md)
  const page = await createPage(pageLayout, md, title, url, indexMenu, headerList)
  const prefixDirCount = sourceDir.length + 1
  const dirPath = `${outputDir}/${dir.slice(prefixDirCount)}`
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath)
  }
  const htmlFileName = `${dirPath}/${name}.html`
  await fs.promises.writeFile(htmlFileName, page)
}

const createHTMLFilePromises = markDownFileNames.map(
  (markDownFileName) => createHTMLFile(markDownFileName, indexMenu, pageLayout, SOURCE_DIR, OUTPUT_DIR))
await Promise.all(createHTMLFilePromises)

const indexPageLayout = fs.readFileSync(INDEX_PAGE_LAYOUT, 'utf8')
const indexPage = createIndexPage(indexPageLayout, indexItems)
await fs.promises.writeFile(`${OUTPUT_DIR}/index.html`, indexPage)