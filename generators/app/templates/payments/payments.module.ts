import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PAYMENTS_ROUTE, PaymentsComponent } from './';

@NgModule({
    declarations: [PaymentsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
// JHipster Stripe Module will add new line here
