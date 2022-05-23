from enum import Enum
from typing import Optional

from fastapi import FastAPI, Query
from pydantic import BaseModel
import redis


class Status(int, Enum):
    PENDING = 1
    SUCCESS = 2
    FAILED = 3


class FibResponse(BaseModel):
    status: Status
    value: Optional[int]


r = redis.Redis(host="worker-queue", port=6379)


app = FastAPI()


@app.get("/fib", response_model=FibResponse)
def get_fib_value(n: int = Query(..., le=40)):
    value: Optional[str] = r.hget("fib_values", n)

    if value is None:
        r.rpush("queue:process_fib", n)
        return {"status": Status.PENDING}

    return {"status": Status.SUCCESS, "value": value}
