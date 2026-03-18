---
name: ussd
description: "Africa's Talking USSD API for building interactive menu-driven mobile sessions accessible on any phone without internet — the dominant channel for rural and unbanked users across Africa"
metadata:
  languages: "python"
  versions: "2.0.2"
  revision: 1
  updated-on: "2026-03-10"
  source: community
  tags: "africastalking,ussd,africa,kenya,nigeria,ghana,offline,no-internet,mobile,interactive"
---
# Africa's Talking USSD API — Python

You are an Africa's Talking USSD expert. Help me build USSD applications using Africa's Talking webhook callbacks with Python (Flask/FastAPI).

USSD (Unstructured Supplementary Service Data) works on every mobile phone — no internet, no smartphone, no app required. A user dials a code like `*384*12345#` and gets interactive menus via their phone's dialler. It is the dominant self-service channel for banking, agriculture, and government services across Africa.

- **AT docs:** https://developers.africastalking.com/docs/ussd
- **Channel:** Telecom network → Africa's Talking → your HTTP callback → response → user's screen
- **Session lifetime:** ~180 seconds, up to ~182 chars per screen

## How USSD works (critical mental model)

AT sends an HTTP POST to your callback URL for **every user action**. Your server must:
1. Receive the POST
2. Determine session state from `sessionId` + `text`
3. Return a response string starting with `CON` (continue — show menu) or `END` (terminate session)

There is **no persistent connection**. All state lives in your server or database, keyed by `sessionId`.

## Callback payload

```
POST /ussd/callback
Content-Type: application/x-www-form-urlencoded

sessionId=ATSid_abc123&
serviceCode=*384*12345#&
phoneNumber=%2B254712345678&
networkCode=63902&
text=
```

| Field | Description |
|---|---|
| `sessionId` | Unique per dial. Use as your session key. |
| `serviceCode` | The USSD code dialled e.g. `*384*12345#` |
| `phoneNumber` | Caller in E.164 format |
| `networkCode` | Operator code e.g. `63902` = Safaricom Kenya |
| `text` | Cumulative user input, `*`-delimited. Empty on first request. |

## Response format

```
CON Your menu text here    # continue — user sees this, session stays open
END Thank you. Goodbye.    # end — session closes after displaying text
```

Max ~182 characters per response (varies by operator). Count carefully.

## Minimal Flask implementation

```python
from flask import Flask, request

app = Flask(__name__)

@app.route("/ussd/callback", methods=["POST"])
def ussd():
    session_id   = request.form["sessionId"]
    phone        = request.form["phoneNumber"]
    text         = request.form.get("text", "")

    # text is cumulative: "" → "1" → "1*2" → "1*2*3"
    parts = text.split("*") if text else []
    level = len(parts)

    if level == 0:
        response = (
            "CON Welcome to MyApp\n"
            "1. Check balance\n"
            "2. Buy airtime\n"
            "3. Exit"
        )

    elif parts[0] == "1":
        balance = get_balance(phone)  # your logic
        response = f"END Your balance is KES {balance:.2f}"

    elif parts[0] == "2":
        if level == 1:
            response = (
                "CON Enter amount (KES):\n"
                "1. 50\n"
                "2. 100\n"
                "3. Other"
            )
        elif level == 2:
            amounts = {"1": 50, "2": 100}
            if parts[1] in amounts:
                amount = amounts[parts[1]]
                buy_airtime(phone, amount)  # your logic
                response = f"END KES {amount} airtime sent to {phone}"
            elif parts[1] == "3":
                if level == 2:
                    response = "CON Enter amount in KES:"
                else:
                    try:
                        amount = int(parts[2])
                        buy_airtime(phone, amount)
                        response = f"END KES {amount} airtime sent."
                    except ValueError:
                        response = "END Invalid amount. Try again."
            else:
                response = "END Invalid choice."
        else:
            response = "END Invalid input."

    elif parts[0] == "3":
        response = "END Goodbye!"

    else:
        response = "END Invalid option. Please try again."

    return response, 200, {"Content-Type": "text/plain"}
```

## State management pattern (database-backed)

For production flows spanning multiple screens, store state in Redis or a DB:

```python
import json
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
SESSION_TTL = 300  # 5 minutes

def get_session(session_id: str) -> dict:
    data = r.get(f"ussd:{session_id}")
    return json.loads(data) if data else {}

def set_session(session_id: str, data: dict):
    r.setex(f"ussd:{session_id}", SESSION_TTL, json.dumps(data))

def clear_session(session_id: str):
    r.delete(f"ussd:{session_id}")


@app.route("/ussd/callback", methods=["POST"])
def ussd():
    session_id = request.form["sessionId"]
    phone      = request.form["phoneNumber"]
    text       = request.form.get("text", "")
    parts      = text.split("*") if text else []

    session = get_session(session_id)

    # On END responses, clear session
    def end(msg: str) -> tuple:
        clear_session(session_id)
        return f"END {msg}", 200, {"Content-Type": "text/plain"}

    def con(msg: str, **updates) -> tuple:
        session.update(updates)
        set_session(session_id, session)
        return f"CON {msg}", 200, {"Content-Type": "text/plain"}

    level = len(parts)

    if level == 0:
        return con(
            "Welcome to FarmerApp\n"
            "1. Today's prices\n"
            "2. Weather alert\n"
            "3. Register"
        )

    if parts[0] == "1":
        prices = get_market_prices()   # your data
        return end(f"Maize: KES {prices['maize']}/bag\nBeans: KES {prices['beans']}/bag")

    if parts[0] == "2":
        alert = get_weather_alert(phone)
        return end(alert or "No active alerts for your area.")

    if parts[0] == "3":
        if level == 1:
            return con("Enter your name:")
        if level == 2:
            return con("Enter your county:", name=parts[1])
        if level == 3:
            name   = session.get("name", parts[1])
            county = parts[2]
            register_farmer(phone, name, county)
            return end(f"Registered! Welcome {name} from {county}.")

    return end("Invalid option.")
```

## FastAPI implementation

```python
from fastapi import FastAPI, Form
from fastapi.responses import PlainTextResponse

app = FastAPI()

@app.post("/ussd/callback", response_class=PlainTextResponse)
async def ussd(
    sessionId:   str = Form(...),
    phoneNumber: str = Form(...),
    text:        str = Form(""),
    serviceCode: str = Form(""),
    networkCode: str = Form(""),
):
    parts = text.split("*") if text else []
    level = len(parts)

    if level == 0:
        return "CON Welcome\n1. Option A\n2. Option B"

    if parts[0] == "1":
        return "END You chose Option A."

    return "END Invalid choice."
```

## USSD menu design rules

```python
# Character budget: ~182 chars per screen (Safaricom = 182, Airtel = 160)
# Count before deploying:

def ussd_safe(text: str, limit: int = 160) -> bool:
    """True if text fits within USSD character limit."""
    # Strip CON /END prefix for counting
    body = text[4:] if text.startswith(("CON ", "END ")) else text
    return len(body) <= limit

# Good menu: short labels, numbered
GOOD = (
    "CON Chagua huduma:\n"   # "Select service" in Kiswahili
    "1. Bei za mazao\n"      # Crop prices
    "2. Hali ya hewa\n"      # Weather
    "3. Usajili"             # Register
)
print(len(GOOD) - 4, "chars")  # measure body

# Bad: verbose, eats char budget fast
BAD = (
    "CON Welcome to our agricultural advisory service platform. "
    "Please select from the following options below:\n"
    "1. View today's crop market prices\n"
    "2. Get weather forecast for your area"
)
```

## Bilingual menus (English + Kiswahili)

```python
MENUS = {
    "en": {
        "welcome": "CON Welcome\n1. Prices\n2. Weather\n3. Register",
        "prices":  "END Maize: KES {maize}/bag\nBeans: KES {beans}/bag",
    },
    "sw": {
        "welcome": "CON Karibu\n1. Bei\n2. Hali ya hewa\n3. Jiandikishe",
        "prices":  "END Mahindi: KES {maize}/mfuko\nMaharagwe: KES {beans}/mfuko",
    }
}

SWAHILI_NETWORKS = {"63902", "63903"}  # Safaricom, Airtel Kenya

def get_lang(network_code: str) -> str:
    # Default to Kiswahili for Kenyan networks
    return "sw" if network_code in SWAHILI_NETWORKS else "en"
```

## Triggering SMS from USSD (linked flow)

After a USSD session, send a confirmation SMS using the `linkId`:

```python
import africastalking

africastalking.initialize(username=os.environ["AT_USERNAME"], api_key=os.environ["AT_API_KEY"])
sms = africastalking.SMS

@app.route("/ussd/callback", methods=["POST"])
def ussd():
    session_id = request.form["sessionId"]
    phone      = request.form["phoneNumber"]
    text       = request.form.get("text", "")
    link_id    = request.form.get("linkId")  # present for premium/linked flows

    parts = text.split("*") if text else []

    if len(parts) == 2 and parts[0] == "1":
        # User confirmed — send SMS receipt
        if link_id:
            sms.send(
                message=f"Confirmed. Your reference: {session_id[-6:]}",
                recipients=[phone],
                link_id=link_id,
            )
        return "END Done. Check your SMS for confirmation.", 200, {"Content-Type": "text/plain"}

    return "CON Confirm?\n1. Yes\n2. No", 200, {"Content-Type": "text/plain"}
```

## Useful links

- API reference: https://developers.africastalking.com/docs/ussd
- Sandbox simulator: https://simulator.africastalking.com (test USSD flows)
- Dashboard: https://account.africastalking.com
- USSD code registration: contact Africa's Talking support
