from math import floor
from flask import Flask, request, jsonify
from flask_cors import CORS
import serial
from flask_socketio import SocketIO
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

CORS(app, resources={r"/*":{"origins": "*"}}, supports_credentials=True)
#TODO: make port an env variable
ser = serial.Serial(port='/dev/ttyACM1',
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

# Reads arduino serial port output, and sends it to frontend if string matches case
def read_serial():
    while True:
        if ser.in_waiting > 0:
            try:
                line = ser.readline().decode('utf-8').rstrip()
                #print(line)
                if line:
                    if line.startswith("LDR lux:"):
                        # Extract the luminosity value from the line
                        luminosity = line.split(":")[1].strip()
                        socketio.emit("update_ldr_luminosity", {"value": luminosity})
                    elif line.startswith("led "):
                        #"led "+ numberBuffer + " intensity: " + intensityBuffer
                        ledNumber = int(line[4:6])
                        intensity = int(line[18:21])
                        socketio.emit("update_led_luminosity", {"led": ledNumber, "luminosity": intensity})
                    #else:
                    #    print("not a case: ", line)
            except Exception as e:
                print(f"Error reading serial data: {e}")
        time.sleep(0.4)

threading.Thread(target=read_serial, daemon=True).start()

@socketio.on('connect')
def handle_connect():
    print("Client connected")

@app.route("/")
def hello_world():
    return "<p>Hello,"+cadena+" World!</p>"


@app.get("/ledLuminosity/<number>")
def get_led_luminosity(number):
    return f"LED {number} luminosity"

# Changes led number luminosity
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

#TODO: make host and port env variables
if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080, host="10.65.4.217")
