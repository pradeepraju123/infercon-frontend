import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  
  private apiUrl = 'http://localhost:8081/api/v1/trainings';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inject your authentication service
  ) {}
  
  getAllTraining(
    data: any
  ): Observable<any> {
    // Make the API request
    return this.http.post(`${this.apiUrl}/all`, data);
  }
getTraining(_id: string): Observable<any> {
      const url = `${this.apiUrl}/${_id}`;
      return this.http.get(url).pipe(
        map((response: any) => response.data) // Extract the 'data' property from the response
      );
    }
getTrainingById(id: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    getTrainingByPublished(data: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/published`, data);
    }
  
  getTrainingByFeatured(): Observable<any> {
    return this.http.get(`${this.apiUrl}/featured`);
  }


getTrainingBySlug(slug: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/detail/${slug}`);
    }
SearchTrainingByTitle(q: string): Observable<any> {
  const url = `${this.apiUrl}/search?q=${q}`;
  return this.http.get(url).pipe(
    map((response: any) => response.data) // Extract the 'data' property from the response
  );
}
createTraining(data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  const userType = this.getUserTypeFromToken(token);

  if (token && userType === 'admin') {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    const url = `${this.apiUrl}`;
    return this.http.post(url, data, { headers });
  } else {
    return throwError('No authentication token found or user is not an admin');
  }
}

updateTraining(_id: string, data: any): Observable<any> {
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

private getUserTypeFromToken(token: string | null): string | null {
  // Parse the token and extract the userType
  // Replace this with your actual token decoding logic
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.userType || null;
  }
  return null;
}
deleteTraining(id: string): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token // Include the token in the request headers
       });
  const url = `${this.apiUrl}/${id}`; // Assuming you want to pass the ID in the URL
  
  return this.http.delete(url, { headers });
} else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
}
}
