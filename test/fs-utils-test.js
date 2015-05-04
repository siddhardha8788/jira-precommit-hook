import {findParentFolder, getFilePath, copyHookFiles} from '../src/fs-utils.js';
import path from 'path';
import fs from 'fs';
import fsp from 'fs-promise';

describe('fs-utils-test.js', () => {
  describe('Finding directory', () => {
    it('Finding named directory', () => {
      let gitPath = findParentFolder(__dirname, '.git');
      gitPath.should.equal(path.join(__dirname, '../.git'));
    });

    it('Unable to find desired directory', () => {
      let fn = () => { findParentFolder(path.join(__dirname, '../../')); };
      expect(fn).to.throw(Error);
    });
  });

  describe('Hook installation', () => {
    before(() => fsp.exists('test/tmp')
      .then(exists => {
        if(!exists) {
          fsp.mkdir('test/tmp')
          .then(() => fsp.mkdir('test/tmp/.git'))
          .then(() => fsp.mkdir('test/tmp/.git/hooks'));
          }
        }
      ));

    beforeEach(() => fsp.exists('test/tmp/.git/hooks/commit-msg')
      .then(exists => {
        if(exists) {
          return fsp.unlink('test/tmp/.git/hooks/commit-msg');
        }
    }));

    it('Hook creation test', (done) => {
      copyHookFiles(path.join(__dirname, '/tmp/.git'))
      .then(() => {
         fs.existsSync('test/tmp/.git/hooks/commit-msg').should.equal(true);
         done();
      });
    });

    it('Validate hook file is correct', (done) => {
      copyHookFiles(path.join(__dirname, '/tmp/.git'))
      .then(() => {
        let newFile = fs.readFileSync('test/tmp/.git/hooks/commit-msg');
        let oldFile = fs.readFileSync('hooks/commit-msg');
        newFile.should.eql(oldFile);
        done();
      });
    });
  });

  describe('Finding specified file', () => {
    it('.gitignore is found from test', () => {
      let gitPath = getFilePath(__dirname, '.gitignore');
      gitPath.should.equal(path.join(__dirname, '../.gitignore'));
    });

    it('Unable to find specified file', () => {
      let fn = () => { getFilePath(path.join(__dirname, '../../')); };
      expect(fn).to.throw(Error);
    });
  });
});
