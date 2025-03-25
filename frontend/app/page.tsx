"use client"
import Image from "next/image";
import styles from "./page.module.css";
import Slider from '@mui/material/Slider';
import { useState } from "react";
import Paper from '@mui/material/Paper';
import { Box, FormControlLabel, Switch } from "@mui/material";


export default function Home() {
  const [valueLed9, setValueLed9] = useState<number>(30);
  const [valueLed10, setValueLed10] = useState<number>(30);
  const [valueLed11, setValueLed11] = useState<number>(30);

  const handleChange9 = (event: Event, newValue: number | number[]) => {
    setValueLed9(newValue as number);
  };

  const handleChange10 = (event: Event, newValue: number | number[]) => {
    setValueLed10(newValue as number);
  };

  const handleChange11 = (event: Event, newValue: number | number[]) => {
    setValueLed11(newValue as number);
  };

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <div className={styles.innerContainer}>
          <h1>Arduino settings</h1>
          <p>Led 9 intensity</p>
          <Slider aria-label="Led 9 intensity" value={valueLed9} onChange={handleChange9}/>
          <p>Led 10 intensity</p>
          <Slider aria-label="Led 10 intensity" value={valueLed10} onChange={handleChange10}/>
          <p>Led 11 intensity</p>
          <Slider aria-label="Led 11 intensity" value={valueLed11} onChange={handleChange11}/>
          <FormControlLabel control={<Switch />} label="Led 13" />
          <p>LDR intensity: 0</p>
        </div>
        
      </Paper>
    </div>
  );
}
