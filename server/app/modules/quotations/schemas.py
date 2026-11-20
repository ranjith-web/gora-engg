from datetime import date as Date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class Model(BaseModel):
    # Accept camelCase from the React client (poNo) as well as snake_case (po_no).
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Recipient(Model):
    name: str = Field(..., examples=["M/s. MRF LTD.,"])
    address: str = Field("", examples=["Thiruvottiyur Plant, Purchase Dept, Chennai-600 019."])


class Drum(Model):
    code: str = ""
    size: str = ""
    number: str = ""
    po_no: str = ""
    po_date: Optional[Date] = None


class LineItem(Model):
    description: str
    amount: Decimal = Field(..., ge=0)


class Section(Model):
    title: str
    items: List[LineItem] = Field(..., min_length=1)


class Terms(Model):
    # Wrap text in **double asterisks** to make it bold.
    delivery: str = "Min 30 days and Max 60 days (**After getting your P.O)**"
    payment: str = "After dispatch, getting our payment Min 15 days and Max 30 days"
    gst: str = "18%"


class Quotation(Model):
    date: Date = Field(default_factory=Date.today)
    to: Recipient
    subject: str = Field(..., examples=["Repair of J28-15S570-736.6 (28”) T.B.DRUM"])
    drums: List[Drum] = []
    intro: str = (
        "We have glad to receive the work from the factory. "
        "Here we are quoting our lowest offer as follows"
    )
    sections: List[Section] = Field(..., min_length=1)
    terms: Terms = Terms()
    note: str = "All defective items will be returned."

    @property
    def total(self) -> Decimal:
        return sum((i.amount for s in self.sections for i in s.items), Decimal(0))

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "date": "2026-06-27",
                "to": {
                    "name": "M/s. MRF LTD.,",
                    "address": "Thiruvottiyur Plant, Purchase Dept, Chennai-600 019.",
                },
                "subject": "Repair of J28-15S570-736.6 (28”) T.B.DRUM",
                "drums": [
                    {"code": "J28-15S570-736.6", "size": "28”", "number": "027-10",
                     "poNo": "2200098743", "poDate": "2026-06-18"}
                ],
                "sections": [
                    {"title": "SPLITUP DETAILS", "items": [
                        {"description": "All Pins & Bushes Changing", "amount": 20000},
                        {"description": "Balls, Ball Seater & Springs Changing", "amount": 2500},
                        {"description": "T-Bolt 7/16” Damage Changing(110*48)", "amount": 5280},
                        {"description": "Cover Plate P.B.Bush Damage Correction", "amount": 4000},
                        {"description": "Moving Spider PH.B. Bush Damage Correction", "amount": 7250},
                        {"description": "Roller Link Pins& Bushes Changing", "amount": 3500},
                        {"description": "Shell Centre Step Damage Welding, Step Welding & Machining", "amount": 25000},
                        {"description": "Nylon Buffers Changing (Perno.250rs)250*4", "amount": 1000},
                        {"description": "Adapter Fixing Holes, Keyway Damage Welding, Machining, Holes Drilling and Tapping", "amount": 6000},
                        {"description": "Fixed Spider Keyway Damage Correction", "amount": 2750},
                        {"description": "Thrust Washer (PH.B. Bush) & Lock Ring Changing", "amount": 2000},
                        {"description": "Adapter Key Damage Welding & Milling", "amount": 4000},
                        {"description": "Final Drum Run out, Face out, Open Collapsing & Correction", "amount": 8000},
                        {"description": "Drum Servicing Charges", "amount": 20000},
                    ]},
                    {"title": "ADDITIONAL WORK", "items": [
                        {"description": "Drum Ball Coupling Thread Correction", "amount": 2000},
                        {"description": "Drum Segment Gap Correction", "amount": 3500},
                        {"description": "Drum Bore Correction", "amount": 6500},
                        {"description": "Drum Dowel Pin Holes Correction", "amount": 1750},
                        {"description": "Drum Segment Spring and Plate Washer", "amount": 1250},
                        {"description": "Drum Pin Holes Drilling Tapping", "amount": 2500},
                        {"description": "Spacer key permanent fixing", "amount": 5000},
                        {"description": "Grease Nipple Providing", "amount": 1000},
                        {"description": "Transportation Charges", "amount": 5000},
                    ]},
                ],
            }
        },
    )
