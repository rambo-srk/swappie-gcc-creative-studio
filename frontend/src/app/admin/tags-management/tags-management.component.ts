import {Component, OnInit} from '@angular/core';
import {TagsService, TagModel} from '../../common/services/tags.service';
import {WorkspaceStateService} from '../../services/workspace/workspace-state.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-tags-management',
  templateUrl: './tags-management.component.html',
  styleUrls: ['./tags-management.component.scss'],
})
export class TagsManagementComponent implements OnInit {
  tags: TagModel[] = [];
  newTagName = '';
  isLoading = false;

  constructor(
    private tagsService: TagsService,
    private workspaceStateService: WorkspaceStateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId) {
      this.isLoading = true;
      this.tagsService.getTags(workspaceId).subscribe({
        next: tags => {
          this.tags = tags;
          this.isLoading = false;
        },
        error: err => {
          console.error('Failed to load tags', err);
          this.snackBar.open('Failed to load tags', 'Close', {duration: 3000});
          this.isLoading = false;
        },
      });
    }
  }

  createTag(): void {
    if (!this.newTagName.trim()) return;
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId) {
      this.tagsService
        .createTag(workspaceId, this.newTagName.trim())
        .subscribe({
          next: tag => {
            this.tags.push(tag);
            this.newTagName = '';
            this.snackBar.open('Tag created successfully', 'Close', {
              duration: 3000,
            });
          },
          error: err => {
            console.error('Failed to create tag', err);
            this.snackBar.open('Failed to create tag', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  deleteTag(tagId: number): void {
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId) {
      this.tagsService.deleteTag(workspaceId, tagId).subscribe({
        next: () => {
          this.tags = this.tags.filter(t => t.id !== tagId);
          this.snackBar.open('Tag deleted successfully', 'Close', {
            duration: 3000,
          });
        },
        error: err => {
          console.error('Failed to delete tag', err);
          this.snackBar.open('Failed to delete tag', 'Close', {duration: 3000});
        },
      });
    }
  }
}
