import ntplib
from time import ctime

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
import serial

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

#ser = serial.Serial(port='/dev/ttyACM0',
#                    baudrate=9600,
#                    bytesize=serial.EIGHTBITS,
#                    parity=serial.PARITY_NONE,
#                    stopbits=serial.STOPBITS_ONE,
#                    timeout=1,
#                    xonxoff=False,
#                    rtscts=False,
#                    dsrdtr=False,
#                    inter_byte_timeout=None,
#                    exclusive=None)

cliente = ntplib.NTPClient() 
response = cliente.request('pool.ntp.org', version=3)
print("Hora unix: ", str(round(response.tx_time)))
print("Hora traducida: ", ctime(response.tx_time))

@app.post('/api/pass_time')
def pass_time():
    response = cliente.request('pool.ntp.org', version=3)
    time = str(round(response.tx_time))
    ser.write(time.encode('utf-8'))
    return {"time": time}

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080, host="localhost")
