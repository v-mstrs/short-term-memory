from sqlalchemy.orm import Session
from sqlalchemy import select
from .models import Character
from .schemas import CharacterCreate

def create_or_update_character(novel_id: int, char_data: CharacterCreate, session: Session):
    existing_character = session.execute(
        select(Character).where(
            Character.name == char_data.name,
            Character.novel_id == novel_id
        )
    ).scalar_one_or_none()

    if existing_character:
        if char_data.description: 
            if existing_character.description:
                existing_character.description += "\n" + data.description
            else:
                existing_character = data.description

        if hasattr(data, "image_url") and data.image_url:
            existing_character.image_url = data.image_url

        return existing_character

    new_char = Character(
        name=char_data.name,
        description=char_data.description,
        image_url=char_data.image_url,
        novel_id=novel_id
    )

    session.add(new_char)
    return new_char
