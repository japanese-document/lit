import { existsSync, readFileSync } from 'node:fs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { createTitle, getMarkDownFileNames, getMetaAndMd, createURL, createPage, createIndexPage,
  createIndexItems, createIndexMenu, createHeaderList, createPages } from './utils.js'
import { INDEX_PAGE_LAYOUT, OUTPUT_DIR, PAGE_LAYOUT, SOURCE_DIR, SINGLE_PAGE } from './const.js'

const markDownFileNames = await getMarkDownFileNames()

const pages = SINGLE_PAGE ? [] : await createPages(markDownFileNames)
const indexItems = createIndexItems(pages)
const indexMenu = createIndexMenu(indexItems)

const pageLayout = readFileSync(PAGE_LAYOUT, 'utf8')

async function createPageHtmlFile(
  markDownFileName: string, indexMenu: string, pageLayout: string, sourceDir: string, outputDir: string) {
  const content = await readFile(markDownFileName, 'utf8')
  const [, md] = getMetaAndMd(content)
  const title = createTitle(md)
  const { name, dir } = path.parse(markDownFileName)
  const url = createURL(dir, name)
  const headerList = createHeaderList(md)
  const page = await createPage(pageLayout, md, title, url, indexMenu, headerList)
  const prefixDirCount = sourceDir.length + 1
  const dirPath = `${outputDir}/${dir.slice(prefixDirCount)}`
  if (!existsSync(dirPath)) {
    await mkdir(dirPath)
  }
  const htmlFileName = `${dirPath}/${name}.html`
  await writeFile(htmlFileName, page)
}

const createPageHtmlFilePromises = markDownFileNames.map(
  (markDownFileName) => createPageHtmlFile(markDownFileName, indexMenu, pageLayout, SOURCE_DIR, OUTPUT_DIR))

async function createIndexHtmlFile(layout: string, outputDir: string, indexItems: ReturnType<typeof createIndexItems>) {
  const indexPageLayout = await readFile(layout, 'utf8')
  const indexPage = createIndexPage(indexPageLayout, indexItems)
  await writeFile(`${outputDir}/index.html`, indexPage)
}

if (SINGLE_PAGE) {
  await Promise.all(createPageHtmlFilePromises)
}
else {
  const createIndexHtmlFilePromise = createIndexHtmlFile(INDEX_PAGE_LAYOUT, OUTPUT_DIR, indexItems)
  await Promise.all([createIndexHtmlFilePromise, ...createPageHtmlFilePromises])
}