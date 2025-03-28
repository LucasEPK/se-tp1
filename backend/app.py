from math import floor
from flask import Flask, request, jsonify
from flask_cors import CORS
import serial

app = Flask(__name__)

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

@app.route("/")
def hello_world():
    #ser.flushInput()
    cadena = ser.readline().decode('utf-8')
    return "<p>Hello,"+cadena+" World!</p>"

@app.route("/send9")
def send_9():
    cadena = "9"
    ser.write(cadena.encode('utf-8'))
    return "<p>9 sent</p>"

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
