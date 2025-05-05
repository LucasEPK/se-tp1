"use client"
import Image from "next/image";
import styles from "./page.module.css";
import Paper from '@mui/material/Paper';
import { Alert, Switch } from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [alarmOn, setAlarmOn] = useState<boolean>(true);

  const switchLed = () => {
    console.log("Switch toggled");
  }

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <div className={styles.innerContainer}>

          <h1>TP2: freeRTOS</h1>
          <p>Luminosity: 0</p>
          <p>Analog Read:</p>
          <Switch defaultChecked onChange={switchLed}/>
          {alarmOn ? <Alert severity="warning">LUMINOSITY REACHED 800+ VALUE</Alert> : <p>Lucas Moyano</p>}
          
        </div>
      </Paper>
      
    </div>
  );
}
