from sqlalchemy.orm import Session
from sqlalchemy import select
from .models import Character
from .schemas import CharacterCreate

def create_or_update_character(novel_id: int, char_data: CharacterCreate, session: Session):
    existing = session.execute(
        select(Character).where(
            Character.name == char_data.name,
            Character.novel_id == novel_id
        )
    ).scalar_one_or_none()

    if existing:
        updated = False

        if char_data.description is not None:
            existing.description = char_data.description
            updated = True

        if char_data.image_url is not None:
            existing.image_url = char_data.image_url
            updated = True

        if updated:
            session.add(existing)

        return existing

    new_char = Character(
        name=char_data.name,
        description=char_data.description,
        image_url=char_data.image_url,
        novel_id=novel_id
    )

    session.add(new_char)
    return new_char
