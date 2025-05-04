int trig=5;
int echo=4;

String receivedInput;

int intensityLed9;
int intensityLed10;
int intensityLed11;

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(A3, INPUT);
  Serial.begin(9600, SERIAL_8N1);
}

void loop() {
  //makeLedBlink(13);
  receivedInput = receiveInput();
  handleInput(receivedInput);
  printLdrAnalogOutput();
  printLedsAnalogOutput();
  Serial.println();
  delay(1000); //one second
}

void changeLedIntensity(int number, int intensity) {
  pinMode(number, OUTPUT);
  analogWrite(number, intensity);

  switch (number) {
    case 9:
      intensityLed9 = intensity;
      break;
    case 10:
      intensityLed10 = intensity;
      break;
    case 11:
      intensityLed11 = intensity;
      break;
  }
  //char numberBuffer[3];
  //char intensityBuffer[4];
  //sprintf(numberBuffer, "%02d", number);
  //sprintf(intensityBuffer, "%03d", intensity);

  //Serial.println("led "+ String(numberBuffer) + " intensity: " + String(intensityBuffer));
}

void makeLedBlink(int number) {
  pinMode(number, OUTPUT);
  digitalWrite(number, HIGH); // turn the LED on (HIGH is the voltage level)
  delay(500);
  digitalWrite(number, LOW); // turn the LED off by making the voltage LOW
  delay(500);
}

void printLdrAnalogOutput() {
  char ldrLuxBuffer[5];
  sprintf(ldrLuxBuffer, "%04d", analogRead(A3));
  Serial.print("LDR lux: " + String(ldrLuxBuffer));
}

void printLedsAnalogOutput() {
  char intensityBufferLed9[4];
  char intensityBufferLed10[4];
  char intensityBufferLed11[4];
  sprintf(intensityBufferLed9, "%03d", intensityLed9);
  sprintf(intensityBufferLed10, "%03d", intensityLed10);
  sprintf(intensityBufferLed11, "%03d", intensityLed11);

  Serial.print(", led 9 intensity: "+ String(intensityBufferLed9) + ", led 10 intensity: "+ String(intensityBufferLed10) + ", led 11 intensity: " + String(intensityBufferLed11));
}

String receiveInput() {
  String string_recibido;
  if (Serial.available()>0) {
    string_recibido = Serial.readStringUntil('\n');
  }
  return string_recibido;
}

void handleInput(String input) {
  if (input == "switch led 13:True"){
    digitalWrite(13, HIGH);
  } else if (input == "switch led 13:False") {
    digitalWrite(13, LOW);
  } else if (input.startsWith("led 9 set luminosity to: ")){
    String cadena = "led 9 set luminosity to: ";
    int luminosity = input.substring(cadena.length(), input.length()).toInt();
    changeLedIntensity(9, luminosity);
  } else if (input.startsWith("led 10 set luminosity to: ")){
    String cadena = "led 10 set luminosity to: ";
    int luminosity = input.substring(cadena.length(), input.length()).toInt();
    changeLedIntensity(10, luminosity);
  } else if (input.startsWith("led 11 set luminosity to: ")){
    String cadena = "led 11 set luminosity to: ";
    int luminosity = input.substring(cadena.length(), input.length()).toInt();
    changeLedIntensity(11, luminosity);
  }
}