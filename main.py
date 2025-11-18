from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload 
from sqlalchemy import select
from contextlib import asynccontextmanager
from .database import get_db, init_db
from .models import Novel, Character
from .schemas import NovelBase, NovelRead, CharacterCreate, CharacterBase
from sqlalchemy import select

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database initialized")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # add website or just do "*" since it's local prob safe idk
    allow_origins = ["https://xyzscans.com", "null"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)


@app.get("/novels/", response_model=list[NovelBase])
def get_list_of_novels(db: Session = Depends(get_db)):
    result = db.execute(select(Novel))
    novels = result.scalars().all()

    if not novels:
        return []

    return novels 

@app.get("/novel/")
def reject_novel_base_path():
    raise HTTPException(
        status_code=400,
        detail="Invalid endpoint. Use /novels/ for list or /novel/{slug} for single novel."
    )

@app.get("/novel/{slug}", response_model=NovelRead)
def get_specifi_novel(slug: str, session: Session = Depends(get_db)):
    result = session.execute(
        select(Novel)
        .where(Novel.slug == slug)
        .options(selectinload(Novel.characters))
    )
    novel = result.scalar_one_or_none()
    
    if not novel:
        raise HTTPException(404, "Novel not found.")
    return novel

@app.post("/novel/{slug}/add_character", response_model=CharacterBase)
def add_character(slug: str, character: CharacterCreate, session: Session = Depends(get_db)):
    
    result = session.execute(select(Novel).where(Novel.slug == slug))
    novel = result.scalar_one_or_none()

    if not novel:
        raise HTTPException(404, "Novel not found.")

    existing = session.execute(
        select(Character).where(
            Character.name == character.name, 
            Character.novel_id == novel.id
        )
    ).scalar_one_or_none()

    if existing:
        if character.description:
            existing.description = character.description
            session.commit()
            session.refresh(existing)
        return existing

    new_character = Character(
        name=character.name, 
        description=character.description, 
        novel_id=novel.id
    )
    session.add(new_character)
    session.commit()
    session.refresh(new_character)
    return new_character