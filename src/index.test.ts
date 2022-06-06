import { describe, it } from 'mocha'
import { expect } from 'chai'
import { compile, morph } from '.'

describe('index.ts', () => {
  describe('compile()', () => {
    it('Should throw an error if no paths are provided', () => {
      expect(() => compile([])).to.throw(Error, 'compile() must receive at least one path.')
    })
    it('Should throw an error if the paths are not all the same length.', () => {
      expect(() => compile([
        'M0,0 L1,1',
        'M0,0 L1,1 L2,2'
      ])).to.throw('All paths must have the same number of commands.')
    })
    it('Should throw an error if any path has a different sequence of commands', () => {
      expect(() => compile([
        'M0,0 L1,1 C1,2,3,4,5,6',
        'M0,0 L1,1 L2,2'
      ])).to.throw('All paths must be variations of the same sequence of commands.')
    })
    it('Should generate an average path of the same length as the paths provided', () => {
      const paths = [
        'M0,0 L1,1 L3,3',
        'M0,0 L1,1 L2,2'
      ]
      const { average } = compile(paths)
      expect(average.length).to.equal(3)
    })
    it('Should generate a command-major array of average parameters', () => {
      const paths = [
        'M0,0 L1,1 L3,3',
        'M0,0 L1,1 L2,2'
      ]
      const { average } = compile(paths)
      expect(average).to.deep.equal([
        [0, 0],     // M0,0 and M0,0
        [1, 1],     // L1,1 and L1,1
        [2.5, 2.5]  // L3,3 and L2,2
      ])
    })
    it('Should generate a command-major array of difference parameters', () => {
      const paths = [
        'M0,0 L1,1 L3,3',
        'M0,0 L1,1 L2,2'
      ]
      const { diffs } = compile(paths)
      expect(diffs).to.deep.equal([
        [[0 - 0, 0 - 0], [0 - 0, 0 - 0]],         // M0,0 and M0,0 - avg
        [[1 - 1, 1 - 1], [1 - 1, 1 - 1]],         // L1,1 and L1,1 - avg
        [[3 - 2.5, 2 - 2.5], [3 - 2.5, 2 - 2.5]]  // L3,3 and L2,2 - avg
      ])
    })
    it('Should generate an average path identical to the provided path if only one path is provided', () => {
      const paths = [
        'M0,0 L1,1 L3,3'
      ]
      const { average } = compile(paths)
      expect(average).to.deep.equal([
        [0, 0],
        [1, 1],
        [3, 3]
      ])
    })
    it('Should generate a diff path of zeros if only one path is provided', () => {
      const paths = [
        'M0,0 L1,1 L3,3'
      ]
      const { diffs } = compile(paths)
      expect(diffs).to.deep.equal([
        [[0], [0]],
        [[0], [0]],
        [[0], [0]]
      ])
    })
    it('Should generate an array of commands representing the command sequence in the provided paths', () => {
      const paths = [
        'M0,0 L1,1 L3,3',
        'M0,0 L1,1 L2,2'
      ]
      const { commands } = compile(paths)
      expect(commands).to.deep.equal(['M', 'L', 'L'])
    })
  })
  describe('morph()', () => {
    it('Should throw an error if the number of weights does not equal the number of paths', () => {
      const paths = [
        'M0,0 L1,1 L3,3',
        'M0,0 L1,1 L2,2'
      ]
      const compiled = compile(paths)
      expect(() => morph(compiled, [0.5])).to.throw('Weights must have the same length as the number of paths.')
    })
    it('Should generate a path identical to a path with weight=1 and weight=0 for all other paths', () => {
      const paths = [
        'M0 0 L1 1 L3 3',
        'M0,0 L1,1 L2,2'
      ]
      const compiled = compile(paths)
      const morphed = morph(compiled, [1, 0])
      expect(morphed).to.equal('M0 0 L1 1 L3 3')
    })
  })
})