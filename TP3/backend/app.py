import ntplib
from time import ctime, sleep
import threading

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
import serial

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

cliente = ntplib.NTPClient() 
response = cliente.request('pool.ntp.org', version=3)
print("Hora unix: ", str(round(response.tx_time)))
print("Hora traducida: ", ctime(response.tx_time))

# Reads arduino serial port output, and sends it to frontend if string matches case
def read_serial():
    while True:
        if ser.in_waiting > 0:
            try:
                line = ser.readline().decode('utf-8').rstrip()
                
                if line:
                    if line.startswith("segundos: "):
                        actual_time = ctime(int(line[10:]))
                        print("Hora actual: ", actual_time)
                    if line.startswith("_eeprom"):
                        #_eeprom 10:d 10:d 23:o 23:o 0:2 0:2 0:2 0:3 0:3 4:3 9:2 9:2 9:2
                        events = line.split(" ")[1:] # [1:] to skip the "_eeprom" part
                        events_string = ""
                        for event in events:
                            
                            secs, event_type = event.split(":")
                            secs = ctime(int(secs))
                            if event_type == '2':
                                event_type = 'Apretado botón 2'
                            elif event_type == '3':
                                event_type = 'Apretado botón 3'
                            
                            events_string += f"{secs} - {event_type}\n"
                            print(f"Time: {secs}, Event Type: {event_type}")
                        socketio.emit('read_events', {'events': events_string})
                    else:
                        print("not a case: ", line)
                
            except Exception as e:
                print(f"Error reading serial data: {e}")
        sleep(1.0)

threading.Thread(target=read_serial, daemon=True).start()

@app.post('/api/update_time')
def update_time():
    response = cliente.request('pool.ntp.org', version=3)
    time = 'time:' + str(round(response.tx_time))
    ser.write(time.encode('utf-8'))
    return {"time": time}

@app.post('/api/load_data')
def load_data():
    ser.write('load'.encode('utf-8'))
    return {"data": "data"}

@app.post('/api/delete_data')
def delete_data():
    cadena = 'delete'
    ser.write(cadena.encode('utf-8'))
    return {"data": "data"}

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080, host="192.168.100.99")
