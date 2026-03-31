import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TagsService, TagModel} from '../../services/tags.service';
import {WorkspaceStateService} from '../../../services/workspace/workspace-state.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-tags-management-dialog',
  templateUrl: './tags-management-dialog.component.html',
  styleUrl: './tags-management-dialog.component.scss',
})
export class TagsManagementDialogComponent implements OnInit {
  tags: TagModel[] = [];
  isLoading = false;
  editingTagId: number | null = null;
  editName = '';
  editColor = '';

  constructor(
    public dialogRef: MatDialogRef<TagsManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Failed to load tags.', 'Close', {duration: 3000});
        },
      });
    }
  }

  startEdit(tag: TagModel): void {
    this.editingTagId = tag.id;
    this.editName = tag.name;
    this.editColor = tag.color || '#E8EAED';
  }

  cancelEdit(): void {
    this.editingTagId = null;
    this.editName = '';
    this.editColor = '';
  }

  saveEdit(tag: TagModel): void {
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId && this.editName.trim()) {
      // We need updateTag in TagsService too!
      // Let's assume it exists or add it!
      this.tagsService
        .updateTag(workspaceId, tag.id, this.editName, this.editColor)
        .subscribe({
          next: () => {
            this.snackBar.open(`Tag "${this.editName}" updated.`, 'Close', {
              duration: 3000,
            });
            this.editingTagId = null;
            this.loadTags();
          },
          error: () => {
            this.snackBar.open('Failed to update tag.', 'Close', {
              duration: 3000,
            });
          },
        });
    }
  }

  deleteTag(tag: TagModel): void {
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId) {
      this.tagsService.deleteTag(workspaceId, tag.id).subscribe({
        next: () => {
          this.snackBar.open(`Tag "${tag.name}" deleted.`, 'Close', {
            duration: 3000,
          });
          this.loadTags();
        },
        error: () => {
          this.snackBar.open('Failed to delete tag.', 'Close', {
            duration: 3000,
          });
        },
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
