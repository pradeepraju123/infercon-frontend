import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { ProcessedContact } from './upload-state.service';
@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl = 'https://api.inferconautomation.com/api/v1/contact';



  constructor(
    private http: HttpClient
  ) {}
  createContact(data: any): Observable<any> {
       const url = `${this.apiUrl}`;
       
       return this.http.post(url, data);
  }

//    createUser(data: any): Observable<any> {
//     const token = sessionStorage.getItem('authToken');
    
//     if (token) {
//         const headers = new HttpHeaders({
//             'Authorization': 'Bearer ' + token
//         });
//         return this.http.post(`${this.apiUrl}/create-with-creator`, data, { headers });
//     } else {
//         return throwError('No authentication token found');
//     }
// }

createWithCreator(contactData: any): Observable<any> {
  const token = sessionStorage.getItem('authToken') || '';
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.post(`${this.apiUrl}/create-with-creator`, contactData, { headers });
}


  getContactById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  getAllContact(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post(`${this.apiUrl}/get`, data, { headers });
  } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
  }

  downloadContact(data: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post(`${this.apiUrl}/download`, data, { headers });
  } else {
  //   // Handle the case where there's no token (e.g., user is not authenticated)
  //   // You can choose to return an error Observable or handle it in a way that suits your application.
     return throwError('No authentication token found'); // For example, using throwError from RxJS
    }
  }
  updateContactBulk(ids: string[], updateData: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/update-many`, { ids, updateData }, { headers });
        } else {
          //   // Handle the case where there's no token (e.g., user is not authenticated)
          //   // You can choose to return an error Observable or handle it in a way that suits your application.
             return throwError('No authentication token found'); // For example, using throwError from RxJS
            }
  }
  sendNotification(contact_ids: string[], fullname: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/send-notification`, { contact_ids, fullname }, { headers });
        } else {
          //   // Handle the case where there's no token (e.g., user is not authenticated)
          //   // You can choose to return an error Observable or handle it in a way that suits your application.
             return throwError('No authentication token found'); // For example, using throwError from RxJS
            }
  }
sendLeadNotification(staffName: string, staffMobile: string, leadName: string, leadEmail: string, leadPhone: string, leadCourse: string): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    
    const payload = {
      staff_name: staffName,
      staff_mobile: staffMobile,
      lead_name: leadName,
      lead_email: leadEmail,
      lead_phone: leadPhone,
      lead_course: leadCourse
    };
    
    return this.http.post<any>(`${this.apiUrl}/action/send-lead-notification`, payload, { headers });
  } else {
    return throwError('No authentication token found');
  }
}
  sendMessageToUser(contact_ids: string[], message: any) {
    const token = sessionStorage.getItem('authToken'); // Get the token from sessionStorage

    if (token) {
      //   // Set the headers with the bearer token
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token // Include the token in the request headers
          });
    return this.http.post<any>(`${this.apiUrl}/action/send-message`, { contact_ids, message }, { headers });
        } else {
          //   // Handle the case where there's no token (e.g., user is not authenticated)
          //   // You can choose to return an error Observable or handle it in a way that suits your application.
             return throwError('No authentication token found'); // For example, using throwError from RxJS
            }
  }
  
  updateContact(_id: string, data: any): Observable<any> {
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

  sendLeadDetailsToStaff(contact_ids: string[]): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<any>(`${this.apiUrl}/action/send-lead-details`, { contact_ids }, { headers });
  } else {
    return throwError('No authentication token found');
  }
}
// Add these methods to your ContactService class
getComments(contactId: string): Observable<any> {
  // const token = sessionStorage.getItem('authToken');
  // if (token) {
  //   const headers = new HttpHeaders({
  //     'Authorization': 'Bearer ' + token
  //   });
    return this.http.get(`${this.apiUrl}/contacts/${contactId}/comments`);
  
}

// In your contact.service.ts
addComment(contactId: string, comment: string, createdBy: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/contacts/${contactId}/comments`, {
    texts: comment,
    createdBy: createdBy
  });
}

createRegisteredContact(contactData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/`, contactData);
}
getRegisteredUsers(params?: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${this.apiUrl}/filter/registered`, params, { headers });
  } else {
    return throwError('No authentication token found');
  }
}

markAsRegistered(contactId:string):Observable<any>{
  return this.http.post(`${this.apiUrl}/${contactId}/mark-registered`,{})
}

filterByRegistrationStatus(params: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/filter-by-registration-status`, params)
    .pipe(
      catchError((error: any) => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
}
getNonRegisteredContacts(params?:any):Observable<any>{
  const token =sessionStorage.getItem('authToken')
  if (token){
    const headers = new HttpHeaders({
       'Authorization': 'Bearer ' + token
    });
    return this.http.post(`${this.apiUrl}//getUnregistration`,params,{headers})
  }
  else{
    return throwError('No authentication token found');
  }
}
onAssigneeSelect(selectedAssignee: string, itemId: string): Observable<any> {
  const body = { selectedAssignee, itemId };
  return this.http.post<any>(`${this.apiUrl}/action/on-assignee-select`, body)
    .pipe(
      catchError((error: any) => {
        console.error('Error in onAssigneeSelect:', error);
        return throwError(() => error);
      })
    );
}
// Also ensure these notification methods exist:
getUserNotifications(userId: string): Observable<any> {
  return this.http.get<any>(`http://localhost:8081/api/v1/notification/user/${userId}`).pipe(
    catchError((error: any) => {
      console.error('API Error:', error);
      return throwError(() => error);
    })
  );
}
markNotificationAsRead(notificationId: string) {
  return this.http.patch<any>(`http://localhost:8081/api/v1/notification/${notificationId}/read`, {}).pipe(
    catchError((error: any) => {
      console.error('API Error:', error);
      return throwError(() => error);
    })
  );
}
markAllNotificationsAsRead(userId: string) {
  return this.http.patch<any>(`http://localhost:8081/api/v1/notification/user/${userId}/read-all`, {}).pipe(
    catchError((error: any) => {
      console.error('API Error:', error);
      return throwError(() => error);
    })
  );
}
getUnreadCount(userId: string) {
  return this.http.get<any>(`http://localhost:8081/api/v1/notification/unread-count/${userId}`).pipe(
    catchError((error: any) => {
      console.error('API Error:', error);
      return throwError(() => error);
    })
  );
}
softDeleteContact(contactId: string): Observable<any> {
  const token =sessionStorage.getItem('authToken')
  if (token){
    const headers = new HttpHeaders({
       'Authorization': 'Bearer ' + token
    });
    return this.http.delete(`${this.apiUrl}/${contactId}/soft-delete`,{headers})
  }
  else{
    return throwError('No authentication token found');
  }
}
restoreContact(contactId: string): Observable<any> {
  const token =sessionStorage.getItem('authToken')
  if (token){
    const headers = new HttpHeaders({
       'Authorization': 'Bearer ' + token
    });
    return this.http.patch(`${this.apiUrl}/${contactId}/restore`,{headers})
  }
  else{
    return throwError('No authentication token found');
  }
}

getFollowupLeads(params: any): Observable<any> {
  const token =sessionStorage.getItem('authToken')
  if (token){
    const headers = new HttpHeaders({
       'Authorization': 'Bearer ' + token
    });
  return this.http.post<any>(`${this.apiUrl}/followup-leads`, params,{headers});
}
else{
    return throwError('No authentication token found');
  }
}

getFinalizedLeads(params: any): Observable<any> {
   const token =sessionStorage.getItem('authToken')
  if (token){
    const headers = new HttpHeaders({
       'Authorization': 'Bearer ' + token
    });
  return this.http.post(`${this.apiUrl}/finalized`, params,{headers});
}
else{
    return throwError('No authentication token found');
  }
}
uploadExcel(formData: FormData): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(`${this.apiUrl}/action/excelupload`, formData, { headers });
}

saveProcessedContacts(processedData: ProcessedContact[]): Observable<ProcessedContact[]> {
  const token = sessionStorage.getItem('authToken') || '';
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.post<ProcessedContact[]>(`${this.apiUrl}/save-processed-contacts`, processedData, { headers });
}

getProcessedContacts(params?: any): Observable<ProcessedContact[]> {
  const token = sessionStorage.getItem('authToken') || '';
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.post<ProcessedContact[]>(`${this.apiUrl}/get-processed-contacts`, params || {}, { headers });
}


getExcelUploadedContacts(params?: any): Observable<any> {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    // Send parameters in request body for POST request
    return this.http.post(`${this.apiUrl}/get/excelupload`, params || {}, { headers });
  } else {
    return throwError('No authentication token found');
  }
}

}




