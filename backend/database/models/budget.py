from sqlalchemy import Column, Integer, Float, String
from backend.database.config.config import Base

class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    type = Column(String(100), nullable=False)
    section = Column(String(50), nullable=False)  # e.g., 'income', 'bills', etc.
    month = Column(String(20), nullable=False)  # e.g., 'May 2025'

    def __repr__(self):
        return f"<BudgetItem(id={self.id}, amount={self.amount}, type='{self.type}', section='{self.section}', month='{self.month}')>" 