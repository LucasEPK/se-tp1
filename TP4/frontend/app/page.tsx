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
  return (
    <div className={styles.page}>
    
    </div>
  );
}
