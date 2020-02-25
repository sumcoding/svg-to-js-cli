import * as generate from './generate';
import SVGO from 'svgo';
import fs from 'fs-extra';

jest.mock('fs-extra');
jest.mock('svgo', () => jest.fn().mockImplementation(() => ({
  optimize: jest.fn().mockImplementation(() => ({
    data: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 487 487" height="487" width="487"><path d="M479 215.275l-83.5-113.9c-11-15-33.3-26.3-51.8-26.3H39.2c-21.6 0-39.2 17.6-39.2 39.2v259.3c0 21.6 17.6 39.2 39.2 39.2h304.5c18.6 0 40.9-11.3 51.8-26.3l83.5-113.9c11.8-16 11.8-41.2 0-57.3zm-21.8 41.5l-83.5 113.9c-5.8 8-20.2 15.2-30.1 15.2H39.2c-6.7 0-12.2-5.5-12.2-12.2v-259.4c0-6.7 5.5-12.2 12.2-12.2h304.5c9.9 0 24.2 7.3 30.1 15.2l83.5 113.9c4.8 6.7 4.8 18.9-.1 25.6z"/></svg>',
    info: { width: '487', height: '487' }
  }))
})));

describe('Svg to js', () => {
  const file = 'test.svg';
  const src = './icons'


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('buildSvg() should generate a clean js object', async () => {
    fs.readFileSync.mockReturnValue(() => `<?xml version="1.0" encoding="iso-8859-1"?>
      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 487 487" height="487" width="487" style="enable-background:new 0 0 487 487;" xml:space="preserve">
      <g>
        <path d="M479,215.275l-83.5-113.9c-11-15-33.3-26.3-51.8-26.3H39.2c-21.6,0-39.2,17.6-39.2,39.2v259.3c0,21.6,17.6,39.2,39.2,39.2
          h304.5c18.6,0,40.9-11.3,51.8-26.3l83.5-113.9C490.8,256.575,490.8,231.375,479,215.275z M457.2,256.775l-83.5,113.9
          c-5.8,8-20.2,15.2-30.1,15.2H39.2c-6.7,0-12.2-5.5-12.2-12.2v-259.4c0-6.7,5.5-12.2,12.2-12.2h304.5c9.9,0,24.2,7.3,30.1,15.2
          l83.5,113.9C462.1,237.875,462.1,250.075,457.2,256.775z"/>
      </g>
      </svg>`
    );

    const test = await generate.buildSvg(file, src);
    expect(fs.readFileSync).toHaveBeenCalled();
    const { name, viewBox, height, width, path } = test;
    expect(name).toBe('test');
    expect(path).toEqual(expect.stringContaining('path'))
    expect(path).toEqual(expect.not.stringContaining('svg'))
    expect(viewBox).toBe('0 0 487 487');
    expect(height).toBe('487');
    expect(width).toBe('487');
  });
});
