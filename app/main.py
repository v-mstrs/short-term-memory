from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload 
from sqlalchemy import select
from contextlib import asynccontextmanager
from .database import get_db, init_db
from .models import Novel, Character
from .schemas import NovelBase, NovelRead, CharacterCreate, CharacterBase, CharacterBatchCreate
from .helpers import create_or_update_character

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database initialized")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # add website or just do "*" since it's local prob safe idk
    allow_origins = ["https://novatls.com", "null"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)


@app.get("/", response_model=list[NovelBase])
def get_list_of_novels(db: Session = Depends(get_db)) -> list[NovelBase]:
    novels = db.execute(select(Novel)).scalars().all()

    if not novels:
        return []

    return novels 

@app.get("/{slug}", response_model=NovelRead)
def get_specific_novel(slug: str, session: Session = Depends(get_db)) -> NovelRead:
    novel = session.execute(
        select(Novel)
        .where(Novel.slug == slug)
        .options(selectinload(Novel.characters))
    ).scalar_one_or_none()
    
    if not novel:
        raise HTTPException(404, "Novel not found.")
    return novel

@app.post("/{slug}/characters", response_model=CharacterBase)
def add_character(slug: str, character: CharacterCreate, session: Session = Depends(get_db)) -> CharacterBase:
    
    novel = session.execute(
        select(Novel)
        .where(Novel.slug == slug)
    ).scalar_one_or_none()

    if not novel:
        raise HTTPException(404, "Novel not found.")

    result = create_or_update_character(novel.id, character, session)

    session.commit()
    session.refresh(result)

    return result

@app.post("/{slug}/characters/batch", response_model=list[CharacterBase])
def add_characters(slug: str, payload: CharacterBatchCreate, session: Session = Depends(get_db)) -> list[CharacterBase]:

    novel = session.execute(
        select(Novel)
        .where(Novel.slug == slug)
    ).scalar_one_or_none()

    if not novel:
        raise HTTPException(404, "Novel not found.")

    results = [
        create_or_update_character(novel.id, novel_char, session)
        for novel_char in payload.characters
    ]

    session.commit()

    for r in results:
        session.refresh(r)

    return results
