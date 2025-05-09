from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
import serial
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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

# Reads arduino serial port output, and sends it to frontend if string matches case
def read_serial():
    while True:
        if ser.in_waiting > 0:
            try:
                line = ser.readline().decode('utf-8').rstrip()
                
                if line:
                    if line.startswith("luminosity:"):
                        # luminosity: 0000
                        # Extract the luminosity value from the line
                        ldrLuminosity = int(line[12:16])
                        print("LDR luminosity: ", ldrLuminosity)
                        
                        socketio.emit("update_arduino_data", {"ldr_luminosity": ldrLuminosity})
                    #else:
                    #    print("not a case: ", line)
            except Exception as e:
                print(f"Error reading serial data: {e}")
        time.sleep(1.0)

threading.Thread(target=read_serial, daemon=True).start()

@socketio.on('connect')
def handle_connect():
    print("Client connected")

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080, host="192.168.100.99")