import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  repoConfig: {
    url: 'https://github.com/Angular-Material-Dev/mat-expressive',
    mainBranch: 'main',
    releaseBranch: 'main',
  },
  docsPath: 'src/app/docs',
};

export default config;
