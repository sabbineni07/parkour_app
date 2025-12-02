import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Dataset {
  dataset_id: string;
  dataset_name: string;
  dataset_type: string;
  layer: string;
  upstream_dependencies: string[];
  status: string;
  created_ts?: string;
  updated_ts?: string;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5001/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  setToken(token: string): void {
    sessionStorage.setItem('access_token', token);
  }

  removeToken(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
  }

  // Authentication endpoints
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(userData: Partial<User>): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/auth/profile`, userData, {
      headers: this.getHeaders()
    });
  }

  // Datasets endpoints
  getDatasets(params?: {
    status?: string;
    dataset_type?: string;
    layer?: string;
    page?: number;
    per_page?: number;
  }): Observable<DatasetsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<DatasetsResponse>(`${this.apiUrl}/datasets`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  getDataset(datasetId: string): Observable<{ dataset: Dataset }> {
    return this.http.get<{ dataset: Dataset }>(`${this.apiUrl}/datasets/${datasetId}`, {
      headers: this.getHeaders()
    });
  }

  createDataset(dataset: Partial<Dataset>): Observable<{ message: string; dataset: Dataset }> {
    return this.http.post<{ message: string; dataset: Dataset }>(`${this.apiUrl}/datasets`, dataset, {
      headers: this.getHeaders()
    });
  }

  updateDataset(datasetId: string, dataset: Partial<Dataset>): Observable<{ message: string; dataset: Dataset }> {
    return this.http.put<{ message: string; dataset: Dataset }>(`${this.apiUrl}/datasets/${datasetId}`, dataset, {
      headers: this.getHeaders()
    });
  }

  deleteDataset(datasetId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/datasets/${datasetId}`, {
      headers: this.getHeaders()
    });
  }
}

