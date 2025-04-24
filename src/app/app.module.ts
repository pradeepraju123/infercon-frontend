import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './controller/home/home.component';
import { TrainingComponent } from './controller/training/training.component';
import { ServicesComponent } from './controller/services/services.component';
import { CareerComponent } from './controller/career/career.component';
import { BlogComponent } from './controller/blog/blog.component';
import { ServicesectionComponent } from './components/servicesection/servicesection.component';
import { ContactsectionComponent } from './components/contactsection/contactsection.component';
import { FootersectionComponent } from './components/footersection/footersection.component';
import { TrainingDetailComponent } from './controller/training-detail/training-detail.component';
import { ContactComponent } from './controller/contact/contact.component';
import { LoginComponent } from './controller/login/login.component';
import { DashboardComponent } from './controller/dashboard/dashboard.component';
import { FormsModule } from '@angular/forms'; 
import { RouterModule } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { TrainingAdminComponent } from './controller/training-admin/training-admin.component';
import { ServiceAdminComponent } from './controller/service-admin/service-admin.component';
import { BlogAdminComponent } from './controller/blog-admin/blog-admin.component';
import { TrainingtableViewComponent } from './components/training-tableview/training-tableview.component';
import { TrainingcardViewComponent } from './components/training-cardview/training-cardview.component';
import { EditTrainingComponent } from './controller/edit-training/edit-training.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AddTrainingComponent } from './controller/add-training/add-training.component';
import { AddServicesComponent } from './controller/add-services/add-services.component';
import { EditServicesComponent } from './controller/edit-services/edit-services.component';
import { ServicesCardviewComponent } from './components/services-cardview/services-cardview.component';
import { ServicesTableviewComponent } from './components/services-tableview/services-tableview.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BlogCardviewComponent } from './components/blog-cardview/blog-cardview.component';
import { BlogTableviewComponent } from './components/blog-tableview/blog-tableview.component';
import { AddBlogComponent } from './controller/add-blog/add-blog.component';
import { EditBlogComponent } from './controller/edit-blog/edit-blog.component';
import { BlogDetailsComponent } from './controller/blog-details/blog-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './controller/registration/registration.component';
import { ContactAdminComponent } from './controller/contact-admin/contact-admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DialogComponent } from './components/dialog/dialog.component';
import { NgxEditorModule } from 'ngx-editor';
import {
  MatDialogModule,
  MatDialog,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import { BookingComponent } from './components/booking/booking.component';
import {MatDividerModule} from '@angular/material/divider';
import { EditContactComponent } from './components/edit-contact/edit-contact.component';
import { GeneraldataCardviewComponent } from './components/generaldata-cardview/generaldata-cardview.component';
import { GeneraldataTableviewComponent } from './components/generaldata-tableview/generaldata-tableview.component';
import { AddGeneralComponent } from './controller/add-general/add-general.component';
import { EditGeneralComponent } from './controller/edit-general/edit-general.component';
import { GeneralAdminComponent } from './controller/general-admin/general-admin.component';
import { PrivacyPolicyComponent } from './controller/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './controller/terms-conditions/terms-conditions.component';
import { LogoutComponent } from './controller/logout/logout.component';
import { AddAdminComponent } from './controller/add-admin/add-admin.component';
import { ListAdminComponent } from './controller/list-admin/list-admin.component';
import { LayoutComponent } from './controller/layout/layout.component';
import { TrainingLandingComponent } from './controller/training-landing/training-landing.component';
import { TrainingListComponent } from './controller/training-list/training-list.component';
import { EventsComponent } from './components/events/events.component';
import { IotComponent } from './components/iot/iot.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { PlacementComponent } from './controller/placement/placement.component';
import { AddPlacementComponent } from './controller/add-placement/add-placement.component';
import { EditPlacementComponent } from './controller/edit-placement/edit-placement.component';
import { PlacementAdminComponent } from './controller/placement-admin/placement-admin.component';
import { PlacementCardviewComponent } from './components/placement-cardview/placement-cardview.component';
import { PlacementTableviewComponent } from './components/placement-tableview/placement-tableview.component';
import { PlacementListComponent } from './controller/placement-list/placement-list.component';
import { PlacementEnquiryComponent } from './components/placement-enquiry/placement-enquiry.component';
import { WhatsappActivityComponent } from './components/whatsapp-activity/whatsapp-activity.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TrainingComponent,
    ServicesComponent,
    CareerComponent,
    BlogComponent,
    ServicesectionComponent,
    ContactsectionComponent,
    FootersectionComponent,
    TrainingDetailComponent,
    ContactComponent,
    LoginComponent,
    DashboardComponent,
    TrainingAdminComponent,
    ServiceAdminComponent,
    BlogAdminComponent,
    TrainingtableViewComponent,
    TrainingcardViewComponent,
    EditTrainingComponent,
    AddTrainingComponent,
    AddServicesComponent,
    EditServicesComponent,
    ServicesCardviewComponent,
    ServicesTableviewComponent,
    BlogCardviewComponent,
    BlogTableviewComponent,
    AddBlogComponent,
    EditBlogComponent,
    BlogDetailsComponent,
    RegistrationComponent,
    ContactAdminComponent,
    DialogComponent,
    BookingComponent,
    EditContactComponent,
    GeneraldataCardviewComponent,
    GeneraldataTableviewComponent,
    AddGeneralComponent,
    EditGeneralComponent,
    GeneralAdminComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    LogoutComponent,
    AddAdminComponent,
    ListAdminComponent,
    LayoutComponent,
    TrainingLandingComponent,
    TrainingListComponent,
    EventsComponent,
    IotComponent,
    EventsListComponent,
    PlacementComponent,
    AddPlacementComponent,
    EditPlacementComponent,
    PlacementAdminComponent,
    PlacementCardviewComponent,
    PlacementTableviewComponent,
    PlacementListComponent,
    PlacementEnquiryComponent,
    WhatsappActivityComponent
  ],
  imports: [
    MatDividerModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    BrowserAnimationsModule,
    EditorModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogTitle, 
    MatDialogContent,
    MatDialogModule,
    MatFormFieldModule,
     MatInputModule, 
     MatSlideToggleModule,
     MatDatepickerModule, 
     MatNativeDateModule,
     MatRadioModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSortModule,
    MatCardModule,
    NgxEditorModule.forRoot({
      locals: {
        // menu
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        blockquote: 'Blockquote',
        underline: 'Underline',
        strike: 'Strike',
        bullet_list: 'Bullet List',
        ordered_list: 'Ordered List',
        heading: 'Heading',
        h1: 'Header 1',
        h2: 'Header 2',
        h3: 'Header 3',
        h4: 'Header 4',
        h5: 'Header 5',
        h6: 'Header 6',
        align_left: 'Left Align',
        align_center: 'Center Align',
        align_right: 'Right Align',
        align_justify: 'Justify',
        text_color: 'Text Color',
        background_color: 'Background Color',

        // popups, forms, others...
        url: 'URL',
        text: 'Text',
        openInNewTab: 'Open in new tab',
        insert: 'Insert',
        altText: 'Alt Text',
        title: 'Title',
        remove: 'Remove',
      },
    }),
    ToastrModule.forRoot({
      positionClass: 'toast-top-right'
    }),
    NgxSkeletonLoaderModule.forRoot()
  ],
  providers: [
    authGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
