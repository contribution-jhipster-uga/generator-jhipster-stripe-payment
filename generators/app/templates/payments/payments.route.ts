import { Route } from '@angular/router';

import { PaymentsComponent } from './';

export const PAYMENTS_ROUTE: Route = {
    path: 'payments',
    component: PaymentsComponent,
    data: {
        authorities: [],
        pageTitle: 'localversionApp.payments.title'
    }
};
