#include <EEPROM.h>

long int segundos = 0;

int addressEEPROM = 0;

void setup() {
  // put your setup code here, to run once:

  Serial.begin(9600);
  //clearEEPROM();
  initializeEEPROM();
  buttonsSetup();
}

void buttonsSetup() {
  pinMode(2, INPUT);
  attachInterrupt(digitalPinToInterrupt(2), pin2Pressed, RISING);

  pinMode(3, INPUT);
  attachInterrupt(digitalPinToInterrupt(3), pin3Pressed, RISING);
}

void loop() {
  // put your main code here, to run repeatedly:
  updateTime();
  readSerial();
}

void updateTime() {
  delay(1000);
  segundos += 1;
  Serial.print("segundos: ");
  Serial.println(segundos);
}


void saveToEEPROM(long int secs, char event) {
  
  if (addressEEPROM >= EEPROM.length()) {
    Serial.println("EEPROM FULL");
    return;
  }

  EEPROM.put(addressEEPROM, secs);
  addressEEPROM += sizeof(long);

  EEPROM.put(addressEEPROM, event);
  addressEEPROM += sizeof(char);

  EEPROM.put(0, addressEEPROM);
}

// Ponemos cuanta memoria hemos usado en la posición 0 de la memoria
void initializeEEPROM() {
  int memory_used;
  EEPROM.get(0, memory_used);
  Serial.print("memory_used: ");
  Serial.println(memory_used);
  if (memory_used == -1) { // Memoria vacía
    Serial.println("new memory");
    addressEEPROM = 0;
    addressEEPROM += sizeof(int);
    EEPROM.put(0, addressEEPROM);
  } else { // memoria ocupada
    Serial.println("used_memory");
    addressEEPROM = memory_used;
  }
}

void clearEEPROM() {
  for (int i = 0; i < EEPROM.length(); i++) {
    EEPROM.write(i, 0xFF);  // 0xFF is the default erased value
  }
}

void readEEPROM() {
  int memory_used;
  EEPROM.get(0, memory_used);
  Serial.print("_eeprom");
  //Serial.print("memory_used: ");
  //Serial.println(memory_used);

  long int secs;
  char event;
  for (int i= sizeof(int); i < EEPROM.length(); i += sizeof(long) + sizeof(char)) {
    EEPROM.get(i, secs);
    if (secs == -1) { // breaks if we reached last good data
      break;
    }
    Serial.print(' ');
    Serial.print(secs);

    Serial.print(':');

    EEPROM.get(i + sizeof(long), event);
    Serial.print(event);
  }
  Serial.print('\n');
}

void readSerial() {
  String input = "";

  if (Serial.available()) {
    input = Serial.readStringUntil('\n');

    Serial.print("serial read[5]:");
    Serial.println(input.substring(0,5));
    if (input.substring(0, 5) == "time:") {
      segundos = (input.substring(5)).toInt();
      Serial.print("update seconds to: ");
      Serial.println(segundos);
    } else if (input == "load") {
      readEEPROM();
    } else if (input == "delete") {
      clearEEPROM();
      initializeEEPROM();
    }
  }
}

void pin2Pressed() {
  saveToEEPROM(segundos, '2');
}

void pin3Pressed() {
  saveToEEPROM(segundos, '3');
}
