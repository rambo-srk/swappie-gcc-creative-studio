import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TagsService, TagModel} from '../../services/tags.service';
import {WorkspaceStateService} from '../../../services/workspace/workspace-state.service';

@Component({
  selector: 'app-assign-tags-dialog',
  templateUrl: './assign-tags-dialog.component.html',
  styleUrls: ['./assign-tags-dialog.component.scss'],
})
export class AssignTagsDialogComponent implements OnInit {
  availableTags: TagModel[] = [];
  selectedTags: string[] = [];
  newTagName = '';

  constructor(
    public dialogRef: MatDialogRef<AssignTagsDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {assetId: number; assetType: string; existingTags: string[]},
    private tagsService: TagsService,
    private workspaceStateService: WorkspaceStateService,
  ) {
    this.selectedTags = [...(data.existingTags || [])];
  }

  ngOnInit(): void {
    const workspaceId = this.workspaceStateService.getActiveWorkspaceId();
    if (workspaceId) {
      this.tagsService.getTags(workspaceId).subscribe(tags => {
        this.availableTags = tags;
      });
    }
  }

  toggleTag(tagName: string): void {
    const index = this.selectedTags.indexOf(tagName);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tagName);
    }
  }

  isSelected(tagName: string): boolean {
    return this.selectedTags.includes(tagName);
  }

  isNotAvailable(tagName: string): boolean {
    return !this.availableTags.some(t => t.name === tagName);
  }

  addTag(): void {
    if (this.newTagName.trim()) {
      const tagName = this.newTagName.trim();
      if (!this.selectedTags.includes(tagName)) {
        this.selectedTags.push(tagName);
      }
      this.newTagName = '';
    }
  }

  onSave(): void {
    this.dialogRef.close(this.selectedTags);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
