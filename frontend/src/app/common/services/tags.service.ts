import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

export interface TagModel {
  id: number;
  name: string;
  workspaceId: number;
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private apiUrl = `${environment.backendURL}/tags`;

  constructor(private http: HttpClient) {}

  getTags(workspaceId: number, search?: string): Observable<TagModel[]> {
    let url = `${this.apiUrl}?workspace_id=${workspaceId}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<TagModel[]>(url);
  }

  createTag(workspaceId: number, name: string): Observable<TagModel> {
    return this.http.post<TagModel>(`${this.apiUrl}`, {
      name,
      workspace_id: workspaceId,
    });
  }

  deleteTag(workspaceId: number, tagId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${tagId}?workspace_id=${workspaceId}`,
    );
  }

  updateTag(
    workspaceId: number,
    tagId: number,
    name?: string,
    color?: string,
  ): Observable<TagModel> {
    const body: any = {};
    if (name) body.name = name;
    if (color) body.color = color;
    return this.http.put<TagModel>(
      `${this.apiUrl}/${tagId}?workspace_id=${workspaceId}`,
      body,
    );
  }

  bulkAssign(
    workspaceId: number,
    itemIds: number[],
    itemType: string,
    tagIds: number[],
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bulk-assign`, {
      workspace_id: workspaceId,
      item_ids: itemIds,
      item_type: itemType,
      tag_ids: tagIds,
    });
  }
}
