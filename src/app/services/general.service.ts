import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  private apiUrl = 'http://localhost:8081/api/v1/general-data';

  constructor(
    private http: HttpClient,
    private authService : AuthService
  ) {}
  
getAllGeneraldata(): Observable<any> {
      return this.http.get<any>(this.apiUrl);
    }
  
getGeneralDataByType(data: any): Observable<any> {
  const url = `${this.apiUrl}/list`;
  return this.http.post(url, data, {})
}
getGeneraldata(_id: string): Observable<any> {
      const url = `https://api.inferconautomation.com/api/v1/general-data/${_id}`;
      return this.http.get(url).pipe(
        map((response: any) => response.data) // Extract the 'data' property from the response
      );
    }
createGeneraldata(data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage
  const userType = this.authService.getUserTypeFromToken(token);
  console.log("user type", userType)
  if (token && userType === 'admin') {
  //   // Set the headers with the bearer token
  const headers = new HttpHeaders({
    'Authorization': 'Bearer ' + token // Include the token in the request headers
     });
     const url = `${this.apiUrl}`;
     return this.http.post(url, data, { headers });
   } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
}
updateGeneraldata(_id: string, data: any): Observable<any> {
  const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
    //   // Set the headers with the bearer token
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token // Include the token in the request headers
       });
  
       const url = `${this.apiUrl}/${_id}`;
       return this.http.post(url, data, { headers });
     } else {
    //   // Handle the case where there's no token (e.g., user is not authenticated)
    //   // You can choose to return an error Observable or handle it in a way that suits your application.
       return throwError('No authentication token found'); // For example, using throwError from RxJS
     }
}
deleteGeneral(id: string): Observable<any> {
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
