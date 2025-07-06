from pydantic import BaseModel

class PlaidItemOut(BaseModel):
    id: int
    item_id: str    

    model_config = {
        "from_attributes": True
    }
