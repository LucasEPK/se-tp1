from math import floor
from flask import Flask, request, jsonify
from flask_cors import CORS
import serial
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

CORS(app, resources={r"/*":{"origins": "*"}}, supports_credentials=True)

ser = serial.Serial(port='/dev/ttyACM0',
                    baudrate=9600,
                    bytesize=serial.EIGHTBITS,
                    parity=serial.PARITY_NONE,
                    stopbits=serial.STOPBITS_ONE,
                    timeout=1,
                    xonxoff=False,
                    rtscts=False,
                    dsrdtr=False,
                    inter_byte_timeout=None,
                    exclusive=None)

led9luminosity = 0
i= 0

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@socketio.on("get_data")
def send_data():
    socketio.emit("update_data", {"value": i})
    print("Sending data to client")
    i += 1

@app.route("/")
def hello_world():
    #ser.flushInput()
    cadena = ser.readline().decode('utf-8')
    return "<p>Hello,"+cadena+" World!</p>"


@app.get("/ledLuminosity/<number>")
def get_led_luminosity(number):
    return f"LED {number} luminosity"

@app.post("/ledLuminosity/<number>")
def post_led_luminosity(number):
    data = request.get_json()
    luminosity = data.get('luminosity', 0)

    analogLuminosity = floor((luminosity/100) * 255)

    cadena = "led " + number + " set luminosity to: " + str(analogLuminosity)
    ser.write(cadena.encode('utf-8'))

    return jsonify({'led': number, 'luminosity': analogLuminosity})

# Switches on and off arduino leds (it works only on led 13 for now)
@app.post("/switchLed/<number>")
def switch_led(number):
    data = request.get_json()
    isOn = data.get('on', False)

    # Sends the command to the Arduino
    cadena = "switch led " + number + ":" + str(isOn)
    ser.write(cadena.encode('utf-8'))

    return jsonify({'led': number, 'on': isOn})

if __name__ == "__main__":
    socketio.run(app, debug=True)
