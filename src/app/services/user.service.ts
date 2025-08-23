import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { User } from './user.model'
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/v1/users';
  constructor(
    private http: HttpClient,
    private authService: AuthService // Inject your authentication service
  ) {}
  getAllUsers(): Observable<User[]> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage
    if (token) {
      // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
      });
      // Pass the headers as the second argument in the request
      return this.http.get<User[]>(this.apiUrl, { headers });
    } else {
      // Handle the case where there's no token (e.g., user is not authenticated)
      // You can choose to return an error Observable or handle it in a way that suits your application.
      return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
}
getAllUsersPost(data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage
  if (token) {
    // Set the headers with the bearer token
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token // Include the token in the request headers
    });
    // Pass the headers as the second argument in the request
    return this.http.post<any>(`${this.apiUrl}/all`, data, { headers });
  } else {
    // Handle the case where there's no token (e.g., user is not authenticated)
    // You can choose to return an error Observable or handle it in a way that suits your application.
    return throwError('No authentication token found'); // For example, using throwError from RxJS
  }
}
getUserById(id: string): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage
  if (token) {
    // Set the headers with the bearer token
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token // Include the token in the request headers
    });
  return this.http.get(`${this.apiUrl}/${id}`, { headers});
} else {
  // Handle the case where there's no token (e.g., user is not authenticated)
  // You can choose to return an error Observable or handle it in a way that suits your application.
  return throwError('No authentication token found'); // For example, using throwError from RxJS
}
}
updateUser(_id: string, data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  const userType = this.getUserTypeFromToken(token);
  if (token && userType === 'admin') {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    const url = `${this.apiUrl}/${_id}`;
    return this.http.post(url, data, { headers });
  } else {
    return throwError('No authentication token found or user is not an admin');
  }
}
addUser( data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  const userType = this.getUserTypeFromToken(token);
  if (token && userType === 'admin') {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(this.apiUrl, data, { headers });
  } else {
    return throwError('No authentication token found or user is not an admin');
  }
}
private getUserTypeFromToken(token: string | null): string | null {
  // Parse the token and extract the userType
  // Replace this with your actual token decoding logic
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.userType || null;
  }
  return null;
}
// Fetch dashboard data (followups + new enrollments)
getDashboardData(params?: {
  followupPage?: number;
  followupLimit?: number;
  newEnrollmentPage?: number;
  newEnrollmentLimit?: number;
}): Observable<{
  data: {
    followupLeads: any[],
    newEnrollments: any[],
    followupPagination?: {
      total: number,
      currentPage: number,
      totalPages: number
    },
    newEnrollmentPagination?: {
      total: number,
      currentPage: number,
      totalPages: number
    },
    trainingStats?: {
      totalLeads: number,
      registeredLeads: number,
      paidLeads: number,
      rejectedLeads: number
    }
  }
}> {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    // Convert params to query string parameters
    const queryParams: any = {};
    if (params) {
      if (params.followupPage) queryParams.followupPage = params.followupPage;
      if (params.followupLimit) queryParams.followupLimit = params.followupLimit;
      if (params.newEnrollmentPage) queryParams.newEnrollmentPage = params.newEnrollmentPage;
      if (params.newEnrollmentLimit) queryParams.newEnrollmentLimit = params.newEnrollmentLimit;
    }
    return this.http.get<any>('http://localhost:8081/api/v1/dashboard', {
      headers,
      params: queryParams
    });
  } else {
    return throwError(() => 'No authentication token found');
  }
}
}