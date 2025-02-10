import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Detail {
  title: string;
  detail: string;
  _id: { $oid: string };
}

interface FormattedData {
  type_detail: string;
  super_title: string;
  super_description: string;
  details: Detail[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  fetchAdditionalDetails(slug: string): Observable<any> {
    return this.http.get<any>(`/api/training/${slug}`);
  }

  formatData(additionalDetails: any[]): Record<string, FormattedData> {
    const groupedData: Record<string, FormattedData> = {};
    
    additionalDetails.forEach(({ type_detail, super_title, super_description, title, detail, _id }) => {
      if (!groupedData[type_detail]) {
        groupedData[type_detail] = {
          type_detail,
          super_title: super_title || "Default Title",
          super_description: super_description || "Default Description",
          details: [],
        };
      }
      groupedData[type_detail].details.push({ title, detail, _id });
    });

    return groupedData;
  }
}
