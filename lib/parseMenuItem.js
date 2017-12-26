'use babel'
import { lensPath, view } from 'ramda'
import { walk } from './utils'

const findPath = view(lensPath(['dataset', 'path']))

const parseMenuItem = event => {
    const topElement = event.target
    let path
    walk(topElement, node => {
        path = findPath(node)
        if (path) {
            return false // stop walking the tree
        }
    })
    return path
}

export default parseMenuItem
