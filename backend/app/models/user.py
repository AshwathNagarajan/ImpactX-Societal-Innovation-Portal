from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    INSTITUTE = "INSTITUTE"
    INDUSTRY = "INDUSTRY"


USER_COLLECTION = "users"
