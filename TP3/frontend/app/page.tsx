'use client';
import React from "react";
import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Paper, Button } from "@mui/material";

const backendUrl = "http://192.168.100.99:8080";

export default function Home() {

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
    console.log("cargando datos");

    fetch(backendUrl + "/api/load_data", {
      method: "GET",
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
          <Button onClick={update_time} variant="outlined">Actualizar hora desde el servidor NTP</Button>
          <Button onClick={load_data} variant="outlined">Cargar datos desde EEPROM</Button>
          <Button onClick={delete_data} variant="outlined">Borrar datos de EEPROM</Button>

        </div>
      </Paper>
    </div>
  );
}
