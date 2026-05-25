import { NgDocApi } from '@ng-doc/core';

const Api: NgDocApi = {
  title: 'API References',
  scopes: [
    {
      name: '@ngm-dev/mat-expressive',
      route: 'mat-expressive',
      include: 'projects/ngm-dev/mat-expressive/src/public-api.ts',
    },
  ],
  order: 4,
};

export default Api;
