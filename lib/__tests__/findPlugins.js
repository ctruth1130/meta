jest.mock('fs');
jest.mock('../isPlugin', () => {
  const path = require('path');
  return filePath => /^meta-/.test(path.basename(filePath));
});

const findPlugins = require('../findPlugins');
const fs = require('fs');

describe('findPlugins', () => {
  beforeEach(() => {
    fs.reset();
    process.env.NODE_PATH = '';
  });

  it('ignores non-plugins', () => {
    fs.write('/node_modules/@foo/bar/index.js', '');
    fs.write('/node_modules/foo/index.js', '');
    expect(findPlugins('/')).toMatchSnapshot();
  });

  it('finds scoped plugins', () => {
    fs.write('/node_modules/@foo/meta-foo/index.js', '');
    expect(findPlugins('/')).toMatchSnapshot();
  });

  it('finds non-scoped plugins', () => {
    fs.write('/node_modules/meta-foo/index.js', '');
    expect(findPlugins('/')).toMatchSnapshot();
  });

  it('skips plugins whose name is already in use', () => {
    fs.write('/node_modules/@foo/meta-foo/index.js', '');
    fs.write('/node_modules/meta-foo/index.js', '');
    expect(findPlugins('/')).toMatchSnapshot();
  });

  it('searches every parent directory', () => {
    fs.write('/1/node_modules/meta-1/index.js', '');
    fs.write('/1/2/3/node_modules/meta-3/index.js', '');
    fs.write('/1/2/3/4/index.js', '');

    // The 2nd parent has no "node_modules"
    expect(findPlugins('/1/2/3/4/5')).toMatchSnapshot();
  });

  it('searches every global directory', () => {
    fs.write('/foo/meta-foo/index.js', '');
    fs.write('/bar/@foo/meta-bar/index.js', '');

    process.env.NODE_PATH = '/foo:/bar';
    expect(findPlugins('/dev')).toMatchSnapshot();
  });
});
