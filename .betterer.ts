import { typescript } from '@betterer/typescript';
import { angular } from '@betterer/angular';

export default {
  'stricter compilation': () =>
    typescript('./tsconfig.json', {
      strict: true,
    }).include('./src/**/*.ts'),

  'stricter template compilation': () =>
    angular('./tsconfig.json', {
      strictTemplates: true,
    }).include('./src/*.ts', './src/*.html'),
};
