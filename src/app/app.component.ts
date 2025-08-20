import { Component,Renderer2, AfterViewInit, ElementRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('dropdownAnimation', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(-100%)' })),
      transition('visible => hidden', animate('300ms ease-out')),
      transition('hidden => visible', animate('300ms ease-in')),
    ]),
  ],
})
export class AppComponent implements AfterViewInit {
  title = 'infercon-angular-dev';
  currentYear: number = new Date().getFullYear();
  constructor(private router: Router,private renderer: Renderer2, private el: ElementRef, private authService : AuthService) {}
  ngAfterViewInit() {
    // Use Renderer2 to select the element and set focus
    const firstNavLink = this.el.nativeElement.querySelector('.nav-link');
    if (firstNavLink) {
      this.renderer.selectRootElement(firstNavLink).focus();
    }
  }
  getUserType(): string | null {
    const token = sessionStorage.getItem('authToken'); // Assuming this function exists in your authService
    return this.authService.getUserTypeFromToken(token);
  }
   // add a method to close the navbar toggle
   closeNavbar() {
    // find the toggle button element and trigger a click event to close the navbar
    const toggleButton = document.querySelector('.navbar-toggler');
    if (toggleButton) {
      toggleButton.dispatchEvent(new Event('click'));
    }
  }
  // add a method to listen for route changes and close the navbar
  listenForRouteChanges() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeNavbar();
      }
    });
  }
  // Inside your AppComponent class
  showNavbar(): boolean {
    // Check the current route to determine whether to show the navbar
    const currentRoute = this.router.url;
    return routesWithDefault.includes(currentRoute) || currentRoute.startsWith('/app-blog-details/') || currentRoute.startsWith('/app-training-detail/') || currentRoute.startsWith('/app-training-list');
  }
  showAlternateNavbar(): boolean {
  const currentRoute = this.router.url;
  // :red_circle: Hide navbar completely on login
  if (currentRoute === '/login') {
    return false;
  }
  return (
    routesWithoutDefault.includes(currentRoute) ||
    currentRoute.startsWith('/edit-training/') ||
    currentRoute.startsWith('/app-edit-services/') ||
    currentRoute.startsWith('/app-edit-blog/') ||
    currentRoute.startsWith('/app-edit-general/')
  );
}
  showFooter(): boolean {
  const currentRoute = this.router.url;
  // Hide footer only on login
  return currentRoute !== '/login';
}
}
const routesWithoutDefault = [
  '/login',
  '/dashboard',
  '/service-admin',
  '/training-admin',
  '/app-add-training',
  '/app-add-blog',
  '/app-blog-admin',
  '/app-add-services',
  '/app-contact-admin',
  '/app-add-general',
  '/app-general-admin',
  '/logout',
  '/app-list-admin',
  '/app-placement-admin',
  '/whatsappactivity',
  '/whatsapptemplate',
  '/app-user-register',
  '/installment'
];
const routesWithDefault = [
  '/home',
  '/services',
  '/training',
  '/blog',
  '/contact',
  '/career',
  '/testing',
  '/registration',
  '/app-privacy-policy',
  '/app-terms-conditions',
  '/training-landing',
  '/events-list',
  '/iot',
  '/app-placement-list'
];






