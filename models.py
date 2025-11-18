from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, Text
from .database import Base

class Novel(Base):
    __tablename__ = "novels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String, unique=True, index=True)

    characters: Mapped[list["Character"]] = relationship("Character", back_populates="novel")

class Character(Base):
    __tablename__ = "characters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(Text)
    novel_id: Mapped[int] = mapped_column(ForeignKey("novels.id"))

    novel: Mapped["Novel"] = relationship("Novel", back_populates="characters")