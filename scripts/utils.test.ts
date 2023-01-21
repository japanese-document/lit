import { createTitle, createDescription, getMetaAndMd, createURL }  from './utils.js'

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
    expect(url).toBe('https://japanese-document.github.io/tips/6789/name.html')
  })
})