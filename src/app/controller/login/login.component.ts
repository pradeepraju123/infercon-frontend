import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public username: string = '';
  public password: string = '';
  public errorMessage: string | null = null;
  public successMessage: string | null = null;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar, ) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        const token = response.access_token;
  
        // Use sessionStorage instead of localStorage
        sessionStorage.setItem('authToken', token);
  
        this.authService.setToken(response.access_token);
        this.errorMessage = null;
  
        // Check user type before navigating to the dashboard
        const userType = this.authService.getUserTypeFromToken(token);
        if (userType === 'admin' || userType === 'staff' ) {
          this.router.navigate(['dashboard']);
            this.successMessage = 'Login successfully';
            this.errorMessage = null;
            this.openSnackBar(this.successMessage)
        } else {
          this.authService.clearToken();
          this.errorMessage = 'You do not have permission to access the dashboard.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
        }
      },
      (error) => {
        if (error.status === 401 && error.error.message === 'Token expired') {
          this.authService.clearToken();
          this.errorMessage = 'Token expired. Please log in again.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
        } else {
          this.authService.clearToken();
          this.errorMessage = 'Login failed. Please check your credentials.';
          this.successMessage = null;
          this.openSnackBar(this.errorMessage)
        }
      }
    );
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', 
    {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  
}
