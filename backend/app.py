from flask import Flask
import serial

app = Flask(__name__)

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

@app.get("/led/<number>")
def get_led_luminosity(number):
    return f"LED {number} luminosity"

@app.post("/led/<number>")
def post_led_luminosity(number):
    led9luminosity = number