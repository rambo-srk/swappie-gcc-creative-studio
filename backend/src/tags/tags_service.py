# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from fastapi import Depends, HTTPException, status
from src.tags.dto.tags_dto import BulkAssignTagsDto, TagCreateDto, TagUpdateDto
from src.tags.repository.tags_repository import TagsRepository
from src.tags.schema.tags_model import TagModel


PASTEL_COLORS = [
    "#FADBD8", "#EBDEF0", "#E8F8F5", "#FEF9E7", "#FBEEE6",
    "#EAEDED", "#D4EFDF", "#FCF3CF", "#D6EAF8", "#F5CBA7",
    "#E6B0AA", "#D7BDE2", "#A2D9CE", "#F9E79F", "#EDBB99",
    "#D5D8DC", "#ABEBC6", "#FAD7A0", "#AED6F1", "#F1948A"
]

class TagsService:
    """Provides business logic for tag operations."""

    def __init__(self, repo: TagsRepository = Depends()):
        self.repo = repo

    async def list_tags(self, workspace_id: int | None = None, search: str | None = None) -> list[TagModel]:
        """Lists tags, optionally filtered by workspace and search query."""
        if workspace_id:
            return await self.repo.get_by_workspace(workspace_id, search)
        return await self.repo.find_all()

    async def create_tag(self, dto: TagCreateDto) -> TagModel:
        """Creates a new tag if it doesn't already exist."""
        existing = await self.repo.find_by_name(dto.name, dto.workspace_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tag with name '{dto.name}' already exists in this workspace.",
            )
            
        if not dto.color:
            count = await self.repo.count_by_workspace(dto.workspace_id)
            dto.color = PASTEL_COLORS[count % len(PASTEL_COLORS)]
            
        return await self.repo.create(dto)

    async def update_tag(self, id: int, dto: TagUpdateDto) -> TagModel:
        """Updates a tag."""
        updated = await self.repo.update_tag(id, dto.name, dto.color)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found",
            )
        return updated

    async def delete_tag(self, id: int) -> bool:
        """Deletes a tag by its ID."""
        return await self.repo.delete(id)

    async def bulk_assign(self, dto: BulkAssignTagsDto):
        """Bulk assigns tags to multiple items."""
        for item_id in dto.item_ids:
            for tag_id in dto.tag_ids:
                if dto.item_type == "media_item":
                    await self.repo.assign_tag_to_media_item(item_id, tag_id)
                elif dto.item_type == "source_asset":
                    await self.repo.assign_tag_to_source_asset(item_id, tag_id)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid item_type: {dto.item_type}",
                    )
        return True
