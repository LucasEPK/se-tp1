"use client"
import Image from "next/image";
import styles from "./page.module.css";
import Paper from '@mui/material/Paper';
import { Alert, Switch } from "@mui/material";
import { useState, useEffect } from "react";
import io from "socket.io-client";

const backendUrl = "http://192.168.100.99:8080";

const socket = io(backendUrl);

export default function Home() {
  const [alarmOn, setAlarmOn] = useState<boolean>(false);
  const [luminosity, setLuminosity] = useState<number>(0);
  const [analogReadOn, setAnalogReadOn] = useState<boolean>(true);

  useEffect(() => {
    // receives luminosity data from the backend and sets alarm on if > 800
    socket.on("update_arduino_data", (data) => {
      setLuminosity(data.ldr_luminosity);

      if (data.ldr_luminosity > 800) {
        setAlarmOn(true);
      }
    });

    // receives analog read on/off data from the backend and sets alarm off if analog read is off
    socket.on("update_analog_read_on", (data) => {
      if (analogReadOn != data.analog_read_on) {
        setAnalogReadOn(data.analog_read_on);
      }

      if (! data.analog_read_on) {
        setAlarmOn(false);
      }
    });
  }, [socket, luminosity, analogReadOn]);

  // Sends post request to the backend to switch the analog read on or off and 
  // turns alarm off if analog read is off
  async function switchRead() {
    setAnalogReadOn(!analogReadOn);

    if (analogReadOn == true) {
      setAlarmOn(false);
    }

    const response = await fetch(`${backendUrl}/api/switch_analog_read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ analogReadOn: !analogReadOn }),
    });
    const data = await response.json();

  
  }

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <div className={styles.innerContainer}>

          <h1>TP2: freeRTOS</h1>
          <p>Luminosity: {luminosity}</p>
          <p>Analog Read:</p>
          <Switch checked={analogReadOn} onChange={switchRead}/>
          {alarmOn ? <Alert severity="warning">LUMINOSITY REACHED 800+ VALUE</Alert> : <p>Lucas Moyano</p>}
          
        </div>
      </Paper>
      
    </div>
  );
}
