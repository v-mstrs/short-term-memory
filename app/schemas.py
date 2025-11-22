from typing import Optional
from pydantic import BaseModel, Field

# ------ Character Schemas ------ 
class CharacterBase(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None

class CharacterCreate(CharacterBase):
    pass

class CharacterRead(CharacterBase):
    pass

class CharacterBatchCreate(BaseModel):
    characters: list[CharacterCreate]

# ------ Novel Schemas ------
class NovelBase(BaseModel):
    title: str
    slug: str

class NovelRead(NovelBase):
    characters: list[CharacterRead] = Field(default_factory=list)