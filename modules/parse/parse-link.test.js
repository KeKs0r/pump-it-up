const {
  matchPastebin,
  fetchPastebin,
  matchHastebin,
  fetchHastebin
} = require('./parse-link')

describe('Pastebin', () => {
  it('Match Pastebin', () => {
    const t = `🔵 Coin: pastebin.com/VN6GBCeR\n\nCoin is in the link! Buy and HOLD!`
    const link = matchPastebin(t)
    expect(link).toBe('pastebin.com/VN6GBCeR')
  })
  //https://pastebin.com/08nhjqrK

  it('Fetch Pastebin', async () => {
    const url = `pastebin.com/VN6GBCeR`
    const text = await fetchPastebin(url)
    expect(text).toContain('XBS')
  })
})

describe('Hastebin', () => {
  it('Match Hastebin', () => {
    const t = `🔵 Coin: hastebin.com/doqiyicetu.http\n\nCoin is in the link! Buy and HOLD!`
    const link = matchHastebin(t)
    expect(link).toBe('hastebin.com/doqiyicetu')
  })

  it('Fetch Hastebin', async () => {
    const url = `hastebin.com/doqiyicetu`
    const text = await fetchHastebin(url)
    expect(text).toContain('XBS')
  })
})

it('pasted.co')
