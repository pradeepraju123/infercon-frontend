import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  template: `
    <div>
      <p>Logging out...</p>
    </div>
  `,
})
export class LogoutComponent {
  constructor(private authService: AuthService) {
    this.logout();
  }

  logout() {
    // Call the clearTokenAndNavigateToLogin method from the AuthenticationService
    this.authService.clearTokenAndNavigateToLogin();
  }
}
