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
  const [alarmOn, setAlarmOn] = useState<boolean>(true);
  const [luminosity, setLuminosity] = useState<number>(0);

  useEffect(() => {
    socket.on("update_arduino_data", (data) => {
      setLuminosity(data.ldr_luminosity);
    });

  }, [socket, luminosity]);

  const switchLed = () => {
    console.log("Switch toggled");
  }

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <div className={styles.innerContainer}>

          <h1>TP2: freeRTOS</h1>
          <p>Luminosity: {luminosity}</p>
          <p>Analog Read:</p>
          <Switch defaultChecked onChange={switchLed}/>
          {alarmOn ? <Alert severity="warning">LUMINOSITY REACHED 800+ VALUE</Alert> : <p>Lucas Moyano</p>}
          
        </div>
      </Paper>
      
    </div>
  );
}
