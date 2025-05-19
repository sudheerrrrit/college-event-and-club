from flask import Flask, request, jsonify
from flask_cors import CORS
from sentiment import analyze_sentiment

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# In-memory store for feedback data
feedback_data = []

@app.route("/api/feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    event = data.get("event")
    message = data.get("message")
    if not event or not message:
        return jsonify({"error": "Event and message are required"}), 400

    sentiment = analyze_sentiment(message)
    feedback_entry = {"event": event, "message": message, "sentiment": sentiment}
    feedback_data.append(feedback_entry)
    return jsonify({"status": "success", "sentiment": sentiment})

@app.route("/api/summary", methods=["GET"])
def summary():
    summary_counts = {"positive": 0, "negative": 0, "neutral": 0}
    for entry in feedback_data:
        summary_counts[entry["sentiment"]] += 1
    return jsonify(summary_counts)

if __name__ == "__main__":
    app.run(debug=True)
