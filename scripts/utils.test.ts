import { createTitle, createDescription, getMetaAndMd, createURL, createHash, createIndexItems }  from './utils.js'

describe('createTitle', () => {
  test('output', () => {
    const title = createTitle('# foo\n012346789\n0123456789')
    expect(title).toBe('foo')
  })
})

describe('createDescription', () => {
  test('output', () => {
    const html = `# foo\n${'1234"'.repeat(40)}`
    const result = '1234&quot;'.repeat(30)
    const description = createDescription(html)
    expect(description).toBe(result)
  })
})

describe('getMetaAndMd', () => {
  test('output', () => {
    const input = '{"foo": 123}\n---\n# Foo\nBar'
    const metaAndMd = getMetaAndMd(input)
    expect(metaAndMd).toEqual([{ foo: 123 }, '# Foo\nBar'])
  })
})

describe('createURL', () => {
  test('output', () => {
    const url = createURL('0123456789', 'name')
    expect(url).toBe('https://japanese-document.github.io/lit/456789/name.html')
  })
})

describe('createHash', () => {
  test('output', () => {
    const hash = createHash('<a>?:&foo=%"\'@><')
    expect(hash).toBe('___foo______--_')
  })
})

describe('createIndexItems', () => {
  function createPageData() {
    return [
      {
        headerOrder: 0,
        order: 0
      },
      {
        headerOrder: 0,
        order: 1
      },
      {
        headerOrder: 1,
        order: 0
      },
    ].map( p => ({
      meta: {
        header: {
          name: `name${p.headerOrder}`,
          order: p.headerOrder
        },
        order: p.order
      },
      title: `title${p.order}`,
      url: `https://example.com/${p.order}`
    }))
  }

  let spy: jest.SpyInstance

  beforeAll(() => {
    spy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('output', () => {
    const pages = createPageData()
    const indexItems = createIndexItems(pages)
    expect(indexItems).toEqual([
      { name: 'name0', pages: [{ title: 'title0', url: 'https://example.com/0' },{ title: 'title1', url: 'https://example.com/1' }] },
      { name: 'name1', pages: [{ title: 'title0', url: 'https://example.com/0' }] }])
  })

  test('wrong header', () => {
    const pages = createPageData()
    pages[1].meta.header.name = 'foo'
    expect(() => {
      createIndexItems(pages)
    }).toThrow('header already exists.')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      [{ name: 'name0', pages: [{ title: 'title0', url: 'https://example.com/0' }] }],
      { meta: { header: { name: 'foo', order: 0 }, order: 1 }, title: 'title1', url: 'https://example.com/1' }
    )
  })

  test('wrong page', () => {
    const pages = createPageData()
    pages[1].meta.order = 0
    expect(() => {
      createIndexItems(pages)
    }).toThrow('page already exists.')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      { title: 'title0', url: 'https://example.com/0' },
      { meta: { header: { name: 'name0', order: 0 }, order: 0 }, title: 'title1', url: 'https://example.com/1' }
    )
  })
})