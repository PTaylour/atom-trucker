'use babel'
import parseMenuItem from '../lib/parseMenuItem'

const PATH = 'a/path'

const MENU_HEADER_SPAN = {
    dataset: {
        path: PATH,
    },
}

const MENU_HEADER_DIV = {
    dataset: {
        path: undefined,
    },
    childNodes: [MENU_HEADER_SPAN],
}

describe('parseMenuItem', () => {
    it('parses inner span of a header for path', () => {
        expect(parseMenuItem(MENU_HEADER_SPAN)).toBe(PATH)
    })

    it('parses menu header div of a header for path', () => {
        expect(parseMenuItem(MENU_HEADER_DIV)).toBe(PATH)
    })

    it('Returns undefined if no path', () => {
        expect(parseMenuItem({})).toBe(undefined)
    })
})
