"use client"
import Image from "next/image";
import styles from "./page.module.css";
import Slider from '@mui/material/Slider';
import { ChangeEvent, useState } from "react";
import Paper from '@mui/material/Paper';
import { Switch } from "@mui/material";
import io from "socket.io-client";
import { useEffect } from "react";

// Gets data from environment
const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL
if (!backendURL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}


const socket = io(backendURL);

export default function Home() {
  const [valueLed9, setValueLed9] = useState<number>(0);
  const [valueLed10, setValueLed10] = useState<number>(0);
  const [valueLed11, setValueLed11] = useState<number>(0);
  const [led9Luminosity, setLed9Luminosity] = useState<any>(0);
  const [led10Luminosity, setLed10Luminosity] = useState<any>(0);
  const [led11Luminosity, setLed11Luminosity] = useState<any>(0);
  const [led13On, setLed13On] = useState<boolean>(false);
  const [LDRluminosity, setLDRluminosity] = useState<any>(null);

  useEffect(() => {
    socket.on('update_ldr_luminosity', (data) => {
      setLDRluminosity(data);
      console.log("got LDRluminosity: ", data);
    });
    
    socket.on('update_led_luminosity', (data1) => {
      if (data1.led === 9) {
        setLed9Luminosity(data1.luminosity);
      } else if (data1.led === 10) {
        setLed10Luminosity(data1.luminosity);
      } else if (data1.led === 11) {
        setLed11Luminosity(data1.luminosity);
      }
      console.log("got led", data1.led, " luminosity: ", data1.luminosity);
    });
    
  }, [socket, LDRluminosity, led9Luminosity, led10Luminosity, led11Luminosity]);

  async function handleChange9(event: Event, newValue: number | number[]) {
    setValueLed9(newValue as number);
    const response = await fetch(backendURL + '/ledLuminosity/9', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({luminosity: newValue}),
    });
    const data = await response.json();
    console.log(data);
  };

  async function handleChange10(event: Event, newValue: number | number[]){
    setValueLed10(newValue as number);
    const response = await fetch(backendURL + '/ledLuminosity/10', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({luminosity: newValue}),
    });
    const data = await response.json();
    console.log(data);
  };

  async function handleChange11(event: Event, newValue: number | number[]){
    setValueLed11(newValue as number);
    const response = await fetch(backendURL + '/ledLuminosity/11', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({luminosity: newValue}),
    });
    const data = await response.json();
    console.log(data);
  };

  async function switchLed(event: ChangeEvent, checked: boolean) {
    setLed13On(checked);
    // Sends a POST request to the backend with the new value of the switch
    const response = await fetch(backendURL + '/switchLed/13', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({on: checked}),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <div className={styles.innerContainer}>
          <h1>Arduino settings</h1>
          <p>Led 9 intensity: {led9Luminosity}</p>
          <Slider step={10} marks aria-label="Led 9 intensity" value={valueLed9} onChange={handleChange9}/>
          <p>Led 10 intensity: {led10Luminosity}</p>
          <Slider aria-label="Led 10 intensity" value={valueLed10} onChange={handleChange10}/>
          <p>Led 11 intensity: {led11Luminosity}</p>
          <Slider aria-label="Led 11 intensity" value={valueLed11} onChange={handleChange11}/>
          <p>Led 13 switch</p>
          <Switch onChange={switchLed}/>
          <p>LDR intensity: {LDRluminosity ? LDRluminosity.value : "waiting..."}</p>
        </div>
        
      </Paper>
    </div>
  );
}
