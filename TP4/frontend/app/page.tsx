'use client';
import React from "react";
import { useState, useEffect} from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Paper, Button, Alert } from "@mui/material";
import io from "socket.io-client";
import SaveIcon from "@mui/icons-material/Save";


const backendUrl = "http://192.168.100.99:8080";

const socket = io(backendUrl);

let luxThreshold = 10000; // Lux threshold for plant health

export default function Home() {
  const [luxPerMinute, setLuxPerMinute] = useState<number>(0);
  const [firstButton, setFirstButton] = useState(
    <Button onClick={getLuxPerMinute} variant="outlined">Obtener luminosidad por minuto</Button>
  );
  const [response, setResponse] = useState(<> </>);

  useEffect(() => {
      socket.on("update_luminosity_per_minute", (data) => {
        setLuxPerMinute(data.luminosity);
        console.log("read luminosity: " + String(data.luminosity));

        setResponse(
          data.luminosity >= luxThreshold ? (
            <Alert severity="success">La planta tiene la suficiente luminosidad</Alert>
          ) : (
            <Alert severity="warning">La planta no tiene la suficiente luminosidad</Alert>
          )
        );
        setFirstButton(
          <Button onClick={getLuxPerMinute} variant="outlined">Obtener luminosidad por minuto</Button>
        );
      });
  }, [socket, luxPerMinute]);

  function getLuxPerMinute() {
    console.log("Obteniendo luminosidad por minuto");
    setFirstButton(
      <Button fullWidth loading loadingPosition="start" startIcon={<SaveIcon/>} variant="outlined">
        Obteniendo luminosidad, espere un minuto...
      </Button>
    );
    fetch(backendUrl + "/api/get_luminosity_per_minute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
    });
  }

  return (
    <div className={styles.container}>
      <Paper elevation={3} className={styles.paper}>

        <div className={styles.innerContainer}>

          <h1>TP integrador: luminosidad para plantas de vid</h1>
          <p>Limite de lux: {luxThreshold}</p>
          <p>Luminosidad por minuto: {luxPerMinute}</p>
          {firstButton}
          {response}
        </div>
      </Paper>
    </div>
  );
}
