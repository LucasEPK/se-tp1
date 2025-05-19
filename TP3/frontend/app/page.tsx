'use client';
import React from "react";
import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { Paper, Button } from "@mui/material";

export default function Home() {

  function update_time() {
    console.log("actualizando hora");
  
  }

  function load_data() {
    console.log("cargando datos");
  }

  function delete_data() {
    console.log("borrando datos");
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
