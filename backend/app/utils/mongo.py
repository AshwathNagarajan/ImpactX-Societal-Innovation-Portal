from fastapi import HTTPException, status


def not_found(message: str):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"success": False, "message": message, "detail": None})


def bad_request(message: str):
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"success": False, "message": message, "detail": None})
