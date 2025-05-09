from typing import List, Optional
from backend.models.budget import BudgetItem, BudgetItemCreate, BudgetResponse

# Dummy in-memory data
_dummy_budget = {
    "May 2025": [
        BudgetItem(id=1, amount=37882.4, type="Salary", section="income"),
        BudgetItem(id=2, amount=-14947.11, type="Rent", section="bills"),
        BudgetItem(id=3, amount=-80.95, type="Streaming", section="subscriptions"),
        BudgetItem(id=4, amount=-1500.0, type="Stocks", section="investments"),
    ]
}


def get_budget(month: Optional[str] = None) -> BudgetResponse:
    m = month or "May 2025"
    items = _dummy_budget.get(m, [])
    return BudgetResponse(month=m, items=items)


def create_budget(item: BudgetItemCreate) -> BudgetItem:
    month = "May 2025"
    items = _dummy_budget.setdefault(month, [])
    new_id = max([i.id for i in items] + [0]) + 1
    budget_item = BudgetItem(id=new_id, amount=item.amount, type=item.type, section=item.section)
    items.append(budget_item)
    return budget_item


def update_budget(item_id: int, item: BudgetItem) -> BudgetItem:
    month = "May 2025"
    items = _dummy_budget.get(month, [])
    for idx, i in enumerate(items):
        if i.id == item_id:
            items[idx] = item
            return item
    raise ValueError("Item not found")


def delete_budget(item_id: int):
    month = "May 2025"
    items = _dummy_budget.get(month, [])
    for idx, i in enumerate(items):
        if i.id == item_id:
            del items[idx]
            return {"ok": True}
    raise ValueError("Item not found") 