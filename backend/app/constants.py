from enum import Enum


class ExpenseType(str, Enum):
    NEED = "need"
    WANT = "want"


class AssetType(str, Enum):
    STOCK = "stock"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"
    GOLD = "gold"
    SILVER = "silver"
    FD = "fd"
    PPF = "ppf"
    NPS = "nps"
    CRYPTO = "crypto"
    BOND = "bond"


class LoanType(str, Enum):
    HOME = "home"
    CAR = "car"
    EDUCATION = "education"
    PERSONAL = "personal"
    OTHER = "other"


class TradeDirection(str, Enum):
    LONG = "long"
    SHORT = "short"


DEFAULT_EXPENSE_CATEGORIES = [
    ("Rent", ExpenseType.NEED),
    ("Food", ExpenseType.NEED),
    ("Groceries", ExpenseType.NEED),
    ("Electricity", ExpenseType.NEED),
    ("Water", ExpenseType.NEED),
    ("Gas", ExpenseType.NEED),
    ("Insurance", ExpenseType.NEED),
    ("Medical", ExpenseType.NEED),
    ("Fuel", ExpenseType.NEED),
    ("Internet", ExpenseType.NEED),
    ("Education", ExpenseType.NEED),
    ("Movies", ExpenseType.WANT),
    ("Restaurants", ExpenseType.WANT),
    ("Shopping", ExpenseType.WANT),
    ("Travel", ExpenseType.WANT),
    ("Electronics", ExpenseType.WANT),
    ("Subscriptions", ExpenseType.WANT),
    ("Entertainment", ExpenseType.WANT),
    ("Gaming", ExpenseType.WANT),
]

DEFAULT_INCOME_CATEGORIES = [
    "Salary",
    "Freelancing",
    "Dividends",
    "Interest",
    "Other",
]
