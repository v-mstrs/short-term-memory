from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from .models import Character
from .schemas import CharacterCreate

def create_or_update_character(novel_id: int, char_data: CharacterCreate, session: Session) -> Character:
    existing_character: Optional[Character] = session.execute(
        select(Character).where(
            Character.name == char_data.name,
            Character.novel_id == novel_id
        )
    ).scalar_one_or_none() 

    if char_data.description is not None: 
        if char_data.mode == "overwrite":
            existing_character.description = char_data.description
        elif char_data.mode == "append":
            if existing_character.description:
                existing_character.description += "\n" + char_data.description
            else:
                existing_character.description = char_data.description

        if char_data.image_url:
            existing_character.image_url = char_data.image_url

        return existing_character

    new_char = Character(
        name=char_data.name,
        description=char_data.description,
        image_url=char_data.image_url,
        novel_id=novel_id
    )

    session.add(new_char)
    return new_char
