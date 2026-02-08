from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Quantum Circuit Visualizer Backend Running"

if __name__ == "__main__":
    app.run(debug=True)
