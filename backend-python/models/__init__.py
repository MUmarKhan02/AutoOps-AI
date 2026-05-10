from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models so Base.metadata knows about them
from models.user import User  # noqa
from models.document import Document  # noqa
from models.job import ProcessingJob, ProcessingResult  # noqa
