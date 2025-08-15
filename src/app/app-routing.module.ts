import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './controller/home/home.component';
import { BlogComponent } from './controller/blog/blog.component';
import { CareerComponent } from './controller/career/career.component';
import { ServicesComponent } from './controller/services/services.component';
import { TrainingComponent } from './controller/training/training.component';
import { ContactComponent } from './controller/contact/contact.component';
import { LoginComponent } from './controller/login/login.component';
import { DashboardComponent } from './controller/dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { ServiceAdminComponent } from './controller/service-admin/service-admin.component';
import { TrainingAdminComponent } from './controller/training-admin/training-admin.component';
import { EditTrainingComponent } from './controller/edit-training/edit-training.component';
import { AddTrainingComponent } from './controller/add-training/add-training.component';
import { AddServicesComponent } from './controller/add-services/add-services.component';
import { EditServicesComponent } from './controller/edit-services/edit-services.component';
import { AddBlogComponent } from './controller/add-blog/add-blog.component';
import { BlogAdminComponent } from './controller/blog-admin/blog-admin.component';
import { EditBlogComponent } from './controller/edit-blog/edit-blog.component';
import { BlogDetailsComponent } from './controller/blog-details/blog-details.component';
import { TrainingDetailComponent } from './controller/training-detail/training-detail.component';
import { RegistrationComponent } from './controller/registration/registration.component';
import { ContactAdminComponent } from './controller/contact-admin/contact-admin.component';
import { GeneralAdminComponent } from './controller/general-admin/general-admin.component';
import { AddGeneralComponent } from './controller/add-general/add-general.component';
import { EditGeneralComponent } from './controller/edit-general/edit-general.component';
import { TermsConditionsComponent } from './controller/terms-conditions/terms-conditions.component';
import { PrivacyPolicyComponent } from './controller/privacy-policy/privacy-policy.component';
import { LogoutComponent } from './controller/logout/logout.component';
import { ListAdminComponent } from './controller/list-admin/list-admin.component';
import { TrainingLandingComponent } from './controller/training-landing/training-landing.component';
import { TrainingListComponent } from './controller/training-list/training-list.component';
import { EventsComponent } from './components/events/events.component';
import { IotComponent } from './components/iot/iot.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { PlacementAdminComponent } from './controller/placement-admin/placement-admin.component';
import { PlacementCardviewComponent } from './components/placement-cardview/placement-cardview.component';
import { PlacementTableviewComponent } from './components/placement-tableview/placement-tableview.component';
import { EditPlacementComponent } from './controller/edit-placement/edit-placement.component';
import { AddPlacementComponent } from './controller/add-placement/add-placement.component';
import { PlacementListComponent } from './controller/placement-list/placement-list.component';
import { PlacementComponent } from './controller/placement/placement.component';
import { WhatsappActivityComponent } from './components/whatsapp-activity/whatsapp-activity.component';
import { TemplateManagerComponent } from './components/template-manager/template-manager.component';
import { UserRegisterComponent } from './controller/user-register/user-register.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'blog', component: BlogComponent },
  {path: 'app-blog-details/:id', component: BlogDetailsComponent},
  { path: 'app-training-detail/:id', component: TrainingDetailComponent },
  { path: 'career', component: CareerComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },
  {path:'training',component:TrainingComponent},
  { path: 'registration', component: RegistrationComponent},
  {path:'app-terms-conditions',component:TermsConditionsComponent},
  {path:'training-landing',component:TrainingLandingComponent},
  {path:'app-training-list/:id',component:TrainingListComponent},
  {path:'app-privacy-policy',component:PrivacyPolicyComponent},
  {path: 'events/:id', component:EventsComponent},
  {path: 'events-list', component: EventsListComponent},
  {path: 'iot', component: IotComponent},
  {path:'login',component:LoginComponent},
  { path: 'logout', component: LogoutComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'service-admin', component: ServiceAdminComponent, canActivate: [authGuard] },
  { path: 'training-admin', component: TrainingAdminComponent, canActivate: [authGuard] },
  { path: 'app-blog-admin', component: BlogAdminComponent, canActivate: [authGuard] },
  { path: 'app-general-admin', component: GeneralAdminComponent, canActivate: [authGuard]},
  { path: 'app-add-general', component: AddGeneralComponent, canActivate: [authGuard]},
  { path: 'app-edit-general/:id', component: EditGeneralComponent, canActivate: [authGuard]},
  { path: 'edit-training/:id', component: EditTrainingComponent, canActivate:[authGuard] },
  { path: 'app-add-training', component: AddTrainingComponent, canActivate: [authGuard] },
  {path: 'app-add-services', component: AddServicesComponent, canActivate: [authGuard]},
  {path: 'app-add-blog', component: AddBlogComponent, canActivate: [authGuard]},
  {path: 'app-edit-blog/:id', component: EditBlogComponent, canActivate: [authGuard]},
  {path: 'app-edit-services/:id', component: EditServicesComponent, canActivate: [authGuard]},
  {path: 'app-contact-admin', component: ContactAdminComponent, canActivate: [authGuard]},
  {path: 'app-list-admin', component: ListAdminComponent, canActivate: [authGuard]},
  {path: 'app-placement-admin', component: PlacementAdminComponent, canActivate: [authGuard]},
  {path: 'app-placement-cardview', component: PlacementCardviewComponent, canActivate: [authGuard]},
  {path: 'app-placement-tableview', component: PlacementTableviewComponent, canActivate: [authGuard]},
  {path: 'app-edit-placement', component: EditPlacementComponent, canActivate: [authGuard]},
  {path: 'app-add-placement', component: AddPlacementComponent, canActivate: [authGuard]},
  {path: 'app-placement-list', component: PlacementListComponent},
  {path:'app-placement/:id', component:PlacementComponent},
   { path:'whatsappactivity', component: WhatsappActivityComponent },
   { path:'whatsapptemplate', component: TemplateManagerComponent },
{path:'user-register',component:UserRegisterComponent},
  { path: '**', redirectTo: 'home' },
  
 

 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 
  
  
}
