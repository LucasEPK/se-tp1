'use client';
import React from "react";
import { useState, useEffect} from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Paper, Button } from "@mui/material";
import io from "socket.io-client";

const backendUrl = "http://192.168.100.99:8080";

const socket = io(backendUrl);

export default function Home() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    socket.on("read_events", (data) => {
      setText(String(data.events));
      console.log("read data: " + String(data.events));
    });
  }, [socket, text]);

  function update_time() {
    console.log("actualizando hora");
    
    fetch(backendUrl + "/api/update_time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  }

  function load_data() {
    setText("");
    console.log("cargando datos");

    fetch(backendUrl + "/api/load_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
  }

  function delete_data() {
    console.log("borrando datos");

    fetch(backendUrl + "/api/delete_data", {
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

          <h1>TP3: memoria EEPROM</h1>
          <Button onClick={update_time} variant="outlined">Actualizar hora desde servidor NTP</Button>
          <Button onClick={load_data} variant="outlined">Cargar datos desde EEPROM</Button>
          {text.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
          <Button onClick={delete_data} variant="outlined">Borrar datos de EEPROM</Button>

        </div>
      </Paper>
    </div>
  );
}
