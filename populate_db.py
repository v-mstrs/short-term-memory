from app.database import SessionLocal, init_db
from app.models import Novel, Character

def seed_data():
    init_db()
    db = SessionLocal()
    
    try:
        from sqlalchemy import select
        existing = db.execute(
            select(Novel).where(Novel.slug == "the-great-heavenly-demon-sovereign")
        ).scalar_one_or_none()
        
        if existing:
            print("Novel already exists!")
            return
        
        novel = Novel(
            slug="the-great-heavenly-demon-sovereign",
            title="The Great Heavenly Demon Sovereign"
        )
        
        characters = [
            Character(name="Bu Zhanyang", description="Bu Eunsoul 'grandpa', the one who raised him.", novel=novel),
            Character(name="Hyeok Ryeon-eung", description="Chief Instructor in the island.", novel=novel),
            Character(name="Sa woo", description="Secret Head of Nangyang. The first teacher he had on the island.", novel=novel),
        ]
        
        db.add(novel)
        db.add_all(characters)
        db.commit()
        print("Data seeded successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()