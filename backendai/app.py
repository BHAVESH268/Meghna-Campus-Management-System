from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os

# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY:
    print("✅ GROQ_API_KEY loaded successfully")
else:
    print("❌ GROQ_API_KEY NOT FOUND")

client = None

if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# SVKPI INFORMATION
# =========================================================

SVKPI_INFO = """
Institute Name:
Shree Vasudevbhai and Kantibhai Patel Institute of Engineering (SVKPIE)

Short Name:
SVKPI

Established:
2013

Location:
Meghna Campus, Kadi-Kalyanpura Road,
Nani Kadi, Kadi, District Mehsana, Gujarat, India.

Affiliation:
Gujarat Technological University (GTU)

Approval:
AICTE Approved

Official Website:
svkpinstitute.com

Contact Number:
02764-297185

Diploma Engineering Courses:
1. Computer Engineering
2. Mechanical Engineering
3. Electrical Engineering
4. Civil Engineering
5. Automobile Engineering

Course Duration:
3 years after Class 10.

Campus Facilities:
1. Classrooms
2. Technical Laboratories
3. Library
4. Workshop
5. IT Infrastructure
"""


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return "SVKPI AI Assistant Backend is Running"


# =========================================================
# CHATBOT PAGE
# =========================================================

@app.route("/chatbot")
def chatbot():
    frontend_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "frontendai")
    )

    return send_from_directory(
        frontend_path,
        "chatbot.html"
    )


# =========================================================
# CHAT API
# =========================================================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        # -------------------------------------------------
        # CHECK GROQ API
        # -------------------------------------------------

        if not GROQ_API_KEY or client is None:
            return jsonify({
                "reply": "❌ GROQ API key is not configured. Please check your .env file."
            }), 500


        # -------------------------------------------------
        # READ JSON SAFELY
        # -------------------------------------------------

        data = request.get_json(silent=True)

        print("\n========== CHAT REQUEST ==========")
        print("Content-Type:", request.content_type)
        print("Received Data:", repr(data))


        if data is None:
            return jsonify({
                "reply": "❌ Invalid JSON received by backend."
            }), 400


        if not isinstance(data, dict):
            return jsonify({
                "reply": "❌ JSON must contain an object."
            }), 400


        # -------------------------------------------------
        # GET USER MESSAGE
        # -------------------------------------------------

        user_message = data.get("message", "")

        if not isinstance(user_message, str):
            user_message = str(user_message)

        user_message = user_message.strip()


        if not user_message:
            return jsonify({
                "reply": "Please enter a message."
            }), 400


        # -------------------------------------------------
        # FRONTEND CONTEXT
        # -------------------------------------------------

        frontend_context = data.get("context", "")

        if not isinstance(frontend_context, str):
            frontend_context = str(frontend_context)


        # -------------------------------------------------
        # SYSTEM PROMPT
        # -------------------------------------------------

        system_prompt = f"""
You are SVKPI AI Assistant.

You are the AI assistant for:

Shree Vasudevbhai and Kantibhai Patel Institute of Engineering (SVKPIE).

==================================================
OFFICIAL SVKPI INFORMATION
==================================================

{SVKPI_INFO}

==================================================
IMPORTANT IDENTITY RULE
==================================================

SVKPI stands for:

Shree Vasudevbhai and Kantibhai Patel Institute of Engineering.

If the user asks:

"What is the full name of SVKPI?"

Answer:

"SVKPI stands for Shree Vasudevbhai and Kantibhai Patel Institute of Engineering."

==================================================
SVKPI INFORMATION RULE
==================================================

When the user asks about SVKPI:

- Use only the information provided above.
- Do not invent information.
- Do not guess faculty names.
- Do not guess fees.
- Do not guess admission dates.
- Do not guess departments.
- Do not guess phone numbers.
- Do not guess facilities.
- Do not guess official information.

If information is not available, say:

"I don't currently have that information in my SVKPI knowledge base."

==================================================
GENERAL EDUCATIONAL HELP
==================================================

You can help students with:

- Computer Engineering
- Programming
- Python
- HTML
- CSS
- JavaScript
- Assignments
- Study questions
- General educational questions
- Smart Campus Management System
- SVKPI-related questions

==================================================
FRONTEND CONTEXT
==================================================

The frontend may send additional context:

{frontend_context}

Use it only if it matches the official SVKPI information.

==================================================
RESPONSE STYLE
==================================================

Be friendly and professional.

Use simple language.

Use bullet points when useful.

Keep answers clear and easy to understand.

Do not make up information.
"""

        response = client.chat.completions.create(
         model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],

            temperature=0.3,
            max_tokens=1024
        )


        
        answer = response.choices[0].message.content


        print("AI Response:", answer)
        print("=================================\n")


        return jsonify({
            "reply": answer
        })


    except Exception as e:

        print("\n========================================")
        print("❌ AI ERROR")
        print("========================================")
        print(repr(e))
        print("========================================\n")

        return jsonify({
            "reply": "❌ Backend Error: " + str(e)
        }), 500


if __name__ == "__main__":

    print("\n========================================")
    print("🤖 SVKPI AI ASSISTANT")
    print("========================================")

    if GROQ_API_KEY:
        print("✅ Groq API Key: Loaded")
    else:
        print("❌ Groq API Key: Missing")

    print("🌐 Server: http://127.0.0.1:5000")
    print("💬 Chat API: http://127.0.0.1:5000/chat")
    print("========================================\n")

    app.run(
    host="0.0.0.0",
    port=int(os.environ.get("PORT", 5000)),
    debug=False
)