from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv
import os
import base64
import sqlite3
import hashlib
import secrets


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

@app.route("/", methods=["GET"])
def home():

    return "SVKPI AI Assistant Backend is Running"


# =========================================================
# CHATBOT PAGE
# =========================================================

@app.route("/chatbot", methods=["GET"])
def chatbot():

    frontend_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "frontendai"
        )
    )

    return send_from_directory(
        frontend_path,
        "chatbot.html"
    )


# =========================================================
# CHAT API
# TEXT + IMAGE
# =========================================================

@app.route("/chat", methods=["POST"])
def chat():

    try:

        # =================================================
        # CHECK GROQ
        # =================================================

        if not GROQ_API_KEY or client is None:

            return jsonify({
                "reply": (
                    "❌ GROQ API key is not configured. "
                    "Please check your .env file."
                )
            }), 500


        # =================================================
        # REQUEST INFORMATION
        # =================================================

        print("\n========================================")
        print("📩 CHAT REQUEST")
        print("========================================")

        print(
            "Content-Type:",
            request.content_type
        )


        # =================================================
        # READ REQUEST DATA
        # JSON + FORM DATA SUPPORT
        # =================================================

        if request.is_json:

            data = request.get_json(silent=True) or {}

            user_message = data.get(
                "message",
                ""
            )

            frontend_context = data.get(
                "context",
                ""
            )

        else:

            user_message = request.form.get(
                "message",
                ""
            )

            frontend_context = request.form.get(
                "context",
                ""
            )


        if not isinstance(user_message, str):

            user_message = str(
                user_message
            )


        user_message = user_message.strip()


        if not isinstance(frontend_context, str):

            frontend_context = str(
                frontend_context
            )


        # =================================================
        # READ IMAGE
        # =================================================

        uploaded_image = request.files.get(
            "image"
        )


        print(
            "Message:",
            repr(user_message)
        )

        print(
            "Image:",
            uploaded_image.filename
            if uploaded_image
            else "No image"
        )


        # =================================================
        # CHECK EMPTY REQUEST
        # =================================================

        if not user_message and not uploaded_image:

            return jsonify({
                "reply": (
                    "Please enter a message "
                    "or upload an image."
                )
            }), 400


        # =================================================
        # SYSTEM PROMPT
        # =================================================

        system_prompt = f"""
You are SVKPI AI Assistant.

You are the AI assistant for:

Shree Vasudevbhai and Kantibhai Patel
Institute of Engineering (SVKPIE).

==================================================
OFFICIAL SVKPI INFORMATION
==================================================

{SVKPI_INFO}

==================================================
SVKPI INFORMATION RULES
==================================================

When the user asks about SVKPI:

- Use only the official information provided above.
- Do not invent information.
- Do not guess faculty names.
- Do not guess fees.
- Do not guess admission dates.
- Do not guess departments.
- Do not guess phone numbers.
- Do not guess facilities.

If the information is not available, say:

"I don't currently have that information
in my SVKPI knowledge base."

==================================================
IMAGE RULES
==================================================

If an image is uploaded:

- Carefully analyze the image.
- Describe only what is actually visible.
- Identify visible objects when possible.
- Read visible text when possible.
- Explain visible diagrams when possible.
- If the image contains a programming question,
  explain the visible code.
- If something cannot be determined,
  clearly say so.
- Do not pretend to see something that is not visible.

==================================================
GENERAL EDUCATIONAL HELP
==================================================

You can help with:

- Computer Engineering
- Programming
- C
- C++
- Java
- Python
- HTML
- CSS
- JavaScript
- Assignments
- Study questions
- Engineering concepts
- Smart Campus Management System

==================================================
FRONTEND CONTEXT
==================================================

{frontend_context}

Use frontend context only when it is relevant
and does not conflict with the official SVKPI information.

==================================================
RESPONSE STYLE
==================================================

Be friendly and professional.

Use simple language.

Use bullet points when useful.

Give clear answers.

Do not make up information.
"""


        # =================================================
        # IMAGE REQUEST
        # =================================================

        if uploaded_image:

            mime_type = uploaded_image.mimetype


            if not mime_type:

                return jsonify({
                    "reply": "❌ Image type could not be detected."
                }), 400


            if not mime_type.startswith("image/"):

                return jsonify({
                    "reply": "❌ Please upload a valid image."
                }), 400


            image_bytes = uploaded_image.read()


            if len(image_bytes) > 20 * 1024 * 1024:

                return jsonify({
                    "reply": (
                        "❌ Image must be smaller "
                        "than 20 MB."
                    )
                }), 400


            image_base64 = base64.b64encode(
                image_bytes
            ).decode("utf-8")


            image_url = (
                f"data:{mime_type};base64,"
                f"{image_base64}"
            )


            image_question = user_message


            if not image_question:

                image_question = (
                    "Please analyze this image and "
                    "tell me what is visible in it."
                )


            print(
                "🖼️ Sending image to vision model..."
            )


            response = client.chat.completions.create(

                model="qwen/qwen3.8-27b",

                messages=[

                    {
                        "role": "system",
                        "content": system_prompt
                    },

                    {
                        "role": "user",

                        "content": [

                            {
                                "type": "text",
                                "text": image_question
                            },

                            {
                                "type": "image_url",

                                "image_url": {
                                    "url": image_url
                                }
                            }

                        ]
                    }

                ],

                temperature=0.3,

                max_completion_tokens=1024
            )


        # =================================================
        # TEXT ONLY REQUEST
        # =================================================

        else:

            print(
                "💬 Sending text to text model..."
            )


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

                max_completion_tokens=1024
            )


        # =================================================
        # GET AI RESPONSE
        # =================================================

        answer = response.choices[0].message.content


        if not answer:

            answer = (
                "No response was received from the AI."
            )


        print(
            "🤖 AI Response:",
            answer
        )

        print(
            "========================================\n"
        )


        # =================================================
        # SEND RESPONSE
        # =================================================

        return jsonify({

            "reply": answer

        })


    except Exception as e:

        print("\n========================================")
        print("❌ AI ERROR")
        print("========================================")
        print(
            repr(e)
        )
        print("========================================\n")


        return jsonify({

            "reply":
                "❌ Backend Error: " + str(e)

        }), 500


# =========================================================
# STUDENT REGISTRATION DATABASE
# =========================================================

DATABASE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "students.db"
)


def init_student_database():

    conn = sqlite3.connect(DATABASE_PATH)

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            enrollment TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            mobile TEXT NOT NULL,
            department TEXT NOT NULL,
            semester TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def hash_password(password):

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

    return password_hash, salt


# =========================================================
# CREATE DATABASE AUTOMATICALLY
# =========================================================

init_student_database()


# =========================================================
# STUDENT REGISTRATION API
# =========================================================

@app.route("/register", methods=["POST"])
def register_student():

    try:

        data = request.get_json(silent=True)

        if not data:

            return jsonify({
                "success": False,
                "message": "No registration data received."
            }), 400


        full_name = str(
            data.get("fullName", "")
        ).strip()

        enrollment = str(
            data.get("enrollment", "")
        ).strip()

        email = str(
            data.get("email", "")
        ).strip().lower()

        mobile = str(
            data.get("mobile", "")
        ).strip()

        department = str(
            data.get("department", "")
        ).strip()

        semester = str(
            data.get("semester", "")
        ).strip()

        password = str(
            data.get("password", "")
        )

        confirm_password = str(
            data.get("confirmPassword", "")
        )


        # =================================================
        # REQUIRED FIELDS
        # =================================================

        if not all([
            full_name,
            enrollment,
            email,
            mobile,
            department,
            semester,
            password,
            confirm_password
        ]):

            return jsonify({
                "success": False,
                "message": "Please fill all required fields."
            }), 400


        # =================================================
        # PASSWORD CHECK
        # =================================================

        if password != confirm_password:

            return jsonify({
                "success": False,
                "message": "Passwords do not match."
            }), 400


        if len(password) < 6:

            return jsonify({
                "success": False,
                "message": (
                    "Password must contain at least 6 characters."
                )
            }), 400


        # =================================================
        # EMAIL VALIDATION
        # =================================================

        if "@" not in email or "." not in email:

            return jsonify({
                "success": False,
                "message": (
                    "Please enter a valid email address."
                )
            }), 400


        # =================================================
        # MOBILE VALIDATION
        # =================================================

        if not mobile.isdigit() or len(mobile) != 10:

            return jsonify({
                "success": False,
                "message": (
                    "Please enter a valid 10-digit mobile number."
                )
            }), 400


        # =================================================
        # PASSWORD HASH
        # =================================================

        password_hash, password_salt = hash_password(
            password
        )


        conn = sqlite3.connect(
            DATABASE_PATH
        )

        cursor = conn.cursor()


        # =================================================
        # CHECK EXISTING ACCOUNT
        # =================================================

        cursor.execute("""
            SELECT id
            FROM students
            WHERE enrollment = ? OR email = ?
        """, (
            enrollment,
            email
        ))


        existing_student = cursor.fetchone()


        if existing_student:

            conn.close()

            return jsonify({
                "success": False,
                "message": (
                    "An account with this enrollment number "
                    "or email already exists."
                )
            }), 409


        # =================================================
        # SAVE STUDENT
        # =================================================

        cursor.execute("""
            INSERT INTO students
            (
                full_name,
                enrollment,
                email,
                mobile,
                department,
                semester,
                password_hash,
                password_salt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (

            full_name,
            enrollment,
            email,
            mobile,
            department,
            semester,
            password_hash,
            password_salt

        ))


        conn.commit()
        conn.close()


        return jsonify({

            "success": True,

            "message":
                "Student account created successfully."

        }), 201


    except Exception as e:

        print(
            "❌ REGISTRATION ERROR:",
            repr(e)
        )


        return jsonify({

            "success": False,

            "message":
                "Server error during registration."

        }), 500


# =========================================================
# STUDENT LOGIN API
# =========================================================

@app.route("/login", methods=["POST"])
def login_student():

    try:

        data = request.get_json(silent=True)

        if not data:

            return jsonify({
                "success": False,
                "message": "No login data received."
            }), 400


        email = str(
            data.get("email", "")
        ).strip().lower()

        password = str(
            data.get("password", "")
        )


        # =================================================
        # REQUIRED LOGIN FIELDS
        # =================================================

        if not email or not password:

            return jsonify({
                "success": False,
                "message": (
                    "Please enter email and password."
                )
            }), 400


        # =================================================
        # FIND STUDENT
        # =================================================

        conn = sqlite3.connect(
            DATABASE_PATH
        )

        cursor = conn.cursor()


        cursor.execute("""
            SELECT
                id,
                full_name,
                enrollment,
                email,
                department,
                semester,
                password_hash,
                password_salt
            FROM students
            WHERE email = ?
        """, (
            email,
        ))


        student = cursor.fetchone()


        conn.close()


        # =================================================
        # ACCOUNT NOT FOUND
        # =================================================

        if not student:

            return jsonify({
                "success": False,
                "message": (
                    "Student account not found."
                )
            }), 401


        (
            student_id,
            full_name,
            enrollment,
            student_email,
            department,
            semester,
            stored_hash,
            stored_salt
        ) = student


        # =================================================
        # HASH LOGIN PASSWORD
        # =================================================

        login_hash = hashlib.pbkdf2_hmac(

            "sha256",

            password.encode("utf-8"),

            stored_salt.encode("utf-8"),

            100000

        ).hex()


        # =================================================
        # PASSWORD CHECK
        # =================================================

        if login_hash != stored_hash:

            return jsonify({
                "success": False,
                "message": (
                    "Incorrect email or password."
                )
            }), 401


        # =================================================
        # LOGIN SUCCESS
        # =================================================

        return jsonify({

            "success": True,

            "message":
                "Student login successful.",

            "student": {

                "id":
                    student_id,

                "fullName":
                    full_name,

                "enrollment":
                    enrollment,

                "email":
                    student_email,

                "department":
                    department,

                "semester":
                    semester

            }

        }), 200


    except Exception as e:

        print(
            "❌ LOGIN ERROR:",
            repr(e)
        )


        return jsonify({

            "success": False,

            "message":
                "Server error during login."

        }), 500


# =========================================================
# START FLASK SERVER
# IMPORTANT: THIS MUST BE AT THE VERY BOTTOM
# =========================================================

if __name__ == "__main__":

    print("\n========================================")
    print("🤖 SVKPI AI ASSISTANT")
    print("========================================")


    if GROQ_API_KEY:

        print(
            "✅ Groq API Key: Loaded"
        )

    else:

        print(
            "❌ Groq API Key: Missing"
        )


    print(
        "🌐 Server: http://127.0.0.1:5000"
    )

    print(
        "💬 Chat API: http://127.0.0.1:5000/chat"
    )

    print(
        "🖼️ Image AI: Enabled"
    )

    print(
        "📝 Student Registration API: /register"
    )

    print(
        "🔐 Student Login API: /login"
    )

    print(
        "========================================\n"
    )


    app.run(

        host="0.0.0.0",

        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        ),

        debug=False
    )